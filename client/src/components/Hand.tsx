import React, { useState, useEffect } from 'react';
import { Col, Row, Carousel, Container, Button } from 'react-bootstrap';
import GameCard from './GameCard';
import { Card } from '../../../types';

export default function Hand( { hand, setSelectedCard, isGallery }: {hand: Card[], setSelectedCard?: React.Dispatch<React.SetStateAction<Card | null>>, isGallery?: boolean}) {

  const [activeIndex, setActiveIndex] = useState(0);

  // in a 3-player game resets the carousel after the first card of two is picked
  useEffect(() => {
    setActiveIndex(0);
  }, [hand.length, setActiveIndex]);

  const updateActiveIndex = (eventKey: number) => {
    console.log('updating active index');
    setActiveIndex(eventKey);
  };
  
  const handleSelectCard = (card: Card) => {
    if (setSelectedCard !== undefined) {
      setSelectedCard(card);
    }
  };

  // makes cards selectable if Hand is not a Gallery
  const selectablecard = isGallery ? '' : 'selectable-card';

  return(
    <>
      <Row xs={1} sm={2} md={Math.min(3, hand.length)} className="justify-content-center g-2 my-3 mx-3 d-none d-md-flex">
        {hand.map(card =>
          <Col key={card.cardId}>
            <GameCard card={card} handleSelectCard={handleSelectCard} selectablecard={selectablecard}/>
          </Col>)}
      </Row>
      <Carousel className="d-xs-flex d-md-none" interval={null} variant="dark" controls={false} activeIndex={activeIndex} onSelect={updateActiveIndex}>
        {hand.map(c => 
          <Carousel.Item key={c.cardId}> 
            <Container>
              <GameCard className="mb-5" card={c} selectablecard={selectablecard}></GameCard>
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
}