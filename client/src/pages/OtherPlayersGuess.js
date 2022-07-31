import { React, useState, useCallback, useEffect } from 'react';
import { Container, Image } from 'react-bootstrap';
import Hand from '../components/Hand.js';
import OtherPlayerModal from '../components/OtherPlayerModal.js';

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
  const [guessedCardInfo, setGuessedCardInfo] = useState(false);

  const guessedCardId = submittedGuesses[userId];
  console.log(JSON.stringify(submittedGuesses));
  
  
  const waitingOn = players.filter(p => !(Object.keys(submittedGuesses).includes(p.playerId)) && !Object.is(p, storyTeller));

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/cardinfo/${guessedCardId}`);
    const data = await response.json();
    setGuessedCardInfo(data);
  }, [guessedCardId]);

  
  useEffect(() => {
    if (guessedCardId) {
      loadCardInfo()
    }
  }, [guessedCardId, loadCardInfo]);
 
  
  if (userId !== storyTeller.playerId) {
    
    const otherCards = Object.keys(submittedCards).filter(id => id !== userId).map(id => submittedCards[id]);
    
    const handleSubmit = () => {
      if (selectedCard) {
        socket.emit('guess', {roomId, userId, selectedCard} );
      }
    }
    
    if (guessedCardId) {
      

      return (
        <>
          <h4>For "{storyDescriptor}" you guessed</h4>
          <Image src={guessedCardInfo.Image} fluid />
          <p>{JSON.stringify(guessedCardInfo)}</p>
          <p>Waiting on {waitingOn.map(p => p.playerName)}</p>
      </>
      );
    }

    return (
      <>
        <OtherPlayerModal use="guess" selectedCard={selectedCard} 
          setSelectedCard={setSelectedCard} storyDescriptor={storyDescriptor}
          handleSubmit={handleSubmit} />
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
      <p>Waiting on {waitingOn.map(p => p.playerName)}</p>
    </>
  );
}