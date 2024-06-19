import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import WaitingOn from './WaitingOn';
import { Player, GameCard } from '../../../types';



export default function CardInfoWaiting({ use, storyDescriptor, cards, waitingOn }:  {use: 'storyTeller' | 'deceive' | 'guess',
  storyDescriptor: string,
  cards: GameCard[],
  waitingOn: Player[]
  }) 
{

  const phraseMap = {
    storyTeller : ['You submitted the descriptor', 'for this card'],
    deceive : ['For the descriptor', 'you submitted this card'],
    guess : ['For the descriptor', 'you guessed this card']
  };

  return (
    <>
      {cards.map(card => 
        <Container className="text-center pt-5 mb-4" key={card.id}>
          <h3 className="">
            {phraseMap[use][0]}
          </h3>
          <h2>
            <b>{storyDescriptor}</b> 
          </h2>
          <h3 className="mb-4">
            {phraseMap[use][1]}
          </h3>
          <Row xs={1} md={2}>
            <Col><Image src={card.locator} className="card-img" fluid /></Col>
            <Col className="my-auto"><CardInfoWrapper cardId={card.id} /></Col>
          </Row>
        </Container>)}
      <Container className="text-center mt-4 pb-5">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </>
  );
}
