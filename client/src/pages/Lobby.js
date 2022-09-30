import { React } from 'react';
import { Container } from 'react-bootstrap';
import ButtonTimer from '../components/ButtonTimer';
import OptionsModal from '../components/OptionsModal';
import PlayerList from '../components/PlayerList';

export default function Lobby({ players,
                                roomId,
                                userId,
                                handleLeave,
                                isAdmin,
                                setKickUserId,
                                currentOptions,
                                changeOptions,
                                socket
                              }) {

  function handleStartGame() {
    socket.emit('startGame', { roomId, userId } );
  }
  
  return (
    <>
      {isAdmin && <OptionsModal currentOptions={currentOptions} changeOptions={changeOptions} />}
      <Container align="center">
        <p>Share this code (or the page's url) to let players join this room!</p>
        <h1>Room Code: {roomId}</h1>
        <h3>Your Name: {players.filter(player => player.playerId === userId)[0].playerName}</h3>
        
        <PlayerList players={players} setKickUserId={setKickUserId} userId={userId} isAdmin={isAdmin} />
        
        <ButtonTimer onClick={handleLeave} variant="danger">Leave Room</ButtonTimer>
        {isAdmin && <ButtonTimer onClick={handleStartGame} disabled={players.length <= 2}>Start Game</ButtonTimer>}
        {players.length <= 2 && <p>At least 3 players must be in the room to start a game.</p>}
      </Container>
      <p>Target score: {currentOptions}</p>
    </>
  );
}