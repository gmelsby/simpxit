import { React } from 'react';
import { Button, Container } from 'react-bootstrap';
import OptionsModal from '../components/OptionsModal';
import PlayerList from '../components/PlayerList';

export default function Lobby({ players,
                                roomId,
                                userId,
                                handleLeave,
                                isAdmin,
                                setKickUserId,
                                currentOptions,
                                changeOptions
                              }) {

  return (
    <>
      {isAdmin && <OptionsModal currentOptions={currentOptions} changeOptions={changeOptions} />}
      <Container align="center">
        <p>Share this code (or the page's url) to let players join this room!</p>
        <h1>Room Code: {roomId}</h1>
        <h3>Your Name: {players.filter(player => player.playerId === userId)[0].playerName}</h3>
        
        <PlayerList players={players} setKickUserId={setKickUserId} userId={userId} isAdmin={isAdmin} />
        
        <Button onClick={handleLeave} variant="danger">Leave Room</Button>
        {isAdmin && <Button>Start Game</Button>}
      </Container>
      <p>Target score: {currentOptions}</p>
    </>
  );
}