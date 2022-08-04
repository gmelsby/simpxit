import { Accordion, Card, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function ScoringCard({ player, card, guessedPlayers, isStoryTeller }) {
  const GuessedInfo = () => {
    return (
      <>
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
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Card Info</Accordion.Header>
              <Accordion.Body>
                <CardInfoWrapper card={card} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        <Card.Body>
          <Card.Title>Submitted by {isStoryTeller && "Storyteller "}{!isStoryTeller && player.playerName}</Card.Title>
          <ListGroup variant="flush">
            <ListGroupItem>
              <p>Guessed by {guessedPlayers.length} Players</p>
              {guessedPlayers.length !== 0 && <GuessedInfo />}
            </ListGroupItem>
            <ListGroupItem>
              <p>{player.playerName} earned {player.scoredThisRound} points.</p>
              <p>{player.playerName} now has {player.score} points.</p>
            </ListGroupItem>
          </ListGroup>
        </Card.Body>
      </Card>
    </Col>
  );
}