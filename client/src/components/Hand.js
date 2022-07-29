import React from 'react';
import { Image, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function Hand( { hand, selectedCard, setSelectedCard } ) {
  
  const handleSelectCard = card => {
    setSelectedCard(card);
  };

  return(
    <ListGroup>
      {hand.map(card =>
      <ListGroupItem key={card.cardId}>
        <Image src={card.locator} fluid onClick={() => handleSelectCard(card)} />
      </ListGroupItem>)}
    </ListGroup>

  );
}