import React, { useState } from 'react';
import { GameCard } from '../../../types';
import { Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function InfoCard({ card }: { card: GameCard}) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flipcard" onClick={() => setIsFlipped(current => !current)}>
      <div className={`flipcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <Front locator={card.locator} />
        <Back cardId={card.id} />
        <Image src='/image-placeholder.svg' fluid/>
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