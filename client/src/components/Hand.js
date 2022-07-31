import React from 'react';
import { Image, Col, Row } from 'react-bootstrap';

export default function Hand( { hand, setSelectedCard } ) {
  
  const handleSelectCard = card => {
    setSelectedCard(card);
  };

  return(
    <Row xs={2} md={Math.min(3, hand.length)} className="g-2">
      {hand.map(card =>
      <Col key={card.cardId} >
        <Image src={card.locator} fluid onClick={() => handleSelectCard(card)} />
      </Col>)}
    </Row>
  );
}