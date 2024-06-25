import { Room } from '../gameClasses.js';
import { Server } from 'socket.io';

export default function socketHandler(io: Server, rooms: {[key: string]: Room}) {
  io.on('connection', socket => {
    console.log(`connection made: ${socket.id}`);

    // when client realizes something is wrong and needs to get the full room state
    socket.on('requestRoomState', (request, callback) => {
      const { roomId, userId } = request;

      console.log(`request from user ${userId} for state of room ${roomId}`);

      // case where room does not exist
      if (!(roomId in rooms)) {
        console.log('room does not exist');
        return callback('Room not found');
      }

      if(!rooms[roomId].isCurrentPlayer(userId)) {
        console.log(`user ${userId} is not a current member of room ${roomId}`);
        return callback('Something went wrong. Please try joining the room again.');
      }

      io.to(socket.id).emit('receiveRoomState', rooms[roomId]);
    });

    socket.on('joinRoom', (request, callback) => {
      const { roomId, userId } = request;
      console.log(`attempt to join room: roomId: ${roomId}, userId: ${userId}`);

      // case where room does not exist
      if (!(roomId in rooms)) {
        console.log('room does not exist');
        return callback('Room not found');
      }
      
      // case where user is banned from room
      if (rooms[roomId].isKicked(userId)) {
        console.log('user has been kicked from room previously');
        return callback('You have been kicked from this room');
      }

      // case where user is already in room
      if (rooms[roomId].isCurrentPlayer(userId)) {
        console.log(`${userId} is current player`);
        // rejoins room
        socket.join(roomId);
        io.to(socket.id).emit('receiveRoomState', rooms[roomId]);
        console.log(`sending room data to socketid ${socket.id}`);
        return;
      }
      
      // if room is full sends error
      if (!rooms[roomId].isJoinable()) {
        console.log(`${userId} could not join room: room is full`);
        return callback('Room is full');
      }
        
      // adds player to room
      console.log(`adding ${userId} to player list`);
      const {newPlayer, index} = rooms[roomId].addPlayer(userId);

      // send joining player entire room state
      io.to(socket.id).emit('receiveRoomState', rooms[roomId]);
      // send players already in room a patch with new player
      io.to(roomId).emit('receiveRoomPatch', [
        {
          'op': 'add',
          'path': `/players/${index}`,
          'value': newPlayer,
        }
      ]);

      // add new player to room socket
      socket.join(roomId);
      
      console.log(`playerId ${userId} has joined room ${roomId}`);
      console.log(`player list = ${JSON.stringify(rooms[roomId].players)}`);

      callback();
    });
    
    socket.on('kickPlayer', request => {
      const { roomId, userId, kickUserId } = request;
      // successful kick
      if (!rooms[roomId]) {
        return;
      } 
      const kickedPlayerIndex = rooms[roomId].kickPlayer(userId, kickUserId);
      if (kickedPlayerIndex !== -1) {
        console.log(`kicked player ${kickUserId}`);
        io.to(roomId).emit('receiveRoomPatch', [
          {
            'op': 'add',
            'path': '/kickedPlayers/-',
            'value': `${kickUserId}`,
          },
          {
            'op': 'remove',
            'path': `/players/${kickedPlayerIndex}`
          },
        ]);
      }
      else {
        console.log(`could not kick player ${kickUserId}`);
      }
    });

    socket.on('leaveRoom', (request, callback) => {
      const { roomId, userId } = request;
      console.log(`player ${userId} attempting to leave room ${roomId}`);
      // check for existence of room
      if (rooms[roomId] === undefined) {
        console.log('left room does not exist');
        return callback('Room does not exist');
      }
      const playerIndex = rooms[roomId].removePlayer(userId);
      // successful exit
      if (playerIndex !== -1) {
        console.log('player removed successfully');
        io.to(roomId).emit('receiveRoomPatch', [
          {
            'op': 'remove',
            'path': `/players/${playerIndex}`
          }
        ]);
      }
      else {
        console.log('unable to remove player');
      }
    });
    
    socket.on('changeName', request => {
      const { roomId, userId, newName } = request;
      const trimmedNewName = newName.trim();
      console.log(`player ${userId} attempting to change name to ${trimmedNewName}`);
      if (!rooms[roomId]) {
        return;
      }

      // attempts to change name
      const { changedName, playerIndex } = rooms[roomId].changeName(userId, trimmedNewName);
      if (playerIndex === -1) {
        console.log(`player ${userId} could not succesfully change name`);
        return;
      }
      io.to(roomId).emit('receiveRoomPatch', [
        {
          'op': 'replace',
          'path': `/players/${playerIndex}/playerName`,
          'value': changedName,
        }
      ]);
    });

    socket.on('changeOptions', request => {
      const { roomId, userId, newOptions } = request;
      if (!rooms[roomId]) {
        return;
      }
      console.log(`player ${userId} attempting to change options to ${newOptions}`);

      if (!rooms[roomId]) {
        console.log('room does not exist');
        return;
      }

      const changedOptions = rooms[roomId].changeOptions(userId, newOptions);
      if (changedOptions === undefined) {
        console.log('could not change options');
        return;
      }

      console.log('options changed');
      io.to(roomId).emit('receiveRoomPatch', [
        {
          'op': 'replace',
          'path': '/targetScore',
          'value': changedOptions,
        }
      ]);

    });
    
    socket.on('startGame', request => {
      const { roomId, userId } = request;
      console.log(`player ${userId} attempting to start game in room ${roomId}`);
      if (rooms[roomId] && rooms[roomId].startGame(userId)) {
        io.to(roomId).emit('receiveRoomState', rooms[roomId]);
        console.log('game started. populating hands...');
        // populate hands returns a promise
        rooms[roomId].populateHands() 
          .then(bool => {
            if (bool) {
              console.log('hands populated');
              io.to(roomId).emit('receiveRoomState', rooms[roomId]);
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
      const { roomId, userId, selectedCard, descriptor } = request;
      // check that user is able to submit card
      if (rooms[roomId] && rooms[roomId].submitStoryCard(userId, selectedCard, descriptor.trim())) {
        console.log(`Story card ${selectedCard.id} submitted by ${userId}`);
        io.to(roomId).emit('receiveRoomState', rooms[roomId]);
      }
      
      else {
        console.log('unable to submit story card');
      }
      
    });

    socket.on('submitOtherCard', request => {
      const { roomId, userId, selectedCard} = request;
      // check that user is able to submit other card
      if (rooms[roomId] && rooms[roomId].submitOtherCard(userId, selectedCard)) {
        console.log(`Other card ${selectedCard.id} submitted by ${userId}`);
        io.to(roomId).emit('receiveRoomState', rooms[roomId]);
      }
      
      else {
        console.log('unable to submit other card');
      }
    });
    
    socket.on('guess', request => {
      console.log('received guess');
      const {roomId, userId, selectedCard} = request;
      // check that user is able to make guess
      if (rooms[roomId] && rooms[roomId].makeGuess(userId, selectedCard.id)) {
        console.log(`${userId} made guess`);
        io.to(roomId).emit('receiveRoomState', rooms[roomId]);
      }
    });
    
    socket.on('endScoring', request => {
      console.log('received end scoring request');
      const {roomId, userId} = request;
      // signal that user is ready to move on to next phase
      if (rooms[roomId] && rooms[roomId].endScoring(userId)) {
        rooms[roomId].populateHands()
          .then(bool => {
            if (bool) {
              console.log('request accepted');
              io.to(roomId).emit('receiveRoomState', rooms[roomId]);
            }
            else {
              console.log('unable to end scoring');
            }
          });
        io.to(roomId).emit('receiveRoomState', rooms[roomId]);
      }
    });  

  });

}