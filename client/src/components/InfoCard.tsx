import React from 'react';
import { GameCard } from '../../../types';
import { Row, Col, Container, Image } from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';

export default function InfoCard({ card }: { card: GameCard}) {

  return (
    <Container>
      <Row className="d-flex justify-content-center">
        <Col xs={12} lg={6}>
          <Front locator={card.locator} />
          <Back cardId={card.id} />
        </Col>
      </Row>
    </Container>
  );
}

function Front({ locator }: { locator: string }) {
  return (
    <Container className='w-100'>
      <Image src={locator} className="card-img" fluid />
    </Container>
  );
}

function Back({ cardId }: { cardId: string }) {
  return (
    <Container className='w-100'>
      <CardInfoWrapper cardId={cardId}/>
    </Container>
  );
}