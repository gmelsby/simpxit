import { createClient } from 'redis';
import { logger } from '../app.js';
import { Room, Player } from '../../types.js';

// how long rooms persist in redis until timeout
const roomTimeout = 60 * 60;
const roomPrefix = (roomCode: string) => {return `noderedis:room:${roomCode}`;};

const client = await createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD
})
  .on('error', err => logger.error('Redis Client Error', err))
  .connect();

// creates a blank room with passed in userId as admin
function createRoomWithUser(userId: string) {
  const newRoom: Room = {
    players: [{playerId: userId, playerName: '', score: 0, scoredThisRound: 0, hand: []}],
    gamePhase: 'lobby',
    storyCardId: '',
    storyDescriptor: '',
    kickedPlayers: [],
    submittedCards: [],
    guesses: {},
    handSize: 6,
    maxPlayers: 8,
    targetScore: 25,
    playerTurn: 0,
    readyForNextRound: [],
    updateCount: 0,
  };
  return newRoom;
}

// creates a blank player
function createPlayer(playerId: string) {
  const newPlayer: Player = {
    playerId: playerId,
    playerName: '',
    score: 0,
    scoredThisRound: 0,
    hand: [],
  };
  return newPlayer;
}

async function resetTTL(roomCode: string) {
  client.expire(`room:${roomCode}`, roomTimeout);
}

// creates room with userId as admin
export async function createRoom(roomCode: string, userId: string) {
  logger.info(`attempting to create room with code ${roomCode}`);
  const result = await client.json.set(roomPrefix(roomCode), '$', createRoomWithUser(userId), {
    NX: true,
  });

  const ttlPromise = resetTTL(roomCode);
  // case where room already exists
  if (result === null) {
    console.log('room already exists');
    return null;
  }
  await ttlPromise;
  // set ttl on key
  return roomCode;
}

// gets entire room state
export async function getRoom(roomCode: string) {
  return await client.json.get(roomPrefix(roomCode)) as Room | null;
}

// increments updatecount by 1 and returns 
export async function incrementUpdateCount(roomCode: string) {
  const newCount = await client.json.numIncrBy(roomPrefix(roomCode), '$.updateCount', 1);
  const ttlPromise = resetTTL(roomCode);
  if (newCount === null) {
    logger.error('unable to successfully increment updateCount');
    return -1;
  }
  await ttlPromise;
  return typeof newCount === 'number' ? newCount : newCount[0];
}

// Adds player to room. If successful, returns index of created player.
export async function addPlayerToRoom(roomCode: string, playerId: string) {
  const newPlayer = createPlayer(playerId);
  const result = await client.json.arrAppend(roomPrefix(roomCode), '$.players', newPlayer);
  const ttlPromise = resetTTL(roomCode);
  
  // subtract 1 from result (array's new size) to get index of inserted element
  const index = typeof result === 'number' ? result - 1 : result[0] - 1;
  await ttlPromise;
  return {...{index, newPlayer}};
}
