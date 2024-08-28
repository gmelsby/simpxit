import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import ButtonTimer from '../components/ButtonTimer';
import ScoringCardHand from '../components/ScoringCardHand';
import WaitingOn from '../components/WaitingOn';
import { Player, GameCard } from '../../../types';
import { Socket } from 'socket.io-client';
import JustifySafelyContainer from '../components/JustifySafelyContainer';

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
    socket: Socket | null,
    players: Player[],
    storyCardId: string,
    submittedCards: GameCard[],
    guesses: { [key: string]: string },
    readyPlayers: string[],
    targetScore: number
  }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleReady = () => {
    if (!(isReady) && socket !== null) {
      socket.emit('endScoring', { roomId, userId });
    }
  };

  // list of players whose scores are higher than target score
  const aboveThreshold = players.filter(p => p.score >= targetScore).toSorted((p1, p2) => p2.score - p1.score);
  const winners = aboveThreshold.filter(p => p.score === aboveThreshold[0].score);

  const isReady = readyPlayers.includes(userId);
  const waitingOn = players.filter(p => !(readyPlayers.includes(p.playerId)));

  const correctGuesses = Object.values(guesses).filter(cardId => cardId === storyCardId);

  let topMessage = 'Nobody guessed the storyteller\'s card.';
  if (correctGuesses.length > 0 && correctGuesses.length < Object.values(guesses).length) {
    const guessedPlayerNames = players.filter(p => guesses[p.playerId] === storyCardId).map(p => p.playerName);
    const playerString = guessedPlayerNames.length === 1 ?
      guessedPlayerNames[0]
      :
      `${guessedPlayerNames.slice(0, -1).join(', ')} & ${guessedPlayerNames[guessedPlayerNames.length - 1]}`;

    topMessage = `${playerString} guessed the storyteller's card.`;
  }

  else if (correctGuesses.length === Object.values(guesses).length) {
    topMessage = 'Everyone guessed the storyteller\'s card.';
  }


  return (
    <JustifySafelyContainer justifyType='evenly' className="text-center h-100 d-flex flex-column">
      <Container className="mt-5 mt-md-1">
        {winners.length !== 0 && <h1>{winners.map(p => p.playerName).join(', ')} win{winners.length === 1 && 's'}!</h1>}
        <h3 className="mb-1">{topMessage}</h3>
      </Container>
      <ScoringCardHand storyTeller={storyTeller} players={players} submittedCards={submittedCards} guesses={guesses} />
      <Container className="my-4 pb-1">
        {winners.length === 0 && !(isReady) && <ButtonTimer onClick={handleReady}>Ready for Next Round</ButtonTimer>}
        {winners.length !== 0 && !(isReady) && <ButtonTimer onClick={handleReady}>Return to Room Lobby</ButtonTimer>}
        {isReady && <WaitingOn waitingOn={waitingOn} />}
      </Container>
    </JustifySafelyContainer>
  );
}