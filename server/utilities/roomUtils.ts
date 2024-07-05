import { Room } from '../../types';

// returns true if a player with the currently passed-in id is already in the room
export function isCurrentPlayer(room: Room, uuid: string) {
  if (room.players.map(p => p.playerId).includes(uuid)){
    return true;
  }
  
  return false;
}
