import React from 'react';
import { Button } from 'react-bootstrap';

export default function PlayerList({ players, setKickUserId, userId, isAdmin }) {
  return (
  <ul>
    {players.map((player) => <PlayerEntry player={player} 
      setKickUserId={setKickUserId} 
      userId={userId} 
      isAdmin={isAdmin} 
      key={player.playerId} />)}
  </ul>
  );
}

function PlayerEntry({ player, setKickUserId, userId, isAdmin }) {
  const handleKickThisPlayer = () => {
    setKickUserId(player.playerId);
  };
  return (
  <li>
    {player.playerName}
    {isAdmin && player.playerId !== userId && 
    <Button variant="danger" onClick={handleKickThisPlayer}>Kick</Button>}
  </li>
  )
}
