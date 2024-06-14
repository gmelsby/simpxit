import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Hand from '../components/Hand';
import OtherPlayerModal from '../components/OtherPlayerModal';
import CardInfoWaiting from '../components/CardInfoWaiting';
import WaitingOn from '../components/WaitingOn';
import { Socket } from 'socket.io-client';
import { GameCard, Player } from '../../../types';

export default function OtherPlayersGuess({ 
  userId,
  storyTeller,
  roomId,
  storyDescriptor,
  socket,
  players,
  submittedCards,
  submittedGuesses
}:
                                        {
                                          userId: string,
                                          storyTeller: Player,
                                          roomId: string,
                                          storyDescriptor: string,
                                          socket: Socket | null,
                                          players: Player[],
                                          submittedCards: GameCard[],
                                          submittedGuesses: {[key: string]: string};
                                        }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const guessedCardId = submittedGuesses[userId];
  
  
  const waitingOn = players.filter(p => !(Object.keys(submittedGuesses).includes(p.playerId)) && !Object.is(p, storyTeller));

  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);

  // shuffles cards on load
  useEffect(() => {
    const shuffled = [...Array(submittedCards.length).keys()];
    // citation: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffleOrder(shuffled);
  }, [submittedCards.length]);

  // shuffles cards based on shuffle order and removes cards that the guessing player has submitted
  const otherCards = shuffleOrder
    .map(idx => submittedCards[idx])
    .filter(card => card.submitter !== userId);

  
  if (userId !== storyTeller.playerId) {
    const handleSubmit = () => {
      if (selectedCard && socket !== null) {
        socket.emit('guess', {roomId, userId, selectedCard} );
      }
    };
    
    if (guessedCardId) {
      const guessedCard = Object.values(submittedCards).filter(c => c.id === guessedCardId)[0];

      return (
        <CardInfoWaiting use="guess" cards={[guessedCard]} storyDescriptor={storyDescriptor} 
          waitingOn={waitingOn} />
      );
    }

    return (
      <>
        <OtherPlayerModal use="guess" selectedCard={selectedCard} 
          setSelectedCard={setSelectedCard} storyDescriptor={storyDescriptor}
          handleSubmit={handleSubmit} />
        <Container className="text-center pt-5">
          <h3>The storyteller submitted the descriptor <b>{storyDescriptor}</b></h3>
          <h5>Guess which card is the storyteller&apos;s!</h5>
          <Hand hand={otherCards} setSelectedCard={setSelectedCard} />
        </Container>
      </>
    );
  }
  
  return (
    <Container className="text-center pt-5">
      <h3> Here are all the cards that were submitted:</h3>
      <h5>Wait for other players to guess...</h5>
      <Hand hand={Object.values(submittedCards)} isGallery />
      <Container className="mt-4 pb-5">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </Container>
  );
}