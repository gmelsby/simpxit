import { React, useState } from 'react';
import { Container } from 'react-bootstrap';
import CardInfoWaiting from '../components/CardInfoWaiting.js';
import Hand from '../components/Hand.js';
import OtherPlayerModal from '../components/OtherPlayerModal.js';

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
  const submittedCard = submittedCards[userId];

  // executes if storyteller or player who has submitted a fake card
  if (submittedCard) {
    const waitingOn = players.filter(p => !(Object.keys(submittedCards).includes(p.playerId)));
    return (
        <CardInfoWaiting use={storyTeller.playerId === userId ? "storyTeller" : "deceive"} card={submittedCard} 
          storyDescriptor={storyDescriptor} waitingOn={waitingOn} />
    )
  }
 

  
  const user = players.filter(p => p.playerId === userId)[0];
  
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
        <Hand hand={user.hand} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
      </Container>
    </>
  );
}