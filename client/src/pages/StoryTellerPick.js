import { React, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import Hand from '../components/Hand.js';
import StoryModal from '../components/StoryModal.js';

export default function StoryTellerPick({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        socket,
                                        handSize
                                        }) {

  const [selectedCard, setSelectedCard] = useState(false);
  const [descriptor, setDescriptor] = useState("");
     
  if (storyTeller.hand.length < handSize) {
    return (
      <>
        <Spinner animation="border" variant="primary" />
        <p>Generating cards...</p>
      </>
    )
  }

  if (userId === storyTeller.playerId) {
    const handleSubmit = e => {
      e.preventDefault()
      if (selectedCard) {
        socket.emit('submitStoryCard', {roomId, userId, selectedCard, descriptor} );
      }
    }


    return (
      <>
        <StoryModal selectedCard={selectedCard} setSelectedCard={setSelectedCard} descriptor={descriptor} 
          setDescriptor={setDescriptor} handleSubmit={handleSubmit} />
        <Container>
          <h3>You are the storyteller! Pick an image and come up with a description.</h3>
          <Hand hand={storyTeller.hand} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }

  return (
    <>
      <p>{storyTeller.playerName} is the Storyteller. Wait for them to pick a card...</p>
    </>
  );
}