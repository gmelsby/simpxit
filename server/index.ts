import { generateRoomCode } from './utilities/generateUtils.js';
import { Room, retrieveCardInfo } from './gameClasses.js';
import { roomCleaner } from './utilities/roomCleaner.js';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import path from 'node:path';


const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "https://frinkiac.com", "data:"],
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors());

// allows static content from react app build
app.use(express.static(path.resolve(path.dirname(''), './client/dist')));

const server = createServer(app);
const io = new Server(server, {
  pingTimeout:5000,
  pingInterval:6000,
  }
);

// will probably be changed to a database/redis? at some point
const rooms: {[key: string]: Room} = {};
roomCleaner(rooms, '*/30 * * * *', 30);

io.on('connection', socket => {
  //console.log(`connection made: ${socket.id}`);

  socket.on('joinRoom', (request, callback) => {
    const { roomId, userId } = request;
    //console.log(`attempt to join room: roomId: ${roomId}, userId: ${userId}`);

    if (!(roomId in rooms)) {
      //console.log('room does not exist');
      return callback("Room not found");
    }
    
    if (rooms[roomId].isKicked(userId)) {
      //console.log('user has been kicked from room previously');
      return callback("You have been kicked from this room");
    }

    if (rooms[roomId].isCurrentPlayer(userId)) {
      //console.log(`${userId} is current player`);
      socket.join(roomId);
      io.to(socket.id).emit("receiveRoomState", rooms[roomId]);
      //console.log(`sending room data to socketid ${socket.id}`);
      return;
    }
    
    else {
      if (!rooms[roomId].isJoinable()) {
        //console.log(`${userId} could not join room: room is full`)
        return callback("Room is full");
      }
      
      //console.log(`adding ${userId} to player list`)
      rooms[roomId].addPlayer(userId);
      socket.join(roomId);
    }
    
    //console.log(`playerId ${userId} has joined room ${roomId}`);
    
    //console.log(`player list = ${JSON.stringify(rooms[roomId].players)}`)

    io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    callback();
  });
  
  socket.on("kickPlayer", request => {
    const { roomId, userId, kickUserId } = request;
    if (rooms[roomId] && rooms[roomId].kickPlayer(userId, kickUserId)) {
      //console.log(`kicked player ${kickUserId}`);
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    else {
      //console.log(`could not kick player ${kickUserId}`);
    }
  });

  socket.on("leaveRoom", (request, callback) => {
    const { roomId, userId } = request;
    //console.log(`player ${userId} attempting to leave room ${roomId}`);
    if (rooms[roomId] === undefined) {
      //console.log("left room does not exist")
      return callback("Room does not exist");
    }
    if (rooms[roomId].removePlayer(userId)) {
      //console.log("player removed successfully");
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    else {
      //console.log("unable to remove player");
    }
  });
  
  socket.on("changeName", request => {
    const { roomId, userId, newName } = request;
    const trimmedNewName = newName.trim();
    //console.log(`player ${userId} attempting to change name to ${trimmedNewName}`);
    if (rooms[roomId] && rooms[roomId].changeName(userId, trimmedNewName)) {
      //console.log("name changed");
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    else {
      //console.log("unable to change name");
    }
  });

  socket.on("changeOptions", request => {
    const { roomId, userId, newOptions } = request;
    //console.log(`player ${userId} attempting to change options to ${newOptions}`);
    if (rooms[roomId] && rooms[roomId].changeOptions(userId, newOptions)) {
      //console.log("options changed");
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    else {
      //console.log("unable to change options");
    }
  });
  
  socket.on("startGame", request => {
    const { roomId, userId } = request;
    //console.log(`player ${userId} attempting to start game in room ${roomId}`);
    if (rooms[roomId] && rooms[roomId].startGame(userId)) {
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
      //console.log("game started. populating hands...")
      rooms[roomId].populateHands() 
        .then(bool => {
          if (bool) {
            //console.log("hands populated");
            io.to(roomId).emit("receiveRoomState", rooms[roomId]);
          }
          else {
            //console.log("unable to start game");
          }
        });
    }
    
    else {
      //console.log("unable to start game");
    }
    
  });
  
  socket.on("submitStoryCard", request => {
    const { roomId, userId, selectedCard, descriptor } = request;
    if (rooms[roomId] && rooms[roomId].submitStoryCard(userId, selectedCard, descriptor.trim())) {
      //console.log(`Story card ${selectedCard.cardId} submitted by ${userId}`);
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    
    else {
      //console.log("unable to submit story card")
    }
    
  });

  socket.on("submitOtherCard", request => {
    const { roomId, userId, selectedCard} = request;
    if (rooms[roomId] && rooms[roomId].submitOtherCard(userId, selectedCard)) {
      //console.log(`Other card ${selectedCard.cardId} submitted by ${userId}`);
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
    
    else {
      //console.log("unable to submit other card");
    }
  });
  
  socket.on("guess", request => {
    //console.log('received guess');
    const {roomId, userId, selectedCard} = request;
    if (rooms[roomId] && rooms[roomId].makeGuess(userId, selectedCard.cardId)) {
      //console.log(`${userId} made guess`)
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
  });
  
  socket.on("endScoring", request => {
    //console.log('received end scoring request');
    const {roomId, userId} = request;
    if (rooms[roomId] && rooms[roomId].endScoring(userId)) {
      rooms[roomId].populateHands()
        .then(bool => {
          if (bool) {
            //console.log("request accepted");
            io.to(roomId).emit("receiveRoomState", rooms[roomId]);
          }
          else {
            //console.log("unable to end scoring");
          }
        })
      io.to(roomId).emit("receiveRoomState", rooms[roomId]);
    }
  });

});



// allows users to get the card info for a card
app.get('/api/cardinfo/:cardId', (req, res) => {
  const { cardId } = req.params;
  //console.log(`received request for card info for card ${cardId}`);
  res.send(retrieveCardInfo(cardId));
})

// allows users to create a new room
app.post('/api/room', (req, res) => {
  //console.log(`received create room request with UUID ${req.body.userId}`);
  const uuid  = req.body.userId;
  if (!uuid) {
    res.status(403).send({error: "User does not have UUID. Refresh page and try again."});
  }
  let newRoomCode = 'ABCD'

  while (1) {
    newRoomCode = generateRoomCode();
    if (!(newRoomCode in rooms)) {
      break;
    }
  }

  //console.log(`new room code is ${newRoomCode}`)
  
  rooms[newRoomCode] = new Room(uuid);
  res.status(201).send({ newRoomCode });
});

// serves react app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.resolve(path.dirname(''), './client/dist', 'index.html'))
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
