import React, { useState } from 'react';
import { GameCard } from '../../../types';
import { Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function InfoCard({ card }: { card: GameCard}) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flipcard selectable-no-grow" onClick={() => setIsFlipped(current => !current)}>
      <div className={`flipcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <Front locator={card.locator} />
        <Back cardId={card.id} />
        <div>
          <Image src='/image-placeholder.svg' fluid/>
        </div>
      </div>
    </div>
  );
}

function Front({ locator }: { locator: string }) {
  return (
    <div className='flipcard-front'>
      <Image src={locator} className="card-img" fluid />
    </div>
  );
}

function Back({ cardId }: { cardId: string }) {
  return (
    <div className='d-flex flex-column bg-body overflow-auto flipcard-back card-img'
      // allows overflow scrolling from top
      style={{justifyContent: 'safe center'}}>
      <Container className='py-4'>
        <CardInfoWrapper cardId={cardId}/>
      </Container>
    </div>
  );
}