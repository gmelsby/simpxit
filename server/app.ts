import { generateRoomCode } from './utilities/generateUtils.js';
import { Room } from './models/gameClasses.js';
import socketHandler from './controllers/sockets.js';
import { roomCleaner, supabasePing } from './utilities/cronJobs.js';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';
import { retrieveCardInfo } from './models/cardModel.js';
import { GameCard, ClientToServerEvents, ServerToClientEvents } from '../types.js';
import { createLogger, format, transports } from 'winston';

const PORT = process.env.PORT || 3000;

export const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({stack: true}),
    format.splat(),
    format.json()),
  transports: [new transports.Console()]
});

const app = express();
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ['\'self\'', `${process.env.IMAGE_BUCKET}`, 'data:'],
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors());

// allows static content from react app build
app.use(express.static(path.resolve(path.dirname(''), './client/dist')));

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  pingTimeout:5000,
  pingInterval:6000,
}
);

// will probably be changed to a database/redis? at some point
const rooms: {[key: string]: Room} = {};
roomCleaner(rooms, '*/30 * * * *', 30);
supabasePing('0 5 * * *');

// sets up socket connection logic
socketHandler(io, rooms);

// for caching card info, clears every 2 minutes
let cardInfoCache: { [key: string]: GameCard } = {};
setInterval(() => {
  logger.info('clearing cardInfoCache');
  cardInfoCache = {};
}, 1000 * 60 * 2);


// allows users to get the card info for a card
app.get('/api/cardinfo/:cardIdString', async (req, res) => {
  const { cardIdString } = req.params;

  logger.info(`received request for card info for card ${cardIdString}`);
  // card info based on id should not change, so set Cache-Control very high
  res.set('Cache-Control', 'public, max-age=31557600');

  // case where value was cached
  if (Object.keys(cardInfoCache).includes(cardIdString)) {
    logger.info('returning cached value');
    res.send(cardInfoCache[cardIdString]);
    return;
  }

  // check that cardIdString is parsable as bigint
  let cardId = BigInt(0);
  try {
    cardId = BigInt(cardIdString);
  } catch (err) {
    res.status(400);
    res.send('query param was unable to be parsed as a bigint');
    return;
  }

  const cardInfo = await retrieveCardInfo(cardId);

  if (cardInfo === null) {
    res.status(404).send('card not found');
    return;
  }

  // cache result to minimize db calls
  cardInfoCache[cardIdString] = cardInfo;

  res.send(cardInfo);
});

// allows users to create a new room
app.post('/api/room', (req, res) => {
  logger.info(`received create room request with UUID ${req.body.userId}`);
  const uuid  = req.body.userId;
  if (!uuid) {
    res.status(403).send({error: 'User does not have UUID. Refresh page and try again.'});
    return;
  }
  let newRoomCode = 'ABCD';

  // generate new room codes until one is unused
  do {
    newRoomCode = generateRoomCode();
  } while (newRoomCode in rooms);

  logger.info(`new room code is ${newRoomCode}`);
  rooms[newRoomCode] = new Room(uuid);
  res.status(201).send({ newRoomCode });
});


// basic healthcheck
app.get('/api/healthcheck', (req, res) => {
  res.status(200).send();
});

// serves react app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(path.dirname(''), './client/dist', 'index.html'));
});


server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}...`);
});
