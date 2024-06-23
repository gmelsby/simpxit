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

  const phraseMap = {
    storyTeller : ['You submitted the descriptor', 'for this card'],
    deceive : ['For the descriptor', 'you submitted this card'],
    guess : ['For the descriptor', 'you guessed this card']
  };

  return (
    <Container>
      <Container className="text-center mt-5">
        <h3 className="">
          {phraseMap[use][0]}
        </h3>
        <h2>
          <b>{storyDescriptor}</b> 
        </h2>
        <h3 className="mb-4">
          {phraseMap[use][1]}
        </h3>
      </Container>
 
      <Hand hand={cards} isInfo/>
      <Container className="text-center mt-4 pb-5">
        <WaitingOn waitingOn={waitingOn} />
      </Container>
    </Container>
  );
}
