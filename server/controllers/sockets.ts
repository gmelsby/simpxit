import { JSONPatchOperation } from 'immutable-json-patch';
import { Room } from '../models/gameClasses.js';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../types.js';
import { logger } from '../app.js';
import  * as roomModel from '../models/roomModel.js';

export default function socketHandler(io: Server<ClientToServerEvents, ServerToClientEvents>, rooms: {[key: string]: Room}) {
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
      const {newPlayer, index} = await roomModel.addPlayerToRoom(roomId, userId);
      // record that we have updated the room
      const updateCount = await roomModel.incrementUpdateCount(roomId);
      await roomModel.resetTTL(roomId);

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
        await roomModel.resetTTL(roomId);
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
        await roomModel.resetTTL(roomId);
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
        await roomModel.resetTTL(roomId);
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
      await roomModel.resetTTL(roomId);
    });
    
    socket.on('startGame', async request => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }


      logger.log('info', `player ${userId} attempting to start game in room ${roomId}`);
      const room = rooms[roomId];
      if (room && room.startGame(userId)) {
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [{
            'op': 'replace',
            'path': '/gamePhase',
            'value': 'storyTellerPick'
          }],
          updateCount: await roomModel.incrementUpdateCount(roomId)
        });
        logger.log('info', 'game started. populating hands...');
        // populate hands returns a promise
        room.populateHands() 
          .then(newCardsPerPlayer => {
            if (newCardsPerPlayer) {
              logger.log('info', 'hands populated');
              const operations: JSONPatchOperation[] = [];
              room.players.forEach((player, playerIdx) => {
                player.hand.forEach((card, cardIdx) => {
                  operations.push(
                    {
                      'op': 'add',
                      'path': `/players/${playerIdx}/hand/${cardIdx}`,
                      'value': card,
                    }
                  );
                });
              });
              
              io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: room.incrementUpdateCount()});
            }
            else {
              logger.log('info', 'unable to start game');
            }
          });
      }
      
      else {
        logger.log('info', 'unable to start game');
      }
      
    });
    
    socket.on('submitStoryCard', request => {
      const { roomId, userId, selectedCardId, descriptor } = request;
      
      if ([roomId, userId, selectedCardId, descriptor].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const room = rooms[roomId];
      if (!room) {
        return;
      }
      const { card, playerIndex, handIndex, storyDescriptor, gamePhase } = room.submitStoryCard(userId, selectedCardId, descriptor.trim()); 
      if (card === undefined || playerIndex === -1 || handIndex === -1) {
        logger.log('info', 'unable to submit card');
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
            'value': storyDescriptor
          },
          {
            'op': 'replace',
            'path': '/gamePhase',
            'value': gamePhase
          },
          {
            'op': 'remove',
            'path': `/players/${playerIndex}/hand/${handIndex}`
          }
        ],
        updateCount: room.incrementUpdateCount()
      });
    });

    socket.on('submitOtherCard', request => {
      const { roomId, userId, selectedCardId} = request;

      if ([roomId, userId, selectedCardId].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      const room = rooms[roomId];
      if (!room) {
        return; 
      }
      // check that user is able to submit other card
      const { card, playerIndex, handIndex, gamePhase } = room.submitOtherCard(userId, selectedCardId);
      if (card === undefined || playerIndex === -1 || handIndex === -1) {
        logger.log('info', 'could not submit other card');
        return;
      }
      logger.log('info', `Other card ${selectedCardId} submitted by ${userId}`);
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

      io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: room.incrementUpdateCount()});
    });
    
    socket.on('guess', request => {
      const {roomId, userId, selectedCardId} = request;

      if ([roomId, userId, selectedCardId].some(val => typeof val !== 'string') ) {
        logger.log('info', 'invalid request');
        return;
      }

      logger.log('info', 'received guess');

      const room = rooms[roomId];
      if (!room) {
        logger.log('info', 'room does not exist');
        return;
      }

      // check that user is able to make guess
      const {isSuccessful, scoringInfo} = room.makeGuess(userId, selectedCardId);
      if (!isSuccessful) {
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

      // add in scoringInfo information if exists, otherwise send patch without it
      if (scoringInfo) {
        operations.push({
          'op': 'replace',
          'path': '/gamePhase',
          'value': scoringInfo.gamePhase
        });
        scoringInfo.scoreList.forEach(([score, scoredThisRound], idx) => {
          operations.push({
            'op': 'replace',
            'path': `/players/${idx}/score`,
            'value': score
          });
          operations.push({
            'op': 'replace',
            'path': `/players/${idx}/scoredThisRound`,
            'value': scoredThisRound
          });
        });
      }

      io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: room.incrementUpdateCount()});
    });
    
    socket.on('endScoring', request => {
      logger.log('info', 'received end scoring request');
      const {roomId, userId} = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        logger.log('info', 'invalid request');
        return;
      }

      const room = rooms[roomId];

      if (!room) {
        return;
      }
      const operations: JSONPatchOperation[] = [];
      // signal that user is ready to move on to next phase
      const { successful, gamePhase } = room.endScoring(userId);
      if (!successful) {
        return;
      }

      // still waiting on other players
      if (gamePhase === undefined) {
        operations.push({
          'op': 'add',
          'path': '/readyForNextRound/-',
          'value': userId,
        });
        io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: room.incrementUpdateCount()});
        return;
      }
      // going into next round
      else if (gamePhase === 'storyTellerPick') {
        logger.log('info', 'going into next round');
        room.populateHands()
          .then(newCardsPerPlayer => {
            if (newCardsPerPlayer) {
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
              io.to(roomId).emit('receiveRoomPatch', {...{operations}, updateCount: room.incrementUpdateCount()});
              io.to(roomId).emit('resetRoundValues', room.incrementUpdateCount());
            }
          });
      }
      else if (gamePhase === 'lobby') {
        logger.log('info', 'reset to lobby');
        io.to(roomId).emit('resetToLobby', room.incrementUpdateCount());
      }
    });
  });
}