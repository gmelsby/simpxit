import { JSONPatchOperation } from 'immutable-json-patch';
import { Server } from 'socket.io';
import { ClientToServerEvents, GameCard, GamePhase, ServerToClientEvents } from '../../types.js';
import { logger } from '../app.js';
import  * as roomModel from '../models/roomModel.js';
import * as cardModel from '../models/cardModel.js';

export default function socketHandler(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', socket => {
    logger.log('info', `connection made: ${socket.id}`);

    // when client realizes something is wrong and needs to get the full room state
    socket.on('requestRoomState', async request => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }

      logger.log('info', `request from user ${userId} for state of room ${roomId}`);

      const room = await roomModel.getRoom(roomId);
      // case where room does not exist
      if (!room) {
        logger.log('info', 'room does not exist');
        return;
      }


      if(!room.players.some(p => p.playerId === userId)) {
        logger.log('info', `user ${userId} is not a current member of room ${roomId}`);
        return;
      }

      await roomModel.resetTTL(roomId);
      logger.log('info', `socketid ${socket.id} requested room state: sending room data`);
      io.to(socket.id).emit('receiveRoomState', room);
    });

    socket.on('joinRoom', async (request, callback) => {
      const { roomId, userId } = request;
      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }


      logger.log('info', `attempt to join room: roomId: ${roomId}, userId: ${userId}`);

      const room = await roomModel.getRoom(roomId);
      // case where room does not exist
      if (!room) {
        logger.log('info', 'room does not exist');
        return callback('Room not found');
      }
      
      // case where user is banned from room
      if (room.kickedPlayers.includes(userId)) {
        logger.log('info', 'user has been kicked from room previously');
        return callback('You have been kicked from this room');
      }

      // case where user is already in room
      if (room.players.some(p => p.playerId === userId)) {
        logger.log('info', `${userId} is current player`);
        // rejoins room
        socket.join(roomId);
        io.to(socket.id).emit('receiveRoomState', room);
        logger.log('info', `sending room data to socketid ${socket.id}`);
        return;
      }
      
      let roomIssue: undefined | string = undefined; 
      // if room is full sends error
      if (room.players.length >= room.maxPlayers) {
        roomIssue = 'room is full';
      }
      // if gameplay is in progress sends error
      if (room.gamePhase !== 'lobby') {
        roomIssue = 'gameplay is in progress';
      }
      if (roomIssue !== undefined) {
        logger.log('info', `${userId} could not join room: ${roomIssue}`);
        return callback(`could not join room: ${roomIssue}`);
      }
        
      // adds player to room
      logger.log('info', `adding ${userId} to player list`);
      const result = await roomModel.addPlayerToRoom(roomId, userId);
      if (result === null) {
        logger.error('issue adding player to room');
        return;
      }
      const {newPlayer, index} = result;
      // record that we have updated the room
      const updateCount = await roomModel.incrementUpdateCount(roomId);

      // send joining player entire room state
      io.to(socket.id).emit('receiveRoomState', room);

      // add new player to room socket
      socket.join(roomId);
      // send out patch with new player
      io.to(roomId).emit('receiveRoomPatch', {
        operations: [
          {
            'op': 'add',
            'path': `/players/${index}`,
            'value': newPlayer,
          }
        ],
        updateCount: updateCount
      });

      
      logger.log('info', `playerId ${userId} has joined room ${roomId}`);
      logger.log('info', `player list = ${JSON.stringify(room.players)}`);
    });
    
    socket.on('kickPlayer', async request => {
      const { roomId, userId, kickUserId } = request;
      if ([roomId, userId, kickUserId].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const playerIds = await roomModel.getPlayerIds(roomId);

      if (!playerIds || playerIds.length === 0) {
        return;
      } 

      if (playerIds[0] !== userId) {
        logger.info('kicking player is not admin');
        return;
      }

      // check that kicked user is in room
      const kickIndex = playerIds.indexOf(kickUserId);
      if (kickIndex === -1) {
        logger.info('player to be kicked is not in the room');
      }
      
      if (await roomModel.kickPlayer(roomId, kickUserId, kickIndex)) {
        logger.log('info', `kicked player ${kickUserId}`);
        const updateCount = await roomModel.incrementUpdateCount(roomId);
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [
            {
              'op': 'add',
              'path': '/kickedPlayers/-',
              'value': `${kickUserId}`,
            },
            {
              'op': 'remove',
              'path': `/players/${kickIndex}`
            },
          ],
          updateCount: updateCount
        });
      }
      else {
        logger.log('info', `could not kick player ${kickUserId}`);
      }
    });

    socket.on('leaveRoom', async (request, callback) => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }

      logger.log('info', `player ${userId} attempting to leave room ${roomId}`);
      // check for existence of room

      const playerIds = await roomModel.getPlayerIds(roomId);

      if (!playerIds || playerIds.length === 0) {
        logger.log('info', 'room player is attempting to leave does not exist');
        return callback('Room does not exist');
      }
      const playerIndex = playerIds.indexOf(userId);
      if (playerIndex === -1) {
        logger.log('info', 'player is not in room');
        return callback('Player is not in room');
      }

      
      // successful exit
      if (await roomModel.removePlayer(roomId, playerIndex)) {
        logger.log('info', 'player removed successfully');
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [
            {
              'op': 'remove',
              'path': `/players/${playerIndex}`
            }
          ],
          updateCount: await roomModel.incrementUpdateCount(roomId)
        });
      }
      else {
        logger.log('info', 'unable to remove player');
      }
    });
    
    socket.on('changeName', async request => {
      const { roomId, userId, newName } = request;

      if ([roomId, userId, newName].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const trimmedNewName = newName.trim();
      logger.log('info', `player ${userId} attempting to change name to ${trimmedNewName}`);
      const playerIds = await roomModel.getPlayerIds(roomId);
      const playerNames = await roomModel.getPlayerNames(roomId);
      if (!playerIds || !playerNames || Math.min(playerIds.length, playerNames.length) === 0) {
        return;
      }
      
      const playerIndex = playerIds.indexOf(userId);
      if (playerIndex === -1) {
        logger.log('info', `player ${userId} is not in room`);
        return;
      }
      
      if (playerNames.some(p => p.toLowerCase() === trimmedNewName.toLowerCase()))  {
        logger.log('info', `a player by name ${trimmedNewName} already exists`);
        return;
      }

      if (await roomModel.changeName(roomId, playerIndex, trimmedNewName)) {
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [
            {
              'op': 'replace',
              'path': `/players/${playerIndex}/playerName`,
              'value': trimmedNewName,
            }
          ],
          updateCount: await roomModel.incrementUpdateCount(roomId)
        });
      } else {
        logger.error('issue changing name in redis');
      }
    });

    socket.on('changeOptions', async request => {
      const { roomId, userId, newOptions } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string' || typeof newOptions !== 'number') {
        logger.log('info', 'invalid request');
        return;
      }

      logger.log('info', `player ${userId} attempting to change options to ${newOptions}`);

      // check that new options are within specified range
      if (!Number.isInteger(newOptions) || newOptions < 5 || newOptions > 100) {
        logger.log('info', 'could not change options');
        return;
      }

      if (userId !== await roomModel.getAdminId(roomId)) {
        logger.log('info', 'room does not exist or user in not admin');
        return;
      }

      if (await roomModel.changeOptions(roomId, newOptions) === null) {
        logger.log('info', 'could not change options');
        return;
      }

      logger.log('info', 'options changed');
      io.to(roomId).emit('receiveRoomPatch', {
        operations: 
        [
          {
            'op': 'replace',
            'path': '/targetScore',
            'value': newOptions,
          }
        ],
        updateCount: await roomModel.incrementUpdateCount(roomId)
      });
    });
    
    socket.on('startGame', async request => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }


      logger.log('info', `player ${userId} attempting to start game in room ${roomId}`);

      // check that player names are not empty
      const playerNames = await roomModel.getPlayerNames(roomId);
      if (!playerNames || playerNames.some(p => p === '')) {
        logger.log('info', 'could not start game, some player names are empty string');
        return;
      }

      if (playerNames.length < 3) {
        logger.log('info', 'could not start game, less than 3 players in room');
        return;
      }

      const gamePhase = await roomModel.getGamePhase(roomId);
      if (gamePhase !== 'lobby') {
        logger.log('info', 'could not start game, gamePhase is not lobby');
        return;
      }

      if (await roomModel.setGamePhase(roomId, 'storyTellerPick')) {
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [{
            'op': 'replace',
            'path': '/gamePhase',
            'value': 'storyTellerPick'
          }],
          updateCount: await roomModel.incrementUpdateCount(roomId)
        });
        logger.log('info', 'game started. populating hands...');
        

        const newCardsPerPlayer = await populateHands(roomId);
        if (newCardsPerPlayer) {
          logger.log('info', 'hands populated');
          const operations: JSONPatchOperation[] = [];
          newCardsPerPlayer.forEach((cardDetails, playerIndex) => {
            cardDetails.forEach(element => {
              const {handIndex, card} = element;
              operations.push({
                'op': 'add',
                'path': `/players/${playerIndex}/hand/${handIndex}`,
                'value': card,
              });
            });
          });
          io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: await roomModel.incrementUpdateCount(roomId)});
        }
        else {
          logger.log('info', 'unable to start game');
        }
      } else {
        logger.log('info', 'unable to start game');
      }
    });
    
    socket.on('submitStoryCard', async request => {
      const { roomId, userId, selectedCardId, descriptor } = request;
      
      if ([roomId, userId, selectedCardId, descriptor].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const trimmedDescriptor = descriptor.trim();
      if (trimmedDescriptor === '' || trimmedDescriptor.length > 50) {
        return;
      }

      const storyTellerIndex = await roomModel.getStoryTellerIndex(roomId);
      if (storyTellerIndex === null) {
        logger.info('could not get storyTellerIndex');
        return;
      }
      logger.info(JSON.stringify(storyTellerIndex));
      const storyTeller = await roomModel.getPlayerAtIndex(roomId, storyTellerIndex);
      logger.info(JSON.stringify(storyTeller));
      if (!storyTeller || storyTeller.playerId !== userId) {
        logger.info('userId does not match storyTellerId');
        return;
      }

      // check if card is in hand
      const handIndex = storyTeller.hand.findIndex(c => c.id === selectedCardId);
      if (handIndex === -1) {
        logger.info('card is not in storyteller hand');
        return;
      }

      const card =  storyTeller.hand[handIndex]; 
      if (card === undefined) {
        logger.log('info', 'unable to submit card');
        return;
      }

      card.submitter = storyTeller.playerId;
      if(!await roomModel.submitStoryCard(roomId, storyTellerIndex, handIndex, card, trimmedDescriptor)) {
        logger.error('issue submitting storyteller card');
        return;
      }

      logger.log('info', `Story card ${selectedCardId} submitted by ${userId}`);
      io.to(roomId).emit('receiveRoomPatch', {
        operations: [
          {
            'op': 'replace',
            'path': '/storyCardId',
            'value': card.id
          },
          {
            'op': 'add',
            'path': '/submittedCards/-',
            'value': card
          },
          {
            'op': 'replace',
            'path': '/storyDescriptor',
            'value': trimmedDescriptor
          },
          {
            'op': 'replace',
            'path': '/gamePhase',
            'value': 'otherPlayersPick'
          },
          {
            'op': 'remove',
            'path': `/players/${storyTellerIndex}/hand/${handIndex}`
          }
        ],
        updateCount: await roomModel.incrementUpdateCount(roomId)
      });
    });

    socket.on('submitOtherCard', async request => {
      const { roomId, userId, selectedCardId} = request;

      if ([roomId, userId, selectedCardId].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const playerIds = await roomModel.getPlayerIds(roomId);
      if (!playerIds) {
        return; 
      }
      const playerIndex = playerIds.indexOf(userId);
      if (playerIndex === -1) {
        logger.info('player is not in room');
        return;
      }
      
      const player = await roomModel.getPlayerAtIndex(roomId, playerIndex);
      if (player === null) {
        return;
      }

      // check if card is in hand
      const handIndex = player.hand.findIndex(c => c.id === selectedCardId);
      if (handIndex === -1) {
        logger.info('card is not in storyteller hand');
        return;
      }

      const card =  player.hand[handIndex]; 
      if (card === undefined) {
        logger.log('info', 'unable to submit card');
        return;
      }

      // check that user has not already submitted card
      const cardSubmitters = await roomModel.getCardSubmitters(roomId);
      logger.info(`submitters: ${cardSubmitters}`);
      const submissionCount = cardSubmitters?.filter(id => id === userId).length;
      // in a 3 player game, users get to submit 2 cards
      if (submissionCount === undefined || 
        (submissionCount === 1 && playerIds.length > 3) ||
        (submissionCount === 2 && playerIds.length === 3)
      ) {
        logger.info('user has already submitted their cards');
        return;
      }

      card.submitter = player.playerId;
      if(!await roomModel.submitOtherCard(roomId, playerIndex, handIndex, card)) {
        logger.error('issue submitting valid card');
        return;
      }

      logger.log('info', `Other card ${selectedCardId} submitted by ${userId}`);

      // check if we need to advance game phase
      let gamePhase: GamePhase | undefined = undefined;
      if (await roomModel.isOtherPlayerSubmitOver(roomId)) {
        gamePhase = 'otherPlayersGuess';
        await roomModel.setGamePhase(roomId, gamePhase);
      }
      

      const operations: JSONPatchOperation[] = [
        {
          'op': 'add',
          'path': '/submittedCards/-',
          'value': card
        },
        {
          'op': 'remove',
          'path': `/players/${playerIndex}/hand/${handIndex}`
        },
      ];

      // only include gamePhase update if it is defined
      if (gamePhase !== undefined) {
        operations.push({
          'op': 'replace',
          'path': '/gamePhase',
          'value': gamePhase
        });
      }

      io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: await roomModel.incrementUpdateCount(roomId)});
    });
    
    socket.on('guess', async request => {
      const {roomId, userId, selectedCardId} = request;

      if ([roomId, userId, selectedCardId].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      logger.log('info', 'received guess');

      const playerIds = await roomModel.getPlayerIds(roomId);
      if (!playerIds) {
        return; 
      }
      const playerIndex = playerIds.indexOf(userId);
      if (playerIndex === -1) {
        logger.info('player is not in room');
        return;
      }

      const submittedCardIds = await roomModel.getSubmittedCardIds(roomId);
      if (submittedCardIds === null || !submittedCardIds.includes(selectedCardId)) {
        logger.info('cardId is not in submittedCards');
        return;
      }

      const guessers = await roomModel.getGuessers(roomId);
      if (guessers === null || guessers.includes(userId)) {
        logger.info('user has already submitted a guess');
        return;
      }
 
      if (!await roomModel.submitGuess(roomId, userId, selectedCardId)) {
        logger.log('info', 'could not submit guess');
      }
      logger.log('info', `${userId} made guess`);
      const operations: JSONPatchOperation[] = [
        {
          'op': 'add',
          'path': `/guesses/${userId}`,
          'value': selectedCardId,
        }
      ];

      // check if it's time to score
      if(await roomModel.isOtherPlayerGuessOver(roomId)) {
        const result = await roomModel.setGamePhase(roomId, 'scoring');
        if (!result) {
          logger.error('failed to set game state to scoring');
          return;
        }
        operations.push({
          'op': 'replace',
          'path': '/gamePhase',
          'value': 'scoring'
        });
        
        const scoringInfo = await score(roomId); // scoring logic
        if (!scoringInfo) {
          logger.error('issue calculating score');
          return;
        }
        console.log(JSON.stringify(scoringInfo));
        scoringInfo.score.forEach((score, idx) => {
          operations.push({
            'op': 'replace',
            'path': `/players/${idx}/score`,
            'value': score
          });
          operations.push({
            'op': 'replace',
            'path': `/players/${idx}/scoredThisRound`,
            'value': scoringInfo.scoredThisRound[idx]
          });
        });
      }
      io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: await roomModel.incrementUpdateCount(roomId)});
    });
    
    socket.on('endScoring', async request => {
      logger.log('info', 'received end scoring request');
      const {roomId, userId} = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }

      const playerIds = await roomModel.getPlayerIds(roomId);

      // check that player is in room
      if (!playerIds || !playerIds.includes(userId)) {
        return;
      }
      const operations: JSONPatchOperation[] = [];

      const readyPlayerIds = await roomModel.getPlayersReadyForNextRound(roomId);
      if (readyPlayerIds?.includes(userId)) {
        logger.info('user is already ready for next round');
      }

      let gamePhase: GamePhase | undefined = undefined;
      const readyPlayerCount = await roomModel.addPlayerToReadyForNextRound(roomId, userId);
      if (readyPlayerCount < 1) {
        logger.error('issue adding to ready players');
        return;
      }

      // all players ready for next round
      if (readyPlayerCount === playerIds.length) {
        gamePhase = 'storyTellerPick';
        // if game is won go to lobby next
        if (await roomModel.isGameWon(roomId)) {
          gamePhase = 'lobby';
        }
      }
      // if still waiting on other players
      if (gamePhase === undefined) {
        operations.push({
          'op': 'add',
          'path': '/readyForNextRound/-',
          'value': userId,
        });
        io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: await roomModel.incrementUpdateCount(roomId)});
        return;
      }
      // going into next round
      else if (gamePhase === 'storyTellerPick') {
        logger.log('info', 'going into next round');
        const newCardsPerPlayer = await populateHands(roomId);
        if (!newCardsPerPlayer) {
          logger.error('could not populate hands for next round');
          return;
        }
        logger.log('info', 'populated hands for next round');
        newCardsPerPlayer.forEach((cardDetails, playerIndex) => {
          cardDetails.forEach(element => {
            const {handIndex, card} = element;
            operations.push({
              'op': 'add',
              'path': `/players/${playerIndex}/hand/${handIndex}`,
              'value': card,
            });
          });
        });
        io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: await roomModel.incrementUpdateCount(roomId)});
        if (await roomModel.resetRoundValues(roomId)) {
          io.to(roomId).emit('resetRoundValues', await roomModel.incrementUpdateCount(roomId));
        }
      }
      else if (gamePhase === 'lobby') {
        logger.log('info', 'reset to lobby');
        io.to(roomId).emit('resetToLobby', await roomModel.incrementUpdateCount(roomId));
      }
    });
  });
}

async function populateHands(roomId: string) {
  const playerHands = await roomModel.getAllPlayerHands(roomId);
  const handSize = await roomModel.getHandSize(roomId);
  if (playerHands === null || handSize === null) {
    logger.error('unable to get playerHands or handSize');
    return;
  }
  const cardsNeededPerPlayer = playerHands.map(h => handSize - h.length);
  const totalCardsNeeded =  cardsNeededPerPlayer.reduce((sum, a) => sum + a, 0);
  const currentCardIds = playerHands.map(h => h.map(c => c.id)).flat();
  logger.log('info', `currentCardIds: ${JSON.stringify(currentCardIds)}`);

  // get total number of cards needed in one database call
  const newCards = await cardModel.drawCards(totalCardsNeeded, currentCardIds);
  logger.log('info', `${cardsNeededPerPlayer.reduce((sum, a) => sum + a, 0)} cards needed, ${newCards.length} cards drawn`);

  const newCardsPerPlayer: {card: GameCard, handIndex: number}[][] = [];
  for (const [playerIndex, hand] of playerHands.entries()) {
    const newCardsForCurrentPlayer: {card: GameCard, handIndex: number}[] = [];
    for (let handIndex = hand.length; handIndex < handSize; handIndex += 1) {
      const card = newCards.pop();
      if (card !== undefined) {
        const insertedIndex = await roomModel.putCardInPlayerHand(roomId, playerIndex, handIndex, card);
        if (insertedIndex !== -1 || insertedIndex >= handSize) {
          newCardsForCurrentPlayer.push({card, handIndex});
        }
        else {
          logger.error(`unable to put card ${JSON.stringify(card)} in player ${playerIndex} hand`);
        }
      } else {
        logger.error('something went wrong - not enough cards drawn');
      }
    }
    newCardsPerPlayer.push(newCardsForCurrentPlayer);
  }
  return newCardsPerPlayer;
}

async function score(roomId: string) {
  const guesses = await roomModel.getGuesses(roomId);
  logger.debug(guesses);
  if (guesses === null) {
    logger.error('could not successfully get guesses');
    return;
  }
  const storyCardId = await roomModel.getStoryCardId(roomId);
  const playerIds = await roomModel.getPlayerIds(roomId);
  if (playerIds === null) {
    logger.error('could not successfully get playerIds');
    return;
  }
  const correctGuessers = Object.keys(guesses).filter(guesserId => guesses[guesserId] === storyCardId);

  const storyTellerIndex = await roomModel.getStoryTellerIndex(roomId);
  if (storyTellerIndex === null) {
    logger.error('could not retrieve storyTellerIndex');
    return;
  }

  // some correct guesses, some incorrect guesses
  if (correctGuessers.length > 0 && correctGuessers.length < playerIds.length - 1) {
    logger.debug('some but not all correct');
    // storyteller gets 3 points
    const promises = [roomModel.addPoints(roomId, storyTellerIndex, 3)];
    // players who guessed correctly get 3 points
    correctGuessers.forEach(guesserId => {
      promises.push(roomModel.addPoints(roomId, playerIds.indexOf(guesserId), 3));
    });
    const results = await Promise.all(promises);
    if (results.includes(false)) {
      logger.error('unsuccessful in assigning points to player');
    }
  }
  // otherwise everyone but the storyteller gets 2 points
  else {
    logger.debug('all or none correct');
    // storyteller gets 0 points
    const promises: Promise<boolean>[] = [];
    [...Array(playerIds.length).keys()]
      .filter(idx => idx !== storyTellerIndex)
      .forEach(idx => promises.push(roomModel.addPoints(roomId, idx, 2)));

    const results = await Promise.all(promises);
    if (results.includes(false)) {
      logger.error('unsuccessful in assigning points to player');
    }
  }

  // handle succesful deceit
  const successfulFakes = Object.values(guesses).filter(cardId => cardId !== storyCardId);
  if (successfulFakes.length > 0) {
    logger.debug('successful fakes');
    const submittedCards = await roomModel.getSubmittedCards(roomId);
    if (submittedCards === null) {
      logger.error('could not retrieve submitted cards');
      return;
    }

    const promises: Promise<boolean>[] = [];
    for (const fakeId of successfulFakes) {
      const fakerId = submittedCards.find(c => c.id === fakeId)?.submitter;
      if (fakerId === undefined) continue;
      const fakerIndex = playerIds.indexOf(fakerId);
      promises.push(roomModel.addPoints(roomId, fakerIndex, 1));
    }
    const results = await Promise.all(promises);
    if (results.includes(false)) {
      logger.error('unsuccessful in assigning points to player');
    }
  }
  return await roomModel.getScoringInfo(roomId);
}
