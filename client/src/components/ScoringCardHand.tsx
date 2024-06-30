import React, { useState } from 'react';
import { Container, Row, Carousel, Col } from 'react-bootstrap';
import ScoringCard from './ScoringCard';
import { GameCard, Player } from '../../../types';
import CarouselController from './CarouselController';

export default function ScoringCardHand({storyTeller,
  players,
  submittedCards,
  guesses                            
}:
                                        {storyTeller: Player,
                                         players: Player[],
                                         submittedCards: GameCard[],
                                         guesses: {[key: string]: string}
                                        }) {

  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = (eventKey: number) => {
    setActiveIndex(eventKey);
  };
  
  // returns list of player names that guessed the card
  const playersWhoGuessed = (cardId: string) => {
    return players.filter(p => guesses[p.playerId] === cardId);
  };                                          

  // maps from length of hand to length of row
  const lengthMap = new Map([
    [4, 4],
    [7, 4],
    [8, 4],
  ]);

  return (
    <>
      <Row 
        xs={lengthMap.has(submittedCards.length) ? lengthMap.get(submittedCards.length) : 3}
        className="g-2 mx-auto my-3 d-none d-md-flex maxwidth-60svw justify-content-center">
        {submittedCards.map(c => 
          <Col key={c.id} className="d-flex flex-column justify-content-center">
            <ScoringCard key={c.id} player={players.filter(p => p.playerId === c.submitter)[0]} card={c}
              guessedPlayerNames={playersWhoGuessed(c.id).map(p => p.playerName)} 
              isStoryTeller={c.submitter === storyTeller.playerId} />
          </Col>
        )}
      </Row>


      <Container className="d-xs-flex d-md-none">
        <Carousel className="" interval={null} variant="dark" controls={false} activeIndex={activeIndex} onSelect={updateActiveIndex}>
          {submittedCards.map(c => 
            <Carousel.Item key={c.id}> 
              <Container className="py-5">
                <ScoringCard player={players.filter(p => p.playerId === c.submitter)[0]} card={c}
                  guessedPlayerNames={playersWhoGuessed(c.id).map(p => p.playerName)} 
                  isStoryTeller={c.submitter === storyTeller.playerId} />
              </Container>
            </Carousel.Item>
          )}
        </Carousel>
        <CarouselController hand={submittedCards} {...{activeIndex, updateActiveIndex}} />
      </Container>
    </>
  );

}