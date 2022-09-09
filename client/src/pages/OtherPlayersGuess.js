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
  const guessedCardId = submittedGuesses[userId];
  
  
  const waitingOn = players.filter(p => !(Object.keys(submittedGuesses).includes(p.playerId)) && !Object.is(p, storyTeller));

  const [otherCards, setOtherCards] = useState([]);

  // function for shuffling cards 
  const shuffle = useCallback(() => {
    // copies filtered 
    const shuffled = submittedCards.filter(c => c.submitter !== userId);
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

  
  if (userId !== storyTeller.playerId) {
    const handleSubmit = () => {
      if (selectedCard) {
        socket.emit('guess', {roomId, userId, selectedCard} );
      }
    }
    
    if (guessedCardId) {
      const guessedCard = Object.values(submittedCards).filter(c => c.cardId === guessedCardId)[0];

      return (
        <CardInfoWaiting className="my-4" use="guess" cards={[guessedCard]} storyDescriptor={storyDescriptor} 
          waitingOn={waitingOn} />
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
      <h3 className="my-4">Here are all the cards that were submitted:</h3>
      <h5>Wait for other players to guess...</h5>
      <Hand hand={Object.values(submittedCards)} gallery />
      <Container className="my-4">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </Container>
  );
}