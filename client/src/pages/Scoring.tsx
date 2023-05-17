import React, {useEffect} from 'react';
import { Container } from 'react-bootstrap';
import ButtonTimer from '../components/ButtonTimer';
import ScoringCardHand from '../components/ScoringCardHand';
import WaitingOn from '../components/WaitingOn';
import { Player, Card } from '../../types';

export default function Scoring({ 
                                 userId,
                                 storyTeller,
                                 roomId,
                                 socket,
                                 players,
                                 storyCardId,
                                 submittedCards,
                                 guesses,
                                 readyPlayers,
                                 targetScore
                                 }:
                                 {
                                  userId: string,
                                  storyTeller: Player,
                                  roomId: string,
                                  socket: any,
                                  players: Player[],
                                  storyCardId: string,
                                  submittedCards: Card[],
                                  guesses: {[key: string]: string},
                                  readyPlayers: string[],
                                  targetScore: number
                                 }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

    const handleReady = () => {
      if (!(isReady)) {
        socket.emit('endScoring', {roomId, userId});
      }
    }

    const winner = players.filter(p => p.score >= targetScore).sort((p1, p2) => p2.score - p1.score)[0];

    const isReady = readyPlayers.includes(userId);
    const waitingOn = players.filter(p => !(readyPlayers.includes(p.playerId)));

    const correctGuesses = Object.values(guesses).filter(cardId => cardId === storyCardId);

    let topMessage = `Nobody guessed the storyteller's card.`;
    if (correctGuesses.length > 0 && correctGuesses.length < Object.values(guesses).length) {
      topMessage = `${players.filter(p => guesses[p.playerId] === storyCardId).map(p => p.playerName).join(", ")} guessed the storyteller's card.`;
    }

    else if (correctGuesses.length === Object.values(guesses).length) {
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
          {!(winner) && !(isReady) && <ButtonTimer onClick={handleReady}>Ready for Next Round</ButtonTimer>}
          {winner && !(isReady) && <ButtonTimer onClick={handleReady}>Return to Room Lobby</ButtonTimer>}
          {isReady && <WaitingOn waitingOn={waitingOn} />}
        </Container>
      </>
    );
  }