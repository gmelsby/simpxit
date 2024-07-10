import React from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import GameImage from './GameImage';
import { GameCard } from '../../../types';
import InfoCard from './InfoCard';
import FramerCardCarousel from './FramerCardCarousel';

export default function Hand( { hand, setSelectedCard, isGallery, isInfo }: 
  {
    hand: GameCard[], 
    setSelectedCard?: React.Dispatch<React.SetStateAction<GameCard | null>>, 
    isGallery?: boolean,
    isInfo?: boolean
  }) {


  const handleSelectCard = (card: GameCard) => {
    if (setSelectedCard !== undefined) {
      setSelectedCard(card);
    }
  };

  // makes cards selectable if Hand is not a Gallery
  const selectablecard = isGallery ? '' : 'selectable-card';

  // maps from length of hand to length of row
  const lengthMap = new Map([
    [4, 4],
    [7, 4],
    [8, 4],
  ]);

  return(
    <>
      <div className="d-none d-md-block">
        <Row 
          xs={lengthMap.has(hand.length) ? lengthMap.get(hand.length) : Math.min(Math.max(hand.length, 2), 3)} 
          className="justify-content-center maxwidth-67svw g-2 my-3 mx-auto d-none d-md-flex">
          {hand.map(card =>
            <Col key={card.id} className="d-flex flex-column justify-content-center">
              {isInfo ?
                <InfoCard card={card} />
                :
                <GameImage card={card} handleSelectCard={handleSelectCard} selectablecard={selectablecard}/>
              }
            </Col>)}
        </Row>
        {isInfo && <h6 className='my-3 opacity-75'>{'ontouchstart' in window ? 'Tap' : 'Click'} card{hand.length > 1 ? 's': ''} for more info!</h6>}
      </div>
      <Container className="d-xs-flex d-md-none justify-content-center">
        {hand.length > 1 && 
            <FramerCardCarousel cards={hand} {...{ isInfo }} 
              handleSelectCard={isGallery || isInfo ? undefined : handleSelectCard}/>
        }
        {hand.length === 1 &&
          <div>
            {isInfo ?
              <>
                <InfoCard card={hand[0]} />
                {isInfo && <h6 className='my-3 opacity-75'>{'ontouchstart' in window ? 'Tap' : 'Click'} card{hand.length > 1 ? 's': ''} for more info!</h6>}
              </>
              :
              <GameImage card={hand[0]} selectablecard={selectablecard} />
            }
          </div>
        }
      </Container>
    </>
  );
}