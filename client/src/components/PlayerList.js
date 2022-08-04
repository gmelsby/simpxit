import React from 'react';
import { Button, Col, Row, Container } from 'react-bootstrap';

export default function PlayerList({ players, setKickUserId, userId, isAdmin, scoreboard }) {
  const playerList = scoreboard ? players.sort((p1, p2) => p2.score - p1.score ) : players;
  return (
  <Container>
    {playerList.map((player) => <PlayerEntry player={player} 
      setKickUserId={setKickUserId} 
      userId={userId} 
      isAdmin={isAdmin} 
      scoreboard={scoreboard}
      key={player.playerId} />)}
  </Container>
  );
}

function PlayerEntry({ player, setKickUserId, userId, isAdmin, scoreboard }) {
  const handleKickThisPlayer = () => {
    setKickUserId(player.playerId);
  };
  
  if (scoreboard) {
    return (
      <Row>
        <Col xs="auto">
          {player.playerId === userId && <p><b>{player.playerName}</b></p>}
          {player.playerId !== userId && <p>{player.playerName}</p>}
        </Col>
        <Col xs={1}>
          <p>{player.score}</p>
        </Col>
      </Row>
    )
  }

  return (
    <Row className="justify-content-center">
      <Col xs={3}></Col>
      <Col xs="auto">
        {player.playerId === userId && <p><b>{player.playerName}</b></p>}
        {player.playerId !== userId && <p>{player.playerName}</p>}
      </Col>
      <Col xs={3}>
      {isAdmin && player.playerId !== userId && 
        <Button variant="danger" onClick={handleKickThisPlayer}>Kick</Button>}
      </Col>
    </Row>
  );
}
