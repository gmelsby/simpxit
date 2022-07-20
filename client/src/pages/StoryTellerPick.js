import { React, useState } from 'react';
import { Button, Container, Form, Modal } from 'react-bootstrap';
import Hand from '../components/Hand.js';

export default function StoryTellerPick({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        socket
                                        }) {

  const [selectedCard, setSelectedCard] = useState(false);
  const [descriptor, setDescriptor] = useState("");
  
  if (userId === storyTeller.playerId) {
    
    const handleCloseSelect = () => {
      setSelectedCard(false);
    };
    
    const handleSubmit = () => {
      const selectedCardId = selectedCard.cardId;
      socket.emit('submitStoryCard', {roomId, userId, selectedCardId, descriptor} )
    }

    return (
      <>
        <Modal show={selectedCard} onHide={handleCloseSelect}>
          <Modal.Header closeButton>
            <Modal.Title>You selected this image:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={selectedCard.locator} />
          </Modal.Body>
          <Modal.Footer>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Control className="w-auto" type="text" required name="descriptor"
                maxLength="20" placeholder="Describe the image" pattern=".\S+.*"
                value={descriptor}
                onChange={e => setDescriptor(e.target.value.trimStart())} />
              <Button type="submit">Submit</Button>
              </Form.Group>
            </Form>

            <div className="col text-center">
              <Button variant="secondary" onClick={handleCloseSelect}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Container>
          <h3>You are the storyteller! Pick an image and come up with a description.</h3>
          <Hand hand={storyTeller.hand} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }

  return (
    <>
      <p>Wait for the Storyteller to pick a card...</p>
    </>
  );
}