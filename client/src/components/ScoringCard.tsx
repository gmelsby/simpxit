import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card as BootstrapCard, Col, Container, Image, Row} from 'react-bootstrap';
import CardInfoWrapper from './CardInfoWrapper';
import { Player, GameCard } from '../../../types';
import GameImage from './GameImage';

export default function ScoringCard({ player, card, guessedPlayerNames, isStoryTeller }:
  {player: Player, card: GameCard, guessedPlayerNames: string[], isStoryTeller: boolean}) {
  // returns the html code for the number in a cicle for numbers 1-8
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flipcard selectable-no-grow" onClick={() => setIsFlipped(current => !current)}>
      <div className={`flipcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <Front {...{ player, card, guessedPlayerNames, isStoryTeller }} />
        <Back cardId={card.id} {...{isFlipped, guessedPlayerNames}}  />
        <div className='opacity-0'>
          <Col>
            <BootstrapCard className="card-img selectable-no-grow">
              <BootstrapCard.Header>
                <Row className='justify-content-center flex-nowrap'>
                  <Col></Col>
                  <Col xs={6} md={8}>
                    <Row className='pb-0 mb-0'>
                      <p className='mb-0'>Submitted by</p>
                    </Row>
                    <Row className='pt-0 mt-0'>
                      <h5 className='mt-1'>{isStoryTeller && 'Storyteller '}{!isStoryTeller && player.playerName}</h5>
                    </Row>
                  </Col>
                  <Col className='d-flex flex-column justify-content-center'>
                  </Col>
                </Row>
              </BootstrapCard.Header>
              <Image src='/image-placeholder.svg' className="card-img"/>
            </BootstrapCard>
          </Col>
        </div>
      </div>
    </div>
  );
}

function Front({ player, card, guessedPlayerNames, isStoryTeller }:
  {player: Player, card: GameCard, guessedPlayerNames: string[], isStoryTeller: boolean}) {

  const circleNumberHtmlCalc = useCallback(((n: number) => String.fromCharCode(0x245F + n)), []);

  return (
    <div className='flipcard-front'>
      <Col>
        <BootstrapCard className="card-img selectable-no-grow">
          <BootstrapCard.Header>
            <Row className='justify-content-center flex-nowrap'>
              <Col></Col>
              <Col xs={6} md={8}>
                <Row className='pb-0 mb-0'>
                  <p className='mb-0'>Submitted by</p>
                </Row>
                <Row className='pt-0 mt-0'>
                  <h5 className='mt-1'>{isStoryTeller && 'Storyteller '}{!isStoryTeller && player.playerName}</h5>
                </Row>
              </Col>
              <Col className='d-flex flex-column justify-content-center'>
                {guessedPlayerNames.length !== 0 &&
                  <h2><b>{circleNumberHtmlCalc(guessedPlayerNames.length)}</b></h2>
                }
              </Col>
            </Row>
          </BootstrapCard.Header>
          <GameImage card={card} className="card-img"/>
        </BootstrapCard>
      </Col>
    </div>
  );
}

function Back({ cardId, isFlipped, guessedPlayerNames }: { cardId: string, isFlipped: boolean, guessedPlayerNames: string[] }) {
  const backRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (backRef.current) {
      backRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [isFlipped, backRef]);

  return (
    <BootstrapCard className={`d-flex flex-column bg-body justify-content-start ${isFlipped ?  'overflow-auto' : 'overflow-hidden'} flipcard-back card-img`}>
      {guessedPlayerNames.length !== 0 && 
      <BootstrapCard.Header>
        <Container className=''>
          <h6><b>Guessed By</b></h6>
          {guessedPlayerNames.map(playerName => <h2 key={playerName}>{playerName}</h2>)}
        </Container>
      </BootstrapCard.Header>
      }
      <BootstrapCard.Body className='py-4'>
        <CardInfoWrapper cardId={cardId} load={isFlipped}/>
      </BootstrapCard.Body>
    </BootstrapCard>
  );
}