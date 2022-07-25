import React from 'react';
import { Image, ListGroup } from 'react-bootstrap';

export default function Hand( { hand, selectedCard, setSelectedCard } ) {
  
  const handleSelectCard = card => {
    setSelectedCard(card);
  };

  return(
    <ListGroup>
      {hand.map(card =>
      <li key={card.cardId}>
        <Image src={card.locator} onClick={() => handleSelectCard(card)} />
        <p>{`card.locator = ${card.locator}`}</p>
      </li>)}
    </ListGroup>

  );
}