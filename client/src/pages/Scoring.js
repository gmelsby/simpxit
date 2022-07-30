import { React, useState } from 'react';
import { Container, Image, Button, Modal } from 'react-bootstrap';

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
          <Image src={submittedCards[otherPlayer.playerId].locator} fluid />
          <h4>They scored {otherPlayer.scoredThisRound} points this round.</h4>
          <h4>They now have {otherPlayer.score} total points.</h4>
        </>
      )
    }
  
    const OtherPlayersCards = ({otherPlayers}) => {
      return otherPlayers.map(p => (
        <OtherPlayerCardLine otherPlayer={p} key={p.playerId} />
      ));
    }
  

    return (
      <>
        <Container>
          <h3>The storyteller {storyTeller.playerName} submitted</h3>
          <Image src={submittedCards[storyTeller.playerId].locator} fluid />
          <h4>They scored {storyTeller.scoredThisRound} points this round.</h4>
          <h4>They now have {storyTeller.score} total points.</h4>
          <OtherPlayersCards otherPlayers={players.filter(p => p.playerId !== storyTeller.playerId)} />
        </Container>
        <Button onClick={handleReady}>Ready for Next Round</Button>
      </>
    );
  }