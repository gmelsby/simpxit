import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '../../../types';
import GameImage from './GameImage';
import { Container, Image, Row } from 'react-bootstrap';
import InfoCard from './InfoCard';
import ScoringCard from './ScoringCard';

export default function FramerCardCarousel({cards, activeIndex, setActiveIndex, swipe, setSwipe, isInfo, scoring}: 
  {
    cards: GameCard[], 
    activeIndex: number, 
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>, 
    swipe: 'left' | 'right' | undefined
    setSwipe: React.Dispatch<React.SetStateAction<'left' | 'right' | undefined>>,
    isInfo?: boolean, 
    scoring?: boolean
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

  console.log(activeIndex);

  const orderedCards = cards.slice(activeIndex, cards.length).concat(cards.slice(0, activeIndex));
  return (
    <div style={{position: 'relative'}}>

      <div>
        {orderedCards.map((card, index) => {
          const deltaY = index === 0 || index === 1 || index === cards.length - 1 ? 0 
            : (Number.parseInt(card.id) % 10) * (Number.parseInt(card.id) % 2 ? 1 : -1);
          let deltaX = (Number.parseInt(card.id) % 11) * (Number.parseInt(card.id) % 3 ? 1 : -1);
          // handles animtion for button input from CarouselController
          if (index === 0) {
            if (swipe === 'right') {
              deltaX = -70;
            } else {
              deltaX = 0;
            }
          } else if (index === cards.length - 1) {
            if (swipe === 'left') {
              deltaX = -70;
            } else {
              deltaX = 0;
            }
          } else if (index === 1) {
            deltaX = 0;
          }

          return (
            <motion.div style={{position: 'absolute', transformOrigin: 'center'}}
              key={card.id} 
              animate={{
                zIndex: orderedCards.length - index,
                y: deltaY,
                x: deltaX,
              }}
              drag={index === 0 ? 'x' : false}
              dragConstraints={{
                left: 0,
                right: 0, 
              }}
              onDragStart={(e, info) => setDragStartX(info.point.x)}
              onDragEnd={(e, info) => {
                const lateralDrag = info.point.x - dragStartX;
                // drag right
                if (lateralDrag >= 20) {
                  setSwipe('left');
                }
                // drag right
                else if (lateralDrag <= -20) {
                  setActiveIndex(idx => (idx + 1) % cards.length);
                }
              }}
            >
              <Container>
                <motion.div
                  animate={{ 
                    rotate: index < 2 || index === cards.length - 1 ? 0 : (Number.parseInt(card.id) % 5) * (Number.parseInt(card.id) % 2 ? 1 : -1),
                  }}>
                  {isInfo && <InfoCard card={card} />}
                  {!isInfo && <GameImage card={card} />}
                </motion.div>
              </Container>
            </motion.div>);
        })}
      </div>
      <div className='opacity-0' style={{zIndex: -1}}> 
        <Image className='card-img' src='/image-placeholder.svg' />
      </div>
      <Row className='d-flex justify-content-center'>
        {[...Array(cards.length).keys()].map(i => 
          <span key={i} 
            style={{height: '7px', width: '15px', backgroundColor: i === activeIndex ? '#FFFFFF' : '#6c757d', borderRadius: '20%'}} 
            className='mx-1'
          />
        )}
      </Row>
    </div>);
}