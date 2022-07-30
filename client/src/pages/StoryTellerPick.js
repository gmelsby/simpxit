import { React, useState, useEffect, useRef } from 'react';
import { Button, Container, Form, Image, Modal, Spinner } from 'react-bootstrap';
import Hand from '../components/Hand.js';

export default function StoryTellerPick({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        socket,
                                        handSize
                                        }) {

  const [selectedCard, setSelectedCard] = useState(false);
  const [descriptor, setDescriptor] = useState("");
  
  const descriptionForm = useRef(null);

  useEffect(() => {
    if (selectedCard) {
      descriptionForm.current.focus();
    }
  }, [selectedCard]);
     
  if (storyTeller.hand.length < handSize) {
    return (
      <>
        <Spinner animation="border" variant="primary" />
        <p>Generating cards...</p>
      </>
    )
  }

  if (userId === storyTeller.playerId) {
    
    const handleCloseSelect = () => {
      setSelectedCard(false);
      setDescriptor("");
    };
    
    const handleSubmit = e => {
      e.preventDefault()
      if (selectedCard) {
        socket.emit('submitStoryCard', {roomId, userId, selectedCard, descriptor} );
      }
    }


    return (
      <>
        <Modal show={selectedCard} onHide={handleCloseSelect}>
          <Modal.Header closeButton>
            <Modal.Title>You selected this image:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Image src={selectedCard.locator} fluid />
          </Modal.Body>
          <Modal.Footer>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Control className="w-auto" type="text" required name="descriptor"
                maxLength="30" placeholder="Describe the image" pattern="[ A-Za-z0-9-]+"
                value={descriptor}
                onChange={e => setDescriptor(e.target.value.trimStart())}
                ref={descriptionForm} />
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
      <p>{storyTeller.playerName} is the Storyteller. Wait for them to pick a card...</p>
    </>
  );
}