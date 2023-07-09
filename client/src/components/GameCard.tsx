import React, { useState } from "react";
import { Image } from 'react-bootstrap';
import { Card } from '../../../types';

export default function GameCard({ card, handleSelectCard, selectablecard, className=""}: {card : Card, handleSelectCard?: Function, selectablecard: string, className?: string}) {
  // wait to apply style until images are fully loaded
  const [loaded, setLoaded]  = useState(false);

  return (
    <Image src={card.locator} className={`${loaded ? `card-img ${selectablecard}` : ""} ${className}`} 
    onClick={() => handleSelectCard ? handleSelectCard(card) : {}} fluid
    onLoad={() => setLoaded(true)} 
    />
  )
}