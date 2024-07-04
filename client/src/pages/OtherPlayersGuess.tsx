import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Hand from '../components/Hand';
import OtherPlayerModal from '../components/OtherPlayerModal';
import CardInfoWaiting from '../components/CardInfoWaiting';
import WaitingOn from '../components/WaitingOn';
import { Socket } from 'socket.io-client';
import { GameCard, Player } from '../../../types';
import JustifySafelyContainer from '../components/JustifySafelyContainer';

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
        const selectedCardId = selectedCard.id;
        socket.emit('guess', {roomId, userId, selectedCardId} );
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
        <JustifySafelyContainer justifyType='evenly' className="h-100 d-flex flex-column text-center p-0"> 
          <Container className="mt-4 mt-sm-0">
            <h3>The storyteller submitted the descriptor</h3>
            <h2><b>{storyDescriptor}</b></h2>
            <h5>Guess which card is the storyteller&apos;s!</h5>
          </Container>
          <Hand hand={otherCards} setSelectedCard={setSelectedCard} />
        </JustifySafelyContainer>
      </>
    );
  }
  
  return (
    <JustifySafelyContainer justifyType='evenly' className="h-100 d-flex flex-column text-center p-0"> 
      <h3 className="mt-5 mt-sm-0"> Here are all the cards that were submitted</h3>
      <h5>Wait for other players to guess...</h5>
      <Hand hand={Object.values(submittedCards)} isInfo />
      <Container className="mt-4 pb-5">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </JustifySafelyContainer>
  );
}