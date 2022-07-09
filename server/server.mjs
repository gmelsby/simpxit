import { generateUuid, generateRoomCode } from './utilities/generateUtils.mjs';
import { Room, Player, Card } from './utilities/gameClasses.mjs';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";


const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000"
  }
});

// will be changed to a database at some point
const rooms = {};

io.on('connection', socket => {
  console.log('connection made');
  socket.on('joinRoom', (request, callback) => {
    const { roomId, userId } = request;
    console.log(`attempt to join room: roomId: ${roomId}, userId: ${userId}`);

    if (!(roomId in rooms)) {
      console.log('room does not exist');
      return callback("Room not found");
    }
    
    if (rooms[roomId].isCurrentPlayer(userId)) {
      console.log(`${userId} is current player`)
      socket.join(roomId);
    }
    
    else {

      if (!rooms[roomId].isJoinable()) {
        console.log(`${userId} could not join room: room is full`)
        return callback("Room is full");
      }
      
      console.log(`adding ${userId} to player list`)
      rooms[roomId].addPlayer(userId);
      socket.join(roomId);
    }
    
    console.log(`playerId ${userId} has joined room ${roomId}`);
    
    console.log(`player list = ${JSON.stringify(rooms[roomId].players)}`)

    io.to(roomId).emit(rooms.roomId);
    callback();
  })
});

app.post('/createroom', (req, res) => {
  console.log(`received create room request with UUID ${req.body.userId}`);
  const uuid  = req.body.userId;
  let newRoomCode = 'ABCD'
  while (1) {
    newRoomCode = generateRoomCode();
    if (!(newRoomCode in rooms)) {
      break;
    }
  }

  console.log(`new room code is ${newRoomCode}`)
  
  rooms[newRoomCode] = new Room(uuid);
  console.log(`new room player list: ${JSON.stringify(rooms[newRoomCode].players)}`)
  res.status(201).send({ newRoomCode });
});

app.get('/uuid', (req, res) => {
  const uuid = generateUuid();
  console.log(`new UUID: ${uuid}`);
  res.send({ uuid });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
