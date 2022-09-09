import React from 'react';
import { Container, Button } from 'react-bootstrap';
import ScoringCardHand from '../components/ScoringCardHand';
import WaitingOn from '../components/WaitingOn';

export default function Scoring({ 
                                 userId,
                                 storyTeller,
                                 roomId,
                                 socket,
                                 players,
                                 storyCard,
                                 submittedCards,
                                 guesses,
                                 readyPlayers,
                                 targetScore
                                 }) {

    const handleReady = e => {
      e.preventDefault()
      if (!(isReady)) {
        socket.emit('endScoring', {roomId, userId});
      }
    }

    const winner = players.filter(p => p.score >= targetScore).sort((p1, p2) => p2.score - p1.score)[0];

    const isReady = readyPlayers.includes(userId);
    const waitingOn = players.filter(p => !(readyPlayers.includes(p.playerId)));

    const correctGuesses = Object.values(guesses).filter(c => c === storyCard);

    let topMessage = `Nobody guessed the storyteller's card.`;
    if (correctGuesses.length < 0 && correctGuesses.length < Object.values(guesses).length) {
      topMessage = `${waitingOn.map(p => p.playerName).join(", ")} guessed the storyteller's card.`;
    }

    else if (correctGuesses === Object.values(guesses).length) {
      topMessage = `Everyone guessed the storyteller's card.`;
    }


    return (
      <>
        <Container className="text-center">
            { winner && <h1>{winner.playerName} wins!</h1>}
            <h3 className="my-4">{topMessage}</h3>
            <ScoringCardHand storyTeller={storyTeller} players={players} submittedCards={submittedCards} guesses={guesses} />
        </Container>
        <Container className="my-4 text-center">
          {!(winner) && !(isReady) && <Button onClick={handleReady}>Ready for Next Round</Button>}
          {winner && !(isReady) && <Button onClick={handleReady}>Return to Room Lobby</Button>}
          {isReady && <WaitingOn waitingOn={waitingOn} />}
        </Container>
      </>
    );
  }