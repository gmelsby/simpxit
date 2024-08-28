import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '../../../types';
import GameImage from './GameImage';
import { Col, Button, Container, Image, Row } from 'react-bootstrap';
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import InfoCard from './InfoCard';
import ScoringCard from './ScoringCard';
import { Player } from '../../../types';

// length which user drags to count as a swipe
const dragLength = 25;

export default function FramerCardCarousel({ cards, isInfo, scoring, handleSelectCard }:
  {
    cards: GameCard[],
    isInfo?: boolean,
    scoring?: {
      players: Player[];
      guesses: { [key: string]: string };
      storyTellerId: string;
    },
    handleSelectCard?: (selectedCard: GameCard) => void
  }) {
  const [dragStartX, setDragStartX] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipe, setSwipe] = useState<'left' | 'right' | undefined>(undefined);
  const [isFrontFlipped, setIsFrontFlipped] = useState(false);

  // in a 3-player game resets the carousel after the first card of two is picked
  useEffect(() => {
    setActiveIndex(0);
  }, [cards.length, setActiveIndex]);

  // un-flips front card when front card changes
  useEffect(() => {
    setIsFrontFlipped(false);
  }, [activeIndex]);

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
    <div className='d-flex flex-column' style={{ position: 'relative' }}>

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
            <motion.div style={{ position: 'absolute', transformOrigin: 'center' }}
              key={card.id}
              animate={{
                zIndex: orderedCards.length - index,
                y: deltaY,
                x: deltaX,
              }}
              transition={{ type: 'tween' }}
              drag={index === 0 ? 'x' : false}
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              onDragStart={(e, info) => setDragStartX(info.point.x)}
              onDragEnd={(e, info) => {
                const lateralDrag = info.point.x - dragStartX;
                // drag left
                if (lateralDrag >= dragLength) {
                  setSwipe('left');
                }
                // drag right
                else if (lateralDrag <= -1 * dragLength) {
                  setActiveIndex(idx => (idx + 1) % cards.length);
                }
              }}
            >
              <Container style={{ pointerEvents: index !== 0 ? 'none' : 'all' }}>
                <motion.div
                  animate={{
                    rotate: rotation,
                  }}>
                  {isInfo && <InfoCard card={card} externalFlipControl={index === 0 ? isFrontFlipped : undefined} />}
                  {scoring &&
                    <ScoringCard
                      player={scoring.players.find(p => p.playerId === card.submitter)}
                      card={card}
                      guessedPlayerNames={scoring.players.filter(p => scoring.guesses[p.playerId] === card.id).map(p => p.playerName)}
                      isStoryTeller={scoring.players.find(p => p.playerId === card.submitter)?.playerId === scoring.storyTellerId}
                      externalFlipControl={index === 0 ? isFrontFlipped : undefined}
                    />
                  }
                  {!isInfo && !scoring && <GameImage card={card} />}
                </motion.div>
              </Container>
            </motion.div>);
        })}
      </div>


      <div className='opacity-0' style={{ zIndex: -1, pointerEvents: 'none' }}>
        {scoring === undefined && <Image className='card-img' src='/image-placeholder.svg' />}
        {scoring !== undefined && <ScoringCard {...{
          player: scoring.players.slice(1).reduce((acc, p) => {
            return p.playerName.length > acc.playerName.length ? p : acc;
          }),
          card: scoring.players[0].hand[0],
          guessedPlayerNames: [],
          isStoryTeller: false,
        }} />}
      </div>

      <Row className='d-flex justify-content-center' style={{ zIndex: 20 }}>
        {[...Array(cards.length).keys()].map(i =>
          <span key={i}
            style={{ height: '7px', width: '15px', backgroundColor: i === activeIndex ? '#FFFFFF' : '#6c757d', borderRadius: '20%' }}
            className='mx-1'
          />
        )}
      </Row>
      <CarouselController {...{ cards, activeIndex, setSwipe }}
        buttonText={isInfo || scoring ? 'Flip' : 'Submit'}
        actOnSelectedCard={isInfo || scoring ? (() => setIsFrontFlipped(val => !val)) : handleSelectCard}
      />
    </div>);
}

function CarouselController({ cards, activeIndex, setSwipe, actOnSelectedCard, buttonText }:
  {
    cards: GameCard[],
    activeIndex: number,
    setSwipe: React.Dispatch<React.SetStateAction<'left' | 'right' | undefined>>,
    actOnSelectedCard?: (selectedCard: GameCard) => void
    buttonText: string
  }) {

  return (
    <Container className="mt-3 text-center">
      <Row>
        <Col>
          <Button onClick={() => setSwipe('left')} className="px-3">
            <BsCaretLeftFill />
          </Button>
        </Col>
        <Col>
          {actOnSelectedCard !== undefined &&
            <Button
              onClick={() => actOnSelectedCard(cards[activeIndex])}>
              {buttonText}
            </Button>}
        </Col>
        <Col>
          <Button onClick={() => setSwipe('right')} className="px-3">
            <BsCaretRightFill />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}