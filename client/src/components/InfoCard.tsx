import React from 'react';
import { GameCard } from '../../../types';
import { Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function InfoCard({ card }: { card: GameCard}) {

  return (
    <div className="flipcard">
      <div className="flipcard-inner">
        <Front locator={card.locator} />
        <Back cardId={card.id} />
      </div>
    </div>
  );
}

function Front({ locator }: { locator: string }) {
  return (
    <Container className='flipcard-front'>
      <Image src={locator} className="card-img" fluid />
    </Container>
  );
}

function Back({ cardId }: { cardId: string }) {
  return (
    <Container className='bg-body flipcard-back'>
      <CardInfoWrapper cardId={cardId}/>
    </Container>
  );
}