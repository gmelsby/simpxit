import React from 'react';
import { Container } from 'react-bootstrap';
import WaitingOn from './WaitingOn';
import { Player, GameCard } from '../../../types';
import Hand from './Hand';



export default function CardInfoWaiting({ use, storyDescriptor, cards, waitingOn }:  {use: 'storyTeller' | 'deceive' | 'guess',
  storyDescriptor: string,
  cards: GameCard[],
  waitingOn: Player[]
  }) 
{

  const demonstrative = cards.length > 1 ? 'these' : 'this';
  const directObject = `card${cards.length > 1 ? 's' : ''}`;
  const phrase = `${demonstrative} ${directObject}`;

  const phraseMap = {
    storyTeller : ['You submitted the descriptor', `for ${phrase}`],
    deceive : ['For the descriptor', `you submitted ${phrase}`],
    guess : ['For the descriptor', `you guessed ${phrase}`]
  };

  return (
    <Container className="h-100 d-flex flex-column justify-content-evenly">
      <Container className="text-center mt-5">
        <h3 className="">
          {phraseMap[use][0]}
        </h3>
        <h2>
          <b>{storyDescriptor}</b> 
        </h2>
        <h3>
          {phraseMap[use][1]}
        </h3>
      </Container>
 
      <Hand hand={cards} isInfo/>
      <Container className="text-center my-2">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </Container>
  );
}
