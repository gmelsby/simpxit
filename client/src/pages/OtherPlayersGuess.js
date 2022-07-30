import { React, useState } from 'react';
import { Button, Container, Image, Modal } from 'react-bootstrap';
import Hand from '../components/Hand.js';

export default function OtherPlayersGuess({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        storyDescriptor,
                                        socket,
                                        players,
                                        submittedCards,
                                        submittedGuesses
                                        }) {

  const [selectedCard, setSelectedCard] = useState(false);

  const guessedCard = submittedGuesses[userId];

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/cardinfo/${submittedCard.cardId}`);
    const data = await response.json();
    setSubmittedCardInfo(data);
  }, [guessedCard]);
  
  useEffect(() => {
    if (guessedCard) {
      loadCardInfo()
    }
  }, [guessedCard, loadCardInfo]);
 
  
  if (userId !== storyTeller.playerId) {
    
    const otherCards = Object.keys(submittedCards).filter(id => id !== userId).map(id => submittedCards[id]);
    
    const handleCloseSelect = () => {
      setSelectedCard(false);
    };
    
    const handleSubmit = () => {
      if (selectedCard) {
        socket.emit('guess', {roomId, userId, selectedCard} );
      }
    }
    
    if (guessedCard) {
      return (
        <>
          <h4>For "{storyDescriptor}" you guessed</h4>
          <Image src={guessedCard.locator} fluid />
          <p>{JSON.stringify(submittedCardInfo)}</p>
      </>

      )
    }

    return (
      <>
        <Modal show={selectedCard} onHide={handleCloseSelect}>
          <Modal.Header closeButton>
            <Modal.Title>For the phrase {storyDescriptor}, you selected this image:</Modal.Title>
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
          <h5>Guess which card is the storyteller's!</h5>
          <Hand hand={otherCards} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }
  
  return (
    <>
      <p>Here are all the cards that were submitted</p>
      <Hand hand={Object.values(submittedCards)} />
    </>
  );
}