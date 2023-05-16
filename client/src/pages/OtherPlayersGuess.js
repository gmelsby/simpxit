import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Hand from '../components/Hand';
import OtherPlayerModal from '../components/OtherPlayerModal';
import CardInfoWaiting from '../components/CardInfoWaiting';
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

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCard, setSelectedCard] = useState(null);
  const guessedCardId = submittedGuesses[userId];
  
  
  const waitingOn = players.filter(p => !(Object.keys(submittedGuesses).includes(p.playerId)) && !Object.is(p, storyTeller));

  const [otherCards, setOtherCards] = useState([]);

  // shuffles cards on load
  useEffect(() => {
    const shuffled = submittedCards.filter(c => c.submitter !== userId);
    // citation: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOtherCards(shuffled);
  // change dependency array when socket updates just the values that changed
  // currently each update updates every object, even when the same values
  // this causes rerenders when specifying submittedCards as a dependency
  // eslint-disable-next-line
  }, []);

  
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