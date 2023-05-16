import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import CardInfoWaiting from '../components/CardInfoWaiting';
import Hand from '../components/Hand';
import OtherPlayerModal from '../components/OtherPlayerModal';

export default function OtherPlayersPick({ 
                                        userId,
                                        storyTeller,
                                        roomId,
                                        storyDescriptor,
                                        socket,
                                        players,
                                        submittedCards
                                        }) {

  const [selectedCard, setSelectedCard] = useState(null);
  const user = players.find(p => p.playerId === userId);

  // resets selected card if a card has been submitted
  // scrolls to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedCard(null);
  }, [user.hand.length]);
  
  const playerSubmittedCards = submittedCards.filter(c => c.submitter === userId);
  const expectedCards = players.length === 3 ? 2 : 1;
  const waitingOn = players.filter(p => p.playerId !== storyTeller.playerId && submittedCards.filter(c => c.submitter === p.playerId).length < expectedCards);

  // executes if storyteller 
  if (storyTeller.playerId === userId) {
    return (
        <CardInfoWaiting use="storyTeller" cards={playerSubmittedCards} 
          storyDescriptor={storyDescriptor} waitingOn={waitingOn} />
    )
  }

  // or player who has submitted a fake card
  if (playerSubmittedCards.length === expectedCards) {
     return (
        <CardInfoWaiting use="deceive" cards={playerSubmittedCards} 
          storyDescriptor={storyDescriptor} waitingOn={waitingOn} />
    )

  }
  
  
  const handleSubmit = () => {
    if (selectedCard) {
      socket.emit('submitOtherCard', {roomId, userId, selectedCard} );
    }
  }
  
  return (
    <>
      <OtherPlayerModal use="deceive" selectedCard={selectedCard} setSelectedCard={setSelectedCard}
        storyDescriptor={storyDescriptor} handleSubmit={handleSubmit} />

      <Container className="text-center">
        <h3>The storyteller submitted the descriptor "{storyDescriptor}"</h3>
        <h5>Pick a card from your hand to fool the other players!</h5>
        <Hand hand={user.hand} setSelectedCard={setSelectedCard} />
      </Container>
    </>
  );
}