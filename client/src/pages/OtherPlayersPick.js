import { React, useState } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import Hand from '../components/Hand.js';

export default function OtherPlayersPick({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        storyDescriptor,
                                        socket,
                                        players,
                                        submittedCards
                                        }) {

  const [selectedCard, setSelectedCard] = useState(false);
  
  if (userId !== storyTeller.playerId) {
    
    const user = players.filter(p => p.playerId === userId)[0];
    
    const handleCloseSelect = () => {
      setSelectedCard(false);
    };
    
    const handleSubmit = () => {
      if (selectedCard) {
        socket.emit('submitOtherCard', {roomId, userId, selectedCard} );
      }
    }

    return (
      <>
        <Modal show={selectedCard} onHide={handleCloseSelect}>
          <Modal.Header closeButton>
            <Modal.Title>For the phrase {storyDescriptor}, you selected this image:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={selectedCard.locator} />
          </Modal.Body>
          <Modal.Footer>
          <Button onClick={handleSubmit}>Submit</Button>
            <div className="col text-center">
              <Button variant="secondary" onClick={handleCloseSelect}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Container>
          <h3>The storyteller submitted the descriptor "{storyDescriptor}"</h3>
          <h5>Pick a card from your hand to fool the other players!</h5>
          <Hand hand={user.hand} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }
  
  return (
    <>
      <p>Wait for the other players to pick their cards...</p>
    </>
  );
}