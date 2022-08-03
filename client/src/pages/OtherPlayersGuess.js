import { React, useState, useCallback, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Hand from '../components/Hand.js';
import OtherPlayerModal from '../components/OtherPlayerModal.js';
import CardInfoWaiting from '../components/CardInfoWaiting.js';
import WaitingOn from '../components/WaitingOn';

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
  
  
  const waitingOn = players.filter(p => !(Object.keys(submittedGuesses).includes(p.playerId)) && !Object.is(p, storyTeller));

  const [otherCards, setOtherCards] = useState([]);

  // function for shuffling cards 
  const shuffle = useCallback(() => {
    const shuffled = Object.keys(submittedCards).filter(id => id !== userId).map(id => submittedCards[id]).slice(0);
    // citation: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOtherCards(shuffled);
  }, [submittedCards, userId]);

  // shuffles cards on load
  useEffect(() => {
    shuffle();
  }, [shuffle]);

  const loadCardInfo = useCallback(async () => {
    const response = await fetch(`/cardinfo/${guessedCardId}`);
    const data = await response.json();
    setGuessedCardInfo(data);
  }, [guessedCardId]);

  
  useEffect(() => {
    if (guessedCardId) {
      loadCardInfo();
    }
  }, [guessedCardId, loadCardInfo]);

 
  
  if (userId !== storyTeller.playerId) {
    const handleSubmit = () => {
      if (selectedCard) {
        socket.emit('guess', {roomId, userId, selectedCard} );
      }
    }
    
    if (guessedCardId) {
      const guessedCard = Object.values(submittedCards).filter(c => c.cardId === guessedCardId)[0];

      return (
        <CardInfoWaiting use="guess" card={guessedCard} storyDescriptor={storyDescriptor} waitingOn={waitingOn}
          cardInfo={guessedCardInfo} />
      );
    }

    return (
      <>
        <OtherPlayerModal use="guess" selectedCard={selectedCard} 
          setSelectedCard={setSelectedCard} storyDescriptor={storyDescriptor}
          handleSubmit={handleSubmit} />
        <Container className="text-center">
          <h3>The storyteller submitted the descriptor "{storyDescriptor}"</h3>
          <h5>Guess which card is the storyteller's!</h5>
          <Hand hand={otherCards} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }
  
  return (
    <Container className="text-center">
      <h3>Here are all the cards that were submitted:</h3>
      <Hand hand={Object.values(submittedCards)} gallery />
      <WaitingOn waitingOn={waitingOn} />
    </Container>
  );
}