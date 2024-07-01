import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '../../../types';
import GameImage from './GameImage';
import { Container, Image, Row } from 'react-bootstrap';
import InfoCard from './InfoCard';
import ScoringCard from './ScoringCard';
import { Player } from '../../../types';

export default function FramerCardCarousel({cards, activeIndex, setActiveIndex, swipe, setSwipe, isInfo, scoring}: 
  {
    cards: GameCard[], 
    activeIndex: number, 
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>, 
    swipe: 'left' | 'right' | undefined
    setSwipe: React.Dispatch<React.SetStateAction<'left' | 'right' | undefined>>,
    isInfo?: boolean, 
    scoring?: {
      players: Player[];
      guesses: {[key:string]: string};
      storyTellerId: string;
    }
  }) {
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (swipe !== undefined) {
      timeout = setTimeout(() => {
        setActiveIndex(idx => (idx + (swipe === 'left' ? cards.length - 1 : 1)) % cards.length);
        setSwipe(undefined);
      }, 100);
    }
    return (() => clearTimeout(timeout));
  }, [swipe, cards.length]);

  const orderedCards = cards.slice(activeIndex, cards.length).concat(cards.slice(0, activeIndex));
  return (
    <div className='d-flex flex-column' style={{position: 'relative'}}>

      <div>
        {orderedCards.map((card, index) => {
          let deltaY = (Number.parseInt(card.id) % 7) * (Number.parseInt(card.id) % 3 ? 1 : -1);
          let deltaX = (Number.parseInt(card.id) % 11) * (Number.parseInt(card.id) % 5 ? 1 : -1);
          let rotation = (Number.parseInt(card.id) % 3) * (Number.parseInt(card.id) % 2 ? 1 : -1);
          // handles animtion for button input from CarouselController
          if (index === 0) {
            deltaY = 0;
            rotation = 0;
            if (swipe === 'right') {
              deltaX = -70;
            } else {
              deltaX = 0;
            }
          } else if (index === cards.length - 1 && swipe === 'left') {
            deltaX = -70;
          }

          return (
            <motion.div style={{position: 'absolute', transformOrigin: 'center'}}
              key={card.id} 
              animate={{
                zIndex: orderedCards.length - index,
                y: deltaY,
                x: deltaX,
              }}
              transition={{type: 'tween'}}
              drag={index === 0 ? 'x' : false}
              dragConstraints={{
                left: 0,
                right: 0, 
              }}
              onDragStart={(e, info) => setDragStartX(info.point.x)}
              onDragEnd={(e, info) => {
                const lateralDrag = info.point.x - dragStartX;
                // drag left
                if (lateralDrag >= 20) {
                  setSwipe('left');
                }
                // drag right
                else if (lateralDrag <= -20) {
                  setActiveIndex(idx => (idx + 1) % cards.length);
                }
              }}
            >
              <Container style={{pointerEvents: index !== 0 ? 'none' : 'all'}}>
                <motion.div
                  animate={{ 
                    rotate: rotation,
                  }}>
                  {isInfo && <InfoCard card={card} />}
                  {scoring && 
                    <ScoringCard 
                      player={scoring.players.find(p => p.playerId === card.submitter)}
                      card={card}
                      guessedPlayerNames={scoring.players.filter(p => scoring.guesses[p.playerId] === card.id).map(p => p.playerName)}
                      isStoryTeller={scoring.players.find(p => p.playerId === card.submitter)?.playerId === scoring.storyTellerId}
                    />
                  }
                  {!isInfo && !scoring && <GameImage card={card} />}
                </motion.div>
              </Container>
            </motion.div>);
        })}
      </div>


      <div className='opacity-0' style={{zIndex: -1, pointerEvents: 'none'}}> 
        {scoring === undefined && <Image className='card-img' src='/image-placeholder.svg' />} 
        {scoring !== undefined && <ScoringCard {...{
          player: scoring.players.slice(1).reduce((acc, p) => {
            return p.playerName.length > acc.playerName.length ? p : acc;
          }),
          card: scoring.players[0].hand[0],
          guessedPlayerNames: [],
          isStoryTeller: false,
        }}/>}
      </div>
      
      <Row className='d-flex justify-content-center' style={{zIndex: 20}}>
        {[...Array(cards.length).keys()].map(i => 
          <span key={i} 
            style={{height: '7px', width: '15px', backgroundColor: i === activeIndex ? '#FFFFFF' : '#6c757d', borderRadius: '20%'}} 
            className='mx-1'
          />
        )}
      </Row>
    </div>);
}