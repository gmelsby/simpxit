import React, { useEffect, useState } from 'react';
import { Container, Row, Spinner } from 'react-bootstrap';
import Hand from '../components/Hand';
import StoryModal from '../components/StoryModal';
import { GameCard, Player } from '../../../types';
import { Socket } from 'socket.io-client';

export default function StoryTellerPick({ 
  userId,
  storyTeller,
  roomId,
  socket,
  handSize
}:
                                        {
                                          userId: string,
                                          storyTeller: Player,
                                          roomId: string,
                                          socket: Socket | null,
                                          handSize: number
                                        }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [descriptor, setDescriptor] = useState('');

  if (userId === storyTeller.playerId) {
    const handleSubmit = () => {
      if (selectedCard && socket !== null) {
        socket.emit('submitStoryCard', {roomId, userId, selectedCard, descriptor} );
      }
    };

    if (storyTeller.hand.length < handSize) {
      return (
        <Container className="d-flex flex-column justify-content-center text-center pt-5 h-75">
          <h1>Drawing cards...</h1>
          <Spinner className="mx-auto mt-5" animation="border" variant="primary" />
        </Container>
      );
    }

    return (
      <>
        <StoryModal selectedCard={selectedCard} setSelectedCard={setSelectedCard} descriptor={descriptor} 
          setDescriptor={setDescriptor} handleSubmit={handleSubmit} />
        <Container className="d-flex flex-column justify-content-evenly text-center align-items-center pt-5 h-100 m-auto">
          <Row>
            <h1>You are the storyteller!</h1>
            <h2>Pick an image and come up with a description.</h2>
          </Row>
          <Row>
            <Hand hand={storyTeller.hand} setSelectedCard={setSelectedCard} />
          </Row>
        </Container>
      </>
    );
  }

  return (
    <Container className="d-flex h-75 justify-content-center align-items-center text-center pt-5">
      <Row>
        <h2 className="mt-2">{storyTeller.playerName} is the Storyteller. Wait for them to pick a card...</h2>
      </Row>
    </Container>
  );
}