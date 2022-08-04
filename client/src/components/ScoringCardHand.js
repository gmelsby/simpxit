import { Row, Carousel } from "react-bootstrap";
import ScoringCard from './ScoringCard';
import React from 'react';

export default function ScoringCardHand({storyTeller,
                                         players,
                                         submittedCards,
                                         guesses                            
                                        }) {
  
  // returns list of player names that guessed the card
  const playersWhoGuessed = cardId => {
    return players.filter(p => guesses[p.playerId] === cardId);
  }                                          

  const sortedPlayers = players.sort((p1, p2) => p1.playerId === storyTeller.playerId ? -1 : 1)
  const ScoringCards = sortedPlayers.map(p =>
          <ScoringCard key={p.playerId} player={p} card={submittedCards[p.playerId]}
            guessedPlayers={playersWhoGuessed(submittedCards[p.playerId].cardId)} 
            isStoryTeller={p.playerId === storyTeller.playerId} />
        );
  

  return (
    <>
      <Row xs={1} md={Math.min(3, Object.values(submittedCards).length)} className="g-2 mx-5 my-3 d-none d-sm-flex">
        {ScoringCards}
      </Row>

      <Carousel className="d-xs-flex d-sm-none" interval={null} variant="dark">
      {ScoringCards.map(card => 
        <Carousel.Item key={card.cardId}> 
          <Row className="mx-5">
            {card}
          </Row>
        </Carousel.Item>
      )}
      </Carousel>
    </>
  )

}