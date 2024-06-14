import { generateRoomCode } from './utilities/generateUtils.js';
import { Room, retrieveCardInfo } from './gameClasses.js';
import socketHandler from './models/sockets.js';
import { roomCleaner } from './utilities/roomCleaner.js';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';


const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ['\'self\'', 'https://frinkiac.com', 'data:'],
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

// sets up socket connection logic
socketHandler(io, rooms);

// allows users to get the card info for a card
app.get('/api/cardinfo/:cardId', (req, res) => {
  const { cardId } = req.params;
  console.log(`received request for card info for card ${cardId}`);
  res.send(retrieveCardInfo(cardId));
});

// allows users to create a new room
app.post('/api/room', (req, res) => {
  console.log(`received create room request with UUID ${req.body.userId}`);
  const uuid  = req.body.userId;
  if (!uuid) {
    res.status(403).send({error: 'User does not have UUID. Refresh page and try again.'});
  }
  let newRoomCode = 'ABCD';

  // generate new room codes until one is unused
  do {
    newRoomCode = generateRoomCode();
  } while (newRoomCode in rooms);

  console.log(`new room code is ${newRoomCode}`);
  rooms[newRoomCode] = new Room(uuid);
  res.status(201).send({ newRoomCode });
});

// serves react app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(path.dirname(''), './client/dist', 'index.html'));
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
