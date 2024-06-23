import React from 'react';
import {Container, Row, Col, Button } from 'react-bootstrap';
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { GameCard } from '../../../types';

export default function CarouselController({hand, activeIndex, updateActiveIndex, handleSelectCard}:
  {
    hand: GameCard[],
    activeIndex: number,
    updateActiveIndex: (newIndex: number) => void,
    handleSelectCard?: (selectedCard: GameCard) => void
  }) {

  return (
    <Container className="mt-3 text-center">
      <Row>
        <Col>
          <Button onClick={() => updateActiveIndex((((activeIndex - 1) % hand.length) + hand.length) % hand.length)} className="px-3">
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
          <Button onClick={() => updateActiveIndex((activeIndex + 1) % hand.length)} className="px-3">
            <BsCaretRightFill />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}