import { React, useState, useCallback, useEffect } from 'react';
import { Button, Container, Image, Modal } from 'react-bootstrap';
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
  const [submittedCardInfo, setSubmittedCardInfo] = useState(false);
  
  const submittedCard = submittedCards[userId];

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/cardinfo/${submittedCard.cardId}`);
    const data = await response.json();
    setSubmittedCardInfo(data);
  }, [submittedCard]);
  
  useEffect(() => {
    if (submittedCard) {
      loadCardInfo()
    }
  }, [submittedCard, loadCardInfo])
  
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
    
    if (submittedCard === undefined) {
      return (
        <>
          <Modal show={selectedCard} onHide={handleCloseSelect}>
            <Modal.Header closeButton>
              <Modal.Title>For the phrase {storyDescriptor}, do you want to submit?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Image src={selectedCard.locator} fluid />
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
  }
  
  if (submittedCardInfo) {
    return (
      <>
        <h4>You submitted</h4>
        <Image src={submittedCard.locator} fluid />
        <p>{JSON.stringify(submittedCardInfo)}</p>
      </>
    )
  }

  return (
    <>
      <p>Wait for the other players to pick their cards...</p>
    </>
  );
}