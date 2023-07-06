import React, { useState, useEffect } from 'react';
import { Image, Col, Row, Carousel, Container, Button } from 'react-bootstrap';
import { Card } from "../../../types"

export default function Hand( { hand, setSelectedCard, isGallery }: {hand: Card[], setSelectedCard?: Function, isGallery?: boolean}) {

  const [activeIndex, setActiveIndex] = useState(0);

  // in a 3-player game resets the carousel after the first card of two is picked
  useEffect(() => {
    setActiveIndex(0);
  }, [hand.length, setActiveIndex])

  const updateActiveIndex = (eventKey: number, event: any) => {
    console.log("updating active index");
    setActiveIndex(eventKey);
  }
  
  const handleSelectCard = (card: Card) => {
    if (setSelectedCard !== undefined) {
      setSelectedCard(card);
    }
  };

  // makes cards selectable if Hand is not a Gallery
  const selectablecard = isGallery ? "" : "selectable-card";

  return(
    <>
      <Row xs={1} sm={2} md={Math.min(3, hand.length)} className="justify-content-center g-2 my-3 mx-3 d-none d-md-flex">
        {hand.map(card =>
        <Col key={card.cardId}>
          <Image src={card.locator} className={`${selectablecard} card-img`} fluid onClick={() => handleSelectCard(card)} />
        </Col>)}
      </Row>
      <Carousel className="d-xs-flex d-md-none" interval={null} variant="dark" controls={false} activeIndex={activeIndex} onSelect={updateActiveIndex}>
        {hand.map(c => 
          <Carousel.Item key={c.cardId}> 
            <Container>
              <Image src={c.locator} className={`card-img mb-5`} fluid />
            </Container>
          </Carousel.Item>
        )}
      </Carousel>
      {!isGallery && <Button className="d-xs-flex d-md-none" 
        onClick={() => handleSelectCard(hand[activeIndex])}>
        Submit
      </Button>}

      </>
  );
};