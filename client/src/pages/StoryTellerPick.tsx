import React, { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import Hand from '../components/Hand';
import StoryModal from '../components/StoryModal';
import { Card, Player } from '../../../types';
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

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [descriptor, setDescriptor] = useState('');

  if (storyTeller.hand.length < handSize) {
    return (
      <Container className="text-center align-items-center pt-5">
        <Spinner className="mx-auto mt-5" animation="border" variant="primary" />
        <h5>Generating cards...</h5>
      </Container>
    );
  }

  if (userId === storyTeller.playerId) {
    const handleSubmit = () => {
      if (selectedCard && socket !== null) {
        socket.emit('submitStoryCard', {roomId, userId, selectedCard, descriptor} );
      }
    };


    return (
      <>
        <StoryModal selectedCard={selectedCard} setSelectedCard={setSelectedCard} descriptor={descriptor} 
          setDescriptor={setDescriptor} handleSubmit={handleSubmit} />
        <Container className="text-center pt-5">
          <h3>You are the storyteller! Pick an image and come up with a description.</h3>
          <Hand hand={storyTeller.hand} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }

  return (
    <Container className="text-center pt-5">
      <h3 className="mt-2">{storyTeller.playerName} is the Storyteller. Wait for them to pick a card...</h3>
    </Container>
  );
}