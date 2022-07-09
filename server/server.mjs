import { generateUuid, generateRoomCode } from './utilities/generators.mjs'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {});

// will be changed to a database at some point
const rooms = {'': {} };

io.on('connection', socket => {
  socket.join(room)
});

app.post('/createroom', (req, res) => {
  console.log(`received create room request with UUID ${req.body.userId}`);
  const uuid  = req.body.userId;
  let newRoomCode = 'ABCD'
  while (1) {
    newRoomCode = generateRoomCode();
    console.log(`generating new room code ${newRoomCode}...`)
    if (!(newRoomCode in rooms)) {
      break;
    }
  }

  console.log(`new room code is ${newRoomCode}`)
  
  rooms.newRoomCode = {admin: uuid, players: [], gamePhase: "lobby"};
  res.status(201).send({ newRoomCode });
});

app.get('/uuid', (req, res) => {
  const uuid = generateUuid();
  console.log(`new UUID: ${uuid}`);
  res.send({ uuid });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
