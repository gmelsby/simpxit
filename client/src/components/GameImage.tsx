import React, { useState } from 'react';
import { Image } from 'react-bootstrap';
import { GameCard } from '../../../types';

export default function GameImage({ card, handleSelectCard, selectablecard, className=''}: {card : GameCard, handleSelectCard?: (card: GameCard) => void, selectablecard: string, className?: string}) {
  // wait to apply style until images are fully loaded
  const [loaded, setLoaded]  = useState(false);

  return (
    <Image src={card.locator} className={`${loaded ? `card-img ${selectablecard}` : ''} ${className}`} 
      onClick={() => handleSelectCard ? handleSelectCard(card) : {}} fluid
      onLoad={() => setLoaded(true)} 
    />
  );
}