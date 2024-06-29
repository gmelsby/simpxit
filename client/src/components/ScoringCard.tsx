import React, { useCallback } from 'react';
import { Card as BootstrapCard, Col, Row } from 'react-bootstrap';
import { Player, GameCard } from '../../../types';

export default function ScoringCard({ player, card, guessedPlayers, isStoryTeller }:
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

  // returns the html code for the number in a cicle for numbers 1-8
  const circleNumberHtmlCalc = useCallback(((n: number) => String.fromCharCode(0x245F + n)), []);

  return (
    <Col>
      <BootstrapCard className="card-img selectable-no-grow">
        <BootstrapCard.Img variant="bottom" src={card.locator} className="card-img"/>
        <BootstrapCard.Body>
          <Row className='justify-content-center flex-nowrap'>
            <Col></Col>
            <Col xs={6} md={8}>
              <Row clasName='pb-0 mb-0'>
                <p className='mb-0'>Submitted by</p>
              </Row>
              <Row className='pt-0 mt-0'>
                <h5 className='mt-1'>{isStoryTeller && 'Storyteller '}{!isStoryTeller && player.playerName}</h5>
              </Row>
            </Col>
            <Col className='d-flex flex-column justify-content-center'>
              {guessedPlayers.length !== 0 &&
                <h2><b>{circleNumberHtmlCalc(guessedPlayers.length)}</b></h2>
              }
            </Col>
          </Row>
        </BootstrapCard.Body>
      </BootstrapCard>
    </Col>
  );
}