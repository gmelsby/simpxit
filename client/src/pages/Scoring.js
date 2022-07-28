import { React, useState } from 'react';
import { Container, Image, Modal } from 'react-bootstrap';

export default function Scoring({ 
                                 userId,
                                 storyTeller,
                                 roomId,
                                 socket,
                                 players,
                                 submittedCards
                                 }) {

    const handleReady = e => {
      e.preventDefault()
        socket.emit('endScoring', {roomId, userId} );
      }
  
    const OtherPlayerCardLine = ({otherPlayer}) => {
      return(
        <>
          <h3>{otherPlayer.playerName} submitted</h3>
          <Image src={submittedCards[otherPlayer.playerId].locator} />
          <h4>They scored {otherPlayer.scoredThisRound} points.</h4>
        </>
      )
    }
  

    return (
      <>
        <Container>
          <h3>The storyteller {storyTeller.playerName} submitted</h3>
          <Image src={submittedCards[storyTeller.playerId].locator}></Image>
          <h4>They scored {storyTeller.scoredThisRound} points.</h4>
          {players.filter(p => p.playerId !== storyTeller.playerId).map(p => {
            <OtherPlayerCardLine otherPlayer={p} />
          }
          )}
        </Container>
      </>
    );
  }