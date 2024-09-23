import React, { useState, useRef, useEffect } from 'react';
import { GameCard } from '../../../types';
import { Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import GameImage from './GameImage';
import JustifySafelyContainer from './JustifySafelyContainer';

export default function InfoCard({ card, externalFlipControl }: { card: GameCard, externalFlipControl?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(externalFlipControl !== undefined ? externalFlipControl : false);
  // keep isFlipped in sync with externalFlipControl
  // if externalFlipControl becomes undefined set to front
  useEffect(() => {
    setIsFlipped(externalFlipControl === undefined ? false : externalFlipControl);
  }, [externalFlipControl]);

  return (
    <div className="flipcard selectable-no-grow" onClick={() => {
      if (externalFlipControl === undefined) {
        setIsFlipped(current => !current);
      }
    }}
    >
      <div className={`flipcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <Front card={card} />
        <Back cardId={card.id} isFlipped={isFlipped} />
        <div>
          <Image src='/image-placeholder.svg' fluid />
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
    <JustifySafelyContainer justifyType='center' overflowType={isFlipped ? 'auto' : 'hidden'}
      className={`d-flex flex-column bg-body flipcard-back card-img ${isFlipped ? '' : 'pe-none'}`}
      containerRef={backRef}
    >
      <Container className='py-4'>
        <CardInfoWrapper cardId={cardId} load={isFlipped} transparentBuffer />
      </Container>
    </JustifySafelyContainer>
  );
}