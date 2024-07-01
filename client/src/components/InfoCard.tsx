import React, { useState, useRef, useEffect } from 'react';
import { GameCard } from '../../../types';
import { Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import GameImage from './GameImage';

export default function InfoCard({ card }: { card: GameCard}) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flipcard selectable-no-grow" onClick={() => setIsFlipped(current => !current)}>
      <div className={`flipcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <Front card={card} />
        <Back cardId={card.id} isFlipped={isFlipped} />
        <div>
          <Image src='/image-placeholder.svg' fluid/>
        </div>
      </div>
    </div>
  );
}

function Front({ card }: { card: GameCard }) {
  return (
    <div className='flipcard-front'>
      <GameImage card={card} />
    </div>
  );
}

function Back({ cardId, isFlipped }: { cardId: string, isFlipped: boolean }) {
  const backRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (backRef.current) {
      backRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [isFlipped, backRef]);

  return (
    <div className={`d-flex flex-column bg-body justify-content-start ${isFlipped ?  'overflow-auto' : 'overflow-hidden'} flipcard-back card-img`}
      ref={backRef}
    >
      <Container className='py-4'>
        <CardInfoWrapper cardId={cardId} load={isFlipped}/>
      </Container>
    </div>
  );
}