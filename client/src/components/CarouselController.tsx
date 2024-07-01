import React from 'react';
import {Container, Row, Col, Button } from 'react-bootstrap';
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { GameCard } from '../../../types';

export default function CarouselController({hand, activeIndex, setSwipe, handleSelectCard}:
  {
    hand: GameCard[],
    activeIndex: number,
    setSwipe: React.Dispatch<React.SetStateAction<'left' | 'right' | undefined>>,
    handleSelectCard?: (selectedCard: GameCard) => void
  }) {

  return (
    <Container className="mt-3 text-center">
      <Row>
        <Col>
          <Button onClick={() => setSwipe('left')} className="px-3">
            <BsCaretLeftFill />
          </Button>
        </Col>
        <Col>
          { handleSelectCard !== undefined && 
          <Button
            onClick={() => handleSelectCard(hand[activeIndex])}>
          Submit
          </Button>}
        </Col>
        <Col>
          <Button onClick={() => setSwipe('right')} className="px-3">
            <BsCaretRightFill />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}