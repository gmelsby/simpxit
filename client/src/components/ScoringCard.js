import { Accordion, Card, Col } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function ScoringCard({ player, card, guessedPlayers, isStoryTeller }) {
  const GuessedInfo = () => {
    return (
      <>
        {guessedPlayers.map(p => 
          (<p key={p.playerId}>{p.playerName}</p>)
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

          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Guessed by {guessedPlayers.length} Players</Accordion.Header>
              <Accordion.Body>
                {guessedPlayers.length !== 0 && <GuessedInfo />}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Scoring</Accordion.Header>
              <Accordion.Body>
                <p>{player.playerName} earned {player.scoredThisRound} points.</p>
                <p>{player.playerName} now has {player.score} points.</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Card Info</Accordion.Header>
              <Accordion.Body>
                <CardInfoWrapper card={card} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card.Body>
      </Card>
    </Col>
  );
}