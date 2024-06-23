import React from 'react';
import { GameCard } from '../../../types';
import { Row, Col, Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function InfoCard({ card }: { card: GameCard}) {

  return (
    <>
      <Front locator={card.locator} />
      <Back cardId={card.id} />
    </>
  );
}

function Front({ locator }: { locator: string }) {
  return (
    <Container className='w-100'>
      <Image src={locator} className="card-img" fluid />
    </Container>
  );
}

function Back({ cardId }: { cardId: string }) {
  return (
    <Container className='w-100'>
      <CardInfoWrapper cardId={cardId}/>
    </Container>
  );
}