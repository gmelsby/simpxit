import { createClient } from 'redis';
import { logger } from '../app.js';
import { Room } from '../../types.js';

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

export async function createRoom(roomCode: string, userId: string) {
  const result = await client.json.set(`room:${roomCode}`, '$', createRoomWithUser(userId), {
    NX: true,
  });
  // case where room already exists
  if (result === null) {
    console.log('room already exists');
    return null;
  }
  console.log(result);
}