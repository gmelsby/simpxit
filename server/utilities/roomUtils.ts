import { Room, Player } from '../../types';

// returns true if a player with the currently passed-in id is already in the room
export function isCurrentPlayer(room: Room, uuid: string) {
  if (room.players.map(p => p.playerId).includes(uuid)){
    return true;
  }
  
  return false;
}

// returns true if player with passed-in id is admin, otherwise false
export function isAdmin(players: Player[], uuid: string) {
  return findPlayerIndex(players, uuid) === 0;
}

export function findPlayerIndex(players: Player[], uuid: string) {
  return players.findIndex(p => p.playerId === uuid);
}

// returns { changedName, playerIndex } if name change is allowed
export function approveNameChange(players: Player[], uuid: string, newName: string) {
  // check that target player is a player
  const playerIndex = findPlayerIndex(players, uuid);
  if (playerIndex === -1 || isNameInUse(players, newName) || newName.length === 0) {
    return { approvedName: '', playerIndex: -1};
  }

  return { approvedName: newName, playerIndex};
}

// returns true if name is in use, false otherwise
function isNameInUse(players: Player[], newName: string) {
  if(players.map(player => player.playerName.toLowerCase()).includes(newName.toLowerCase())) {
    return true;
  }
  return false;
}

