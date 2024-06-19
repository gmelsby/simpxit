import React from 'react';
import { Card as BootstrapCard, Col, } from 'react-bootstrap';
import { Player, GameCard } from '../../../types';

export default function ScoringCard({ player, card, /*guessedPlayers,*/ isStoryTeller }:
  {player: Player, card: GameCard, guessedPlayers: Player[], isStoryTeller: boolean}) {
  /*const GuessedInfo = () => {
    return (
      <>
        {guessedPlayers.map(p => 
          (<p key={p.playerId}><b>{p.playerName}</b></p>)
        )}
      </>
    );
  };*/

  return (
    <Col>
      <BootstrapCard className="card-img">
        <BootstrapCard.Img variant="top" src={card.locator} className="card-img"/>
        <BootstrapCard.Body>
          <BootstrapCard.Title>Submitted by {isStoryTeller && 'Storyteller '}{!isStoryTeller && player.playerName}</BootstrapCard.Title>
        </BootstrapCard.Body>
      </BootstrapCard>
    </Col>
  );
}