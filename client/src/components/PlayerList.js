import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';

export default function PlayerList({ players, setKickUserId, userId, isAdmin }) {
  return (
  <ListGroup className="w-50 p-3">
    {players.map((player) => <PlayerEntry player={player} 
      setKickUserId={setKickUserId} 
      userId={userId} 
      isAdmin={isAdmin} 
      key={player.playerId} />)}
  </ListGroup>
  );
}

function PlayerEntry({ player, setKickUserId, userId, isAdmin }) {
  const handleKickThisPlayer = () => {
    setKickUserId(player.playerId);
  };
  return (
  <ListGroup.Item>
    {player.playerName}
    {isAdmin && player.playerId !== userId && 
    <Button variant="danger" onClick={handleKickThisPlayer}>Kick</Button>}
  </ListGroup.Item>
  )
}
