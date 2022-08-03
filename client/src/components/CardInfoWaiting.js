import { React } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import CardInfoText from './CardInfoText';

export default function CardInfoWaiting({ use, storyDescriptor, card, cardInfo, waitingOn }) {

  const use_to_message_map = {
    storyTeller : `You submitted the descriptor ${storyDescriptor} for this image:`,
    fool : `For the descriptor "${storyDescriptor}" you submitted this image:`,
    guess : `For the descriptor "${storyDescriptor}" you guessed this image:`
  };

  const message = use_to_message_map[use];

  return (
    <Container className="text-center">
      <h3>{message}</h3>
      <Row xs={1} md={2}>
        <Col><Image src={card.locator} fluid /></Col>
        <Col className="my-auto"><CardInfoText cardInfo={cardInfo} /></Col>
      </Row>
    </Container>
  );
}
