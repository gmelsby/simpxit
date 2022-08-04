import { Row, Col } from "react-bootstrap";
import ScoringCard from './ScoringCard'
import React from 'react'

export default function ScoringCardHand({storyTeller,
                                         players,
                                         submittedCards,
                                         guesses                            
                                        }) {
  
  // returns list of player names that guessed the card
  const playersWhoGuessed = cardId => {
    return players.filter(p => guesses[p.playerId] === cardId);
  }                                          

  const nonStoryTellers = players.filter(p => p.playerId !== storyTeller.playerId);

  return (
    <Row xs={2} md={Math.min(3, Object.values(submittedCards).length)} className="g-2">
      <Col>
        <ScoringCard player={storyTeller} card={submittedCards[storyTeller.playerId]} 
          guessedPlayers={playersWhoGuessed(submittedCards[storyTeller.playerId].cardId)}
          isStoryTeller />
      </Col>
      {nonStoryTellers.map(p =>
        <ScoringCard key={p.playerId} player={p} card={submittedCards[p.playerId]}
          guessedPlayers={playersWhoGuessed(submittedCards[p.playerId].cardId)} />
      )}
    </Row>
  )

}