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
  return (players.length > 0 && players[0].playerId === uuid);
}
