import { React } from 'react';
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
    console.log(winner)

    const isReady = readyPlayers.includes(userId);
    const waitingOn = players.filter(p => !(readyPlayers.includes(p.playerId)));

    const correct_guesses = Object.values(guesses).filter(c => c === storyCard).length;

    let topMessage = `Some players but not everyone guessed the storyteller's card.`
    if (correct_guesses === 0) {
      topMessage = `Nobody guessed the storyteller's card.`
    }

    else if (correct_guesses === Object.values(guesses).length) {
      topMessage = `Everyone guessed the storyteller's card.`
    }


    return (
      <>
        <Container className="text-center">
            { winner && <h1>{winner.playerName} wins!</h1>}
            <h3 className="my-4">{topMessage}</h3>
          <ScoringCardHand storyTeller={storyTeller} players={players} 
            submittedCards={submittedCards} guesses={guesses} />
        </Container>
        <Container className="my-4 text-center">
          {!(winner) && !(isReady) && <Button onClick={handleReady}>Ready for Next Round</Button>}
          {winner && !(isReady) && <Button onClick={handleReady}>Return to Room Lobby</Button>}
          {isReady && <WaitingOn waitingOn={waitingOn} />}
        </Container>
      </>
    );
  }