import React from 'react';
import { Button } from 'react-bootstrap';

export default function PlayerList({ players, handleKick, userId, isAdmin }) {
  return (
  <ul>
    {players.map((player) => <PlayerEntry player={player} 
      handleKick={handleKick} 
      userId={userId} 
      isAdmin={isAdmin} 
      key={player.playerId} />)}
  </ul>
  );
}

function PlayerEntry({ player, handleKick, userId, isAdmin }) {
  const handleKickThisPlayer = () => {
    handleKick(player.playerId);
  };
  return (
  <li>
    {player.playerName}
    {isAdmin && player.playerId !== userId && 
    <Button variant="danger" onClick= {handleKickThisPlayer}>Kick</Button>}
  </li>
  )
}
