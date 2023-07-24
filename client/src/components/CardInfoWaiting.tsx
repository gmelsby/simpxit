import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import WaitingOn from './WaitingOn';
import { Player, Card } from '../../../types';



export default function CardInfoWaiting({ use, storyDescriptor, cards, waitingOn }:  {use: "storyTeller" | "deceive" | "guess",
  storyDescriptor: string,
  cards: Card[],
  waitingOn: Player[]
  }) 
{

  const use_to_message_map = {
    storyTeller : `You submitted the descriptor "${storyDescriptor}" for this image:`,
    deceive : `For the descriptor "${storyDescriptor}" you submitted this image:`,
    guess : `For the descriptor "${storyDescriptor}" you guessed this image:`
  };

  const message = use_to_message_map[use];

  return (
    <>
    {cards.map(card => 
      <Container className="text-center pt-5 mb-4" key={card.cardId}>
        <h3 className="mb-4">{message}</h3>
        <Row xs={1} md={2}>
          <Col><Image src={card.locator} className="card-img" fluid /></Col>
          <Col className="my-auto"><CardInfoWrapper card={card} /></Col>
        </Row>
      </Container>)}
    <Container className="text-center mt-4 pb-5">
      <WaitingOn waitingOn={waitingOn} />
    </Container>
    </>
  );
}
