import { JSONPatchOperation } from 'immutable-json-patch';
import { Room } from '../models/gameClasses.js';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../types.js';

export default function socketHandler(io: Server<ClientToServerEvents, ServerToClientEvents>, rooms: {[key: string]: Room}) {
  io.on('connection', socket => {
    console.log(`connection made: ${socket.id}`);

    // when client realizes something is wrong and needs to get the full room state
    socket.on('requestRoomState', (request) => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        console.log('invalid request');
        return;
      }

      console.log(`request from user ${userId} for state of room ${roomId}`);

      const room = rooms[roomId];
      // case where room does not exist
      if (!room) {
        console.log('room does not exist');
        return;
      }

      if(!room.isCurrentPlayer(userId)) {
        console.log(`user ${userId} is not a current member of room ${roomId}`);
        return;
      }

      console.log(`socketid ${socket.id} requested room state: sending room data`);
      io.to(socket.id).emit('receiveRoomState', room);
    });

    socket.on('joinRoom', (request, callback) => {
      const { roomId, userId } = request;
      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        console.log('invalid request');
        return;
      }


      console.log(`attempt to join room: roomId: ${roomId}, userId: ${userId}`);

      const room = rooms[roomId];
      // case where room does not exist
      if (!room) {
        console.log('room does not exist');
        return callback('Room not found');
      }
      
      // case where user is banned from room
      if (room.isKicked(userId)) {
        console.log('user has been kicked from room previously');
        return callback('You have been kicked from this room');
      }

      // case where user is already in room
      if (room.isCurrentPlayer(userId)) {
        console.log(`${userId} is current player`);
        // rejoins room
        socket.join(roomId);
        io.to(socket.id).emit('receiveRoomState', room);
        console.log(`sending room data to socketid ${socket.id}`);
        return;
      }
      
      // if room is full sends error
      const roomIssue = room.isNotJoinable();
      if (roomIssue !== undefined) {
        console.log(`${userId} could not join room: ${roomIssue}`);
        return callback(`could not join room: ${roomIssue}`);
      }
        
      // adds player to room
      console.log(`adding ${userId} to player list`);
      const {newPlayer, index} = room.addPlayer(userId);

      // record that we have updated the room
      const updateCount = room.incrementUpdateCount();

      // send joining player entire room state
      io.to(socket.id).emit('receiveRoomState', room);
      // send players already in room a patch with new player
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

      // add new player to room socket
      socket.join(roomId);
      
      console.log(`playerId ${userId} has joined room ${roomId}`);
      console.log(`player list = ${JSON.stringify(room.players)}`);
    });
    
    socket.on('kickPlayer', request => {
      const { roomId, userId, kickUserId } = request;
      if ([roomId, userId, kickUserId].some(val => typeof val !== 'string') ) {
        console.log('invalid request');
        return;
      }

      const room = rooms[roomId];

      // successful kick
      if (!room) {
        return;
      } 
      const kickedPlayerIndex = room.kickPlayer(userId, kickUserId);
      if (kickedPlayerIndex !== -1) {
        console.log(`kicked player ${kickUserId}`);
        const updateCount = room.incrementUpdateCount();
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [
            {
              'op': 'add',
              'path': '/kickedPlayers/-',
              'value': `${kickUserId}`,
            },
            {
              'op': 'remove',
              'path': `/players/${kickedPlayerIndex}`
            },
          ],
          updateCount: updateCount
        });
      }
      else {
        console.log(`could not kick player ${kickUserId}`);
      }
    });

    socket.on('leaveRoom', (request, callback) => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        console.log('invalid request');
        return;
      }

      console.log(`player ${userId} attempting to leave room ${roomId}`);
      // check for existence of room

      const room = rooms[roomId];

      if (!room) {
        console.log('left room does not exist');
        return callback('Room does not exist');
      }
      const playerIndex = room.removePlayer(userId);
      // successful exit
      if (playerIndex !== -1) {
        console.log('player removed successfully');
        io.to(roomId).emit('receiveRoomPatch', {
          operations: [
            {
              'op': 'remove',
              'path': `/players/${playerIndex}`
            }
          ],
          updateCount: room.incrementUpdateCount()
        });
      }
      else {
        console.log('unable to remove player');
      }
    });
    
    socket.on('changeName', request => {
      const { roomId, userId, newName } = request;

      if ([roomId, userId, newName].some(val => typeof val !== 'string') ) {
        console.log('invalid request');
        return;
      }

      const trimmedNewName = newName.trim();
      console.log(`player ${userId} attempting to change name to ${trimmedNewName}`);
      const room = rooms[roomId];
      if (!room) {
        return;
      }

      // attempts to change name
      const { changedName, playerIndex } = room.changeName(userId, trimmedNewName);
      if (playerIndex === -1) {
        console.log(`player ${userId} could not succesfully change name`);
        return;
      }
      io.to(roomId).emit('receiveRoomPatch', {
        operations: [
          {
            'op': 'replace',
            'path': `/players/${playerIndex}/playerName`,
            'value': changedName,
          }
        ],
        updateCount: room.incrementUpdateCount()
      });
    });

    socket.on('changeOptions', request => {
      const { roomId, userId, newOptions } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string' || typeof newOptions !== 'number') {
        console.log('invalid request');
        return;
      }

      console.log(`player ${userId} attempting to change options to ${newOptions}`);

      const room = rooms[roomId];
      if (!room) {
        console.log('room does not exist');
        return;
      }

      const changedOptions = room.changeOptions(userId, newOptions);
      if (changedOptions === undefined) {
        console.log('could not change options');
        return;
      }

      console.log('options changed');
      io.to(roomId).emit('receiveRoomPatch', {
        operations: 
        [
          {
            'op': 'replace',
            'path': '/targetScore',
            'value': changedOptions,
          }
        ],
        updateCount: room.incrementUpdateCount()
      });
    });
    
    socket.on('startGame', request => {
      const { roomId, userId } = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        console.log('invalid request');
        return;
      }


      console.log(`player ${userId} attempting to start game in room ${roomId}`);
      const room = rooms[roomId];
      if (room && room.startGame(userId)) {
        io.to(roomId).emit('receiveRoomState', room);
        console.log('game started. populating hands...');
        // populate hands returns a promise
        room.populateHands() 
          .then(newCardsPerPlayer => {
            if (newCardsPerPlayer) {
              console.log('hands populated');
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
              console.log('unable to start game');
            }
          });
      }
      
      else {
        console.log('unable to start game');
      }
      
    });
    
    socket.on('submitStoryCard', request => {
      const { roomId, userId, selectedCardId, descriptor } = request;
      
      if ([roomId, userId, selectedCardId, descriptor].some(val => typeof val !== 'string') ) {
        console.log('invalid request');
        return;
      }

      const room = rooms[roomId];
      if (!room) {
        return;
      }
      const { card, playerIndex, handIndex, storyDescriptor, gamePhase } = room.submitStoryCard(userId, selectedCardId, descriptor.trim()); 
      if (card === undefined || playerIndex === -1 || handIndex === -1) {
        console.log('unable to submit card');
        return;
      }

      console.log(`Story card ${selectedCardId} submitted by ${userId}`);
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
        console.log('invalid request');
        return;
      }

      const room = rooms[roomId];
      if (!room) {
        return; 
      }
      // check that user is able to submit other card
      const { card, playerIndex, handIndex, gamePhase } = room.submitOtherCard(userId, selectedCardId);
      if (card === undefined || playerIndex === -1 || handIndex === -1) {
        console.log('could not submit other card');
        return;
      }
      console.log(`Other card ${selectedCardId} submitted by ${userId}`);
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
        console.log('invalid request');
        return;
      }

      console.log('received guess');

      const room = rooms[roomId];
      if (!room) {
        console.log('room does not exist');
        return;
      }

      // check that user is able to make guess
      const {isSuccessful, scoringInfo} = room.makeGuess(userId, selectedCardId);
      if (!isSuccessful) {
        console.log('could not submit guess');
      }
      console.log(`${userId} made guess`);
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
      console.log('received end scoring request');
      const {roomId, userId} = request;

      if (typeof roomId !== 'string' || typeof userId !== 'string') {
        console.log('invalid request');
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
        console.log('going into next round');
        room.populateHands()
          .then(newCardsPerPlayer => {
            if (newCardsPerPlayer) {
              console.log('populated hands for next round');
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
        console.log('reset to lobby');
        io.to(roomId).emit('resetToLobby', room.incrementUpdateCount());
      }
    });
  });
}