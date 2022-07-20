import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';

export default function Hand( { hand, selectedCard, setSelectedCard } ) {
  
  const handleSelectCard = card => {
    setSelectedCard(card);
  };

  return(
    <ListGroup>
      {hand.map(card =>
      <li key={card.cardId}>
        <img src={card.locator}></img>
        <Button onClick={() => handleSelectCard(card)}>Select</Button>
      </li>)}
    </ListGroup>

  );
}