import React from 'react';
import { Image, Col, Row } from 'react-bootstrap';
import { Card } from "../../types"

export default function Hand( { hand, setSelectedCard, isGallery }: {hand: Card[], setSelectedCard: Function, isGallery?: boolean}) {
  
  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
  };

  // makes cards selectable if Hand is not a Gallery
  const selectable = isGallery ? "" : "selectable";

  return(
    <Row xs={1} sm={2} md={Math.min(3, hand.length)} className="justify-content-center g-2 my-3 mx-3">
      {hand.map(card =>
      <Col key={card.cardId} >
        <Image src={card.locator} className={selectable} fluid onClick={() => handleSelectCard(card)} />
      </Col>)}
    </Row>
  );
};