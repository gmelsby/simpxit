import { Card, Col } from 'react-bootstrap';

export default function ScoringCard({ player, card, guessedPlayers, isStoryTeller }) {
  const GuessedInfo = () => {
    return (
      <>
        <p>Card guessed by:</p>
        {guessedPlayers.map(p => 
          (<p key={p.playerId}><b>{p.playerName}</b></p>)
        )}
      </>
    );
  }

  return (
    <Col>
      <Card>
        <Card.Img variant="top" src={card.locator} />
        <Card.Body>
          <Card.Title>Submitted by {isStoryTeller && "Storyteller "}{player.playerName}</Card.Title>
          <p>They earned {player.scoredThisRound} points.</p>
          <p>They now have {player.score} points.</p>
          {guessedPlayers.length !== 0 && <GuessedInfo />}
        </Card.Body>
      </Card>
    </Col>
  );
}