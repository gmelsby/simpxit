import React, { useState, useEffect } from 'react';
import { Col, Row, Carousel, Container } from 'react-bootstrap';
import GameImage from './GameImage';
import { GameCard } from '../../../types';
import CarouselController from './CarouselController';
import InfoCard from './InfoCard';

export default function Hand( { hand, setSelectedCard, isGallery, isInfo }: 
  {
    hand: GameCard[], 
    setSelectedCard?: React.Dispatch<React.SetStateAction<GameCard | null>>, 
    isGallery?: boolean,
    isInfo?: boolean
  }) {

  const [activeIndex, setActiveIndex] = useState(0);

  // in a 3-player game resets the carousel after the first card of two is picked
  useEffect(() => {
    setActiveIndex(0);
  }, [hand.length, setActiveIndex]);

  const updateActiveIndex = (eventKey: number) => {
    setActiveIndex(eventKey);
  };
  
  const handleSelectCard = (card: GameCard) => {
    if (setSelectedCard !== undefined) {
      setSelectedCard(card);
    }
  };

  // makes cards selectable if Hand is not a Gallery
  const selectablecard = isGallery ? '' : 'selectable-card';

  // maps from length of hand to length of row
  const lengthMap = new Map([
    [7, 4],
    [8, 4],
  ]);

  return(
    <>
      <Row 
        xs={lengthMap.has(hand.length) ? lengthMap.get(hand.length) : Math.min(Math.max(hand.length, 2), 3)} 
        className="justify-content-center g-2 my-3 mx-3 d-none d-md-flex">
        {hand.map(card =>
          <Col key={card.id} className="d-flex flex-column justify-content-center">
            {isInfo ?
              <InfoCard card={card} />
              :
              <GameImage card={card} handleSelectCard={handleSelectCard} selectablecard={selectablecard}/>
            }
          </Col>)}
      </Row>
      <Container className="d-xs-flex d-md-none justify-content-center">
        {hand.length > 1 && 
          <>
            <Carousel className="" interval={null} variant="dark" controls={false} activeIndex={activeIndex} onSelect={updateActiveIndex}>
              {hand.map(c => 
                <Carousel.Item key={c.id}> 
                  <div className={`${isInfo ? 'py-5' : ''}`}>
                    {isInfo ?
                      <InfoCard card={c} />
                      :
                      <GameImage className="mb-5" card={c} />
                    }
                  </div>
                </Carousel.Item>
              )}
            </Carousel>
            <CarouselController {...{hand, activeIndex, updateActiveIndex}} handleSelectCard={isGallery || isInfo ? undefined : handleSelectCard}/>
          </>
        }
        {hand.length === 1 &&
          <div>
            {isInfo ?
              <InfoCard card={hand[0]} />
              :
              <GameImage card={hand[0]} selectablecard={selectablecard} />
            }
          </div>
        }
      </Container>
    </>
  );
}