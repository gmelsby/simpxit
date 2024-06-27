import React from 'react';
import { Button, Col, Row, Container, Placeholder } from 'react-bootstrap';
import { Player } from '../../../types';

export default function PlayerList({ players, setKickUserId, userId, isAdmin, isScoreboard }:
  {players: Player[], setKickUserId?: (value: React.SetStateAction<string>) => void, userId: string, isAdmin?: boolean, isScoreboard?: boolean}) {
  // descending sort
  const playerList = isScoreboard ? players.toSorted((p1, p2) => p2.score - p1.score) : players;
  return (
    <Container>
      {playerList.map((player, idx) => <PlayerEntry player={player} 
        setKickUserId={setKickUserId} 
        userId={userId} 
        isAdmin={isAdmin} 
        isScoreboard={isScoreboard}
        index={idx}
        key={player.playerId} />)}
    </Container>
  );
}

function PlayerEntry({ player, setKickUserId, userId, isAdmin, isScoreboard, index }:
  {player: Player, setKickUserId?: (value: React.SetStateAction<string>) => void, userId: string, isAdmin?: boolean, isScoreboard?: boolean, index: number}) {
  const handleKickThisPlayer = () => {
    if (setKickUserId !== undefined) {
      setKickUserId(player.playerId);
    }
  };
  
  if (isScoreboard) {
    return (
      <Row>
        <Col xs={10}>
          {player.playerName === '' ? 
            <Placeholder as="p" animation='wave'>
              <Placeholder xs={index % 2 ? 5 : 4} bg='info' />
            </Placeholder>
            :
            <>
              {player.playerId === userId && <p><b>{player.playerName}</b></p>}
              {player.playerId !== userId && <p>{player.playerName}</p>}
            </>
          }
        </Col>
        <Col xs={1}>
          <p>{player.score}</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="my-0 my-md-2 justify-content-center">
      <Col></Col>
      <Col>
        {player.playerName === '' ? 
          <Placeholder as="p" animation='wave'>
            <Placeholder bg='info' xs={index % 2 ? 7 : 6} md={index % 2 ? 4 : 3} />
          </Placeholder> :
          <>
            {player.playerId === userId && <p><b>{player.playerName}</b></p>}
            {player.playerId !== userId && <p>{player.playerName}</p>}
          </>
        }
      </Col>
      <Col className="d-flex flex-direction-row justify-content-start">
        {isAdmin && player.playerId !== userId && 
        (<div>
          <Button variant="outline-danger" size="sm" onClick={handleKickThisPlayer}>Kick</Button>
        </div>)}
      </Col>
    </Row>
  );
}
