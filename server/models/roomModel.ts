import { logger } from '../app.js';
import { Room, Player, GamePhase, GameCard, GuessMap } from '../../types.js';
import client from './redisClient.js';

// how long rooms persist in redis until timeout
const roomTimeout = 60 * 60;
const roomPrefix = (roomCode: string) => {return `noderedis:room:${roomCode}`;};



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

export async function resetTTL(roomCode: string) {
  await client.expire(roomPrefix(roomCode), roomTimeout);
}

// creates room with userId as admin
export async function createRoom(roomCode: string, userId: string) {
  logger.info(`attempting to create room with code ${roomCode}`);
  const result = await client.json.set(roomPrefix(roomCode), '$', createRoomWithUser(userId), {
    NX: true,
  });

  // case where room already exists
  if (result === null) {
    return null;
  }
  await resetTTL(roomCode);
  // set ttl on key
  return roomCode;
}

// gets entire room state
export async function getRoom(roomCode: string) {
  return await client.json.get(roomPrefix(roomCode)) as Room | null;
}

// increments updatecount by 1 and returns 
// also resets room ttl
export async function incrementUpdateCount(roomCode: string) {
  const newCount = await client.json.numIncrBy(roomPrefix(roomCode), '$.updateCount', 1);
  if (newCount === null) {
    logger.error('unable to successfully increment updateCount');
    return -1;
  }
  await resetTTL(roomCode);
  return typeof newCount === 'number' ? newCount : newCount[0];
}

// Adds player to room. If successful, returns index of created player.
export async function addPlayerToRoom(roomCode: string, playerId: string) {
  const newPlayer = createPlayer(playerId);
  const result = await client.json.arrAppend(roomPrefix(roomCode), '$.players', newPlayer);
  
  if (result === null) {
    return null;
  }
  
  // subtract 1 from result (array's new size) to get index of inserted element
  const index = typeof result === 'number' ? result - 1 : result[0] - 1;
  return {...{index, newPlayer}};
}

// returns list of players if room exists, otherwise null
export async function getPlayers(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.players'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as Player[];
}

// gets the playerId of the player at index 0 in the room, if exists
export async function getAdminId(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.players[0].playerId'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0];
}

export async function getPlayerIds(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.players..playerId'});
  return result as string[] | null;
}

export async function getPlayerNames(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.players..playerName'});
  return result as string[] | null;
}

// kicks player at specified index and adds id to banned list
export async function kickPlayer(roomCode: string, kickUserId: string, kickIndex: number) {
  const result = await client.multi()
    .json.arrAppend(roomPrefix(roomCode), '$.kickedPlayers', kickUserId)
    .json.del(roomPrefix(roomCode), `$.players[${kickIndex}]`)
    .exec();
  // returns true if result has no null elements, false if it does
  return !result.some(res => res === null);
}

// removes player at specified index, returns boolean indicating whether remove was successful
export async function removePlayer(roomCode: string, userIndex: number) {
  const result = await client.json.del(roomPrefix(roomCode), `$.players[${userIndex}]`);
  return result > 0;
}

// changes name of player at specified index, returns 'OK' or null depending on success
export async function changeName(roomCode: string, userIndex: number, newName: string) {
  return await client.json.set(roomPrefix(roomCode), `$.players[${userIndex}].playerName`, newName);
}

// changes options
export async function changeOptions(roomCode: string, newOptions: number) {
  return await client.json.set(roomPrefix(roomCode), '$.targetScore', newOptions);
}

// retrieves game phase
export async function getGamePhase(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.gamePhase'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as string;
}

// sets game phase
export async function setGamePhase(roomCode: string, newGamePhase: GamePhase) {
  return await client.json.set(roomPrefix(roomCode), '$.gamePhase', newGamePhase);
}

// gets list of player hands
export async function getAllPlayerHands(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.players..hand'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result as GameCard[][];
}

export async function getHandSize(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.handSize'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as number;
}

export async function putCardInPlayerHand(roomCode: string, playerIndex: number, handIndex: number, card: GameCard) {
  const result = await client.json.arrInsert(roomPrefix(roomCode), `$.players[${playerIndex}].hand`, handIndex, card);

  if (result === null) {
    return -1;
  }
  // subtract 1 from result (array's new size) to get index of inserted element
  const index = typeof result === 'number' ? result - 1 : result[0] - 1;
  return index;
}

// gets the current storyteller index
export async function getStoryTellerIndex(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.playerTurn'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as number;
}

// gets the Player at the passed-in index
export async function getPlayerAtIndex(roomCode: string, playerIndex: number) {
  const result = await client.json.get(roomPrefix(roomCode), {path: `$.players[${playerIndex}]`});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as Player;
}

// removes the card at index cardIndex from the hand of player at playerIndex
// returns true if deletion successful, false if not
async function removeCardFromPlayerHand(roomCode: string, playerIndex: number, cardIndex: number) {
  return (await client.json.del(roomPrefix(roomCode), `$.players[${playerIndex}].hand[${cardIndex}]`) > 0);
}

// returns index of pushed card
async function pushCardToSumbittedCards(roomCode: string, card: GameCard) {
  const result = await client.json.arrAppend(roomPrefix(roomCode), '$.submittedCards', card);
  if (result === null) {
    return null;
  }
  
  // subtract 1 from result (array's new size) to get index of inserted element
  const index = Array.isArray(result) ? result[0] - 1 : result - 1;
  return index;
}

async function setStoryCardId(roomCode: string, storyCardId: string) {
  return await client.json.set(roomPrefix(roomCode), '$.storyCardId', storyCardId);
}

export async function getStoryCardId(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.storyCardId'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as string;
}

async function setStoryDescriptor(roomCode: string, storyDescriptor: string) {
  return await client.json.set(roomPrefix(roomCode), '$.storyDescriptor', storyDescriptor);
}

// returns true if successful, false if not
export async function submitStoryCard(roomCode: string, playerIndex: number, cardIndex: number, card: GameCard, descriptor: string) {
  const promises = [
    setStoryCardId(roomCode, card.id),
    pushCardToSumbittedCards(roomCode, card),
    setGamePhase(roomCode, 'otherPlayersPick'),
    setStoryDescriptor(roomCode, descriptor),
    removeCardFromPlayerHand(roomCode, playerIndex, cardIndex),
  ];
  const results = await Promise.all(promises);
  return !results.some(result => result === null || result === false || (typeof result === 'number' && result <  0));
}

// returns list of ids of players who haves submitted a card
export async function getCardSubmitters(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.submittedCards..submitter'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result as string[];
}

// returns true if successful, false if not
export async function submitOtherCard(roomCode: string, playerIndex: number, cardIndex: number, card: GameCard) {
  const promises = [
    pushCardToSumbittedCards(roomCode, card),
    removeCardFromPlayerHand(roomCode, playerIndex, cardIndex),
  ];
  const results = await Promise.all(promises);
  return !results.some(result => result === null || result === false || (typeof result === 'number' && result <  0));
}

// returns true if submittedCards.length === players.length or 3 player game modification, false otherwise
export async function isOtherPlayerSubmitOver(roomCode: string) {
  const playerLengthResult = await client.json.arrLen(roomPrefix(roomCode), '$.players');
  const submittedCardLengthResult = await client.json.arrLen(roomPrefix(roomCode), '$.submittedCards');

  const playerLength = Array.isArray(playerLengthResult) ? playerLengthResult[0] : playerLengthResult;
  const submittedCardLength = Array.isArray(submittedCardLengthResult) ? submittedCardLengthResult[0] : submittedCardLengthResult;

  if (playerLength === 3) {
    return submittedCardLength === 5;
  }
  return submittedCardLength === playerLength;
}

export async function getSubmittedCardIds(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.submittedCards..id'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result as string[];
}

export async function getGuessers(roomCode: string) {
  const result = await client.json.objKeys(roomPrefix(roomCode), '$.guesses');
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result.flat();
}

export async function submitGuess(roomCode: string, userId: string, cardId: string) {
  return await client.json.set(roomPrefix(roomCode), `$.guesses.${userId}`, cardId);
}

export async function isOtherPlayerGuessOver(roomCode: string) {
  const playerLengthResult = await client.json.arrLen(roomPrefix(roomCode), '$.players');
  const guessLengthResult = await client.json.objLen(roomPrefix(roomCode), '$.guesses');

  const playerLength = Array.isArray(playerLengthResult) ? playerLengthResult[0] : playerLengthResult;
  const guessLengthProcessStep = Array.isArray(guessLengthResult) ? guessLengthResult[0] : guessLengthResult;
  const guessLength = guessLengthProcessStep === null ? 0 : guessLengthProcessStep;
  
  return playerLength === guessLength + 1;
}

export async function getGuesses(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.guesses'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as GuessMap;
}

// adds points to player at index. Returns true if points are added successfully, else false
export async function addPoints(roomCode: string, playerIndex: number, numberOfPoints: number) {
  const results = await client.multi()
    .json.numIncrBy(roomPrefix(roomCode), `$.players[${playerIndex}].scoredThisRound`, numberOfPoints)
    .json.numIncrBy(roomPrefix(roomCode), `$.players[${playerIndex}].score`, numberOfPoints)
    .exec();

  return !results.some(result => result === null);
}

// gets submitttedCards object
export async function getSubmittedCards(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.submittedCards'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as GameCard[];
}

// gets scoredThisRound and score for all players
export async function getScoringInfo(roomCode: string) {
  const scoreResult = await client.json.get(roomPrefix(roomCode), {path: '$.players..score'});
  const scoredThisRoundResult = await client.json.get(roomPrefix(roomCode), {path: '$.players..scoredThisRound'});
  if (scoreResult === null || scoredThisRoundResult === null) {
    return null;
  }
  const scoringInfo = {
    scoredThisRound: scoredThisRoundResult as number[],
    score: scoreResult as number[],
  };
  return scoringInfo;
}

// returns size of readyForNextRound array after insert
export async function addPlayerToReadyForNextRound(roomCode: string, playerId: string) {
  const result = await client.json.arrAppend(roomPrefix(roomCode), '$.readyForNextRound', playerId);
  return typeof result === 'number' ? result : result[0];
}

// gets list of player ids ready for next round
export async function getPlayersReadyForNextRound(roomCode: string) {
  const result = await client.json.get(roomPrefix(roomCode), {path: '$.readyForNextRound'});
  if (result === null || !Array.isArray(result) || result.length === 0) {
    return null;
  }
  return result[0] as string[];
}

// return true if game is won, false if not
export async function isGameWon(roomCode: string) {
  const targetScoreResult = await client.json.get(roomPrefix(roomCode), {path: '$.targetScore'});
  if (targetScoreResult === null || !Array.isArray(targetScoreResult) || targetScoreResult.length === 0 || targetScoreResult === null) {
    throw Error;
  }
  const targetScore = targetScoreResult[0] as number;

  const scoreResult = await client.json.get(roomPrefix(roomCode), {path: '$.players..score'});
  if (scoreResult === null || !Array.isArray(scoreResult) || scoreResult.length === 0) {
    throw Error;
  }
  const highScore = Math.max(...scoreResult as number[]);
  return highScore >= targetScore;
}

async function incrementAndModPlayerTurn(roomCode: string) {
  const queries = [];
  queries.push(client.json.arrLen(roomPrefix(roomCode), '$.players'));
  queries.push(client.json.get(roomPrefix(roomCode), {path: '$.playerTurn'}));
  const results = await Promise.all(queries);
  const mappedResults = results.map(r => Array.isArray(r) ? r[0] : r) as number[];
  const [playerCount, playerTurn] = mappedResults;
  if (playerCount === null || playerTurn === null) {
    throw Error('could not find player length or playerTurn');
  }
  const newPlayerTurn = (playerTurn + 1) % playerCount;
  const result = client.json.set(roomPrefix(roomCode), '$.playerTurn', newPlayerTurn);
  return result;
}

// resets round values to move from scoring to storyTellerPick
// returns boolean indicating success
export async function resetRoundValues(roomCode: string) {
  const promises = [
    setGamePhase(roomCode, 'storyTellerPick'),
    incrementAndModPlayerTurn(roomCode),
    setStoryCardId(roomCode, ''),
    setStoryDescriptor(roomCode, ''),
    client.json.set(roomPrefix(roomCode), '$.readyForNextRound', []),
    client.json.set(roomPrefix(roomCode), '$.submittedCards', []),
    client.json.set(roomPrefix(roomCode), '$.guesses', {}),
    client.json.set(roomPrefix(roomCode), '$.players..scoredThisRound', 0)
  ];
  const results = await Promise.all(promises);
  return !results.some(result => result === null);
}

// resets to lobby
export async function resetToLobby(roomCode: string) {
  const promises = [
    setGamePhase(roomCode, 'lobby'),
    setStoryCardId(roomCode, ''),
    setStoryDescriptor(roomCode, ''),
    client.json.set(roomPrefix(roomCode), '$.playerTurn', 0),
    client.json.set(roomPrefix(roomCode), '$.readyForNextRound', []),
    client.json.set(roomPrefix(roomCode), '$.submittedCards', []),
    client.json.set(roomPrefix(roomCode), '$.guesses', {}),
    client.json.set(roomPrefix(roomCode), '$.players..scoredThisRound', 0),
    client.json.set(roomPrefix(roomCode), '$.players..score', 0),
    client.json.set(roomPrefix(roomCode), '$.players..hand', []),
  ];
  const results = await Promise.all(promises);
  return !results.some(result => result === null);
}
