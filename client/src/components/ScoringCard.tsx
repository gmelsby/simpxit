import React from 'react';
import { Accordion, Card as BootstrapCard, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import { Player, GameCard } from '../../../types';

export default function ScoringCard({ player, card, guessedPlayers, isStoryTeller }:
  {player: Player, card: GameCard, guessedPlayers: Player[], isStoryTeller: boolean}) {
  const GuessedInfo = () => {
    return (
      <>
        {guessedPlayers.map(p => 
          (<p key={p.playerId}><b>{p.playerName}</b></p>)
        )}
      </>
    );
  };

  return (
    <Col>
      <BootstrapCard className="card-img">
        <BootstrapCard.Img variant="top" src={card.locator} className="card-img"/>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Card Info</Accordion.Header>
            <Accordion.Body>
              <CardInfoWrapper cardId={card.id} />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <BootstrapCard.Body>
          <BootstrapCard.Title>Submitted by {isStoryTeller && 'Storyteller '}{!isStoryTeller && player.playerName}</BootstrapCard.Title>
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
        </BootstrapCard.Body>
      </BootstrapCard>
    </Col>
  );
}