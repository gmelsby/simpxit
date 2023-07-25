import React from 'react';
import { Container, Row, Carousel } from 'react-bootstrap';
import ScoringCard from './ScoringCard';
import { Card, Player } from '../../../types';

export default function ScoringCardHand({storyTeller,
  players,
  submittedCards,
  guesses                            
}:
                                        {storyTeller: Player,
                                         players: Player[],
                                         submittedCards: Card[],
                                         guesses: {[key: string]: string}
                                        }) {
  
  // returns list of player names that guessed the card
  const playersWhoGuessed = (cardId: string) => {
    return players.filter(p => guesses[p.playerId] === cardId);
  };                                          

  return (
    <>
      <Row md={Math.min(3, Object.values(submittedCards).length)} className="g-2 mx-auto my-3 d-none d-md-flex justify-content-center">
        {submittedCards.map(c => 
          <ScoringCard key={c.cardId} player={players.filter(p => p.playerId === c.submitter)[0]} card={c}
            guessedPlayers={playersWhoGuessed(c.cardId)} 
            isStoryTeller={c.submitter === storyTeller.playerId} />
        )}
      </Row>

      <Carousel className="d-xs-flex d-md-none" interval={null} variant="dark" controls={false}>
        {submittedCards.map(c => 
          <Carousel.Item key={c.cardId}> 
            <Container>
              <ScoringCard player={players.filter(p => p.playerId === c.submitter)[0]} card={c}
                guessedPlayers={playersWhoGuessed(c.cardId)} 
                isStoryTeller={c.submitter === storyTeller.playerId} />
            </Container>
          </Carousel.Item>
        )}
      </Carousel>
    </>
  );

}