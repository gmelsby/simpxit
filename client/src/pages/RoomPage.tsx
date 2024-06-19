import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Spinner, Container } from 'react-bootstrap';
import KickModal from '../components/KickModal';
import OptionsModal from '../components/OptionsModal';
import LeaveRedirect from '../components/LeaveRedirect';
import Lobby from './Lobby';
import StoryTellerPick from './StoryTellerPick';
import OtherPlayersPick from './OtherPlayersPick';
import OtherPlayersGuess from './OtherPlayersGuess';
import Scoring from './Scoring';
import { io } from 'socket.io-client';
import { Room } from '../../../types';
import { Socket } from 'socket.io-client'; 
import Sidebar from '../components/Sidebar';


export default function RoomPage({ userId }: {userId: string}) {
  
  const { roomId } = useParams<{ roomId: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  // sets up base room state
  const [roomState, setRoomState] = useState<Room>({
    players: [
      {playerId: 'placeholder', playerName: '', score: 0, hand: [], scoredThisRound: 0}, 
      {playerId: userId, playerName: '', score: 0, hand: [], scoredThisRound: 0}
    ], 
    gamePhase: 'lobby', 
    submittedCards: [], 
    kickedPlayers: [],
    storyDescriptor: '',
    handSize: 6, 
    maxPlayers: 8, 
    targetScore: 25, 
    playerTurn: 0,
    storyCardId: '',
    guesses: {},
    readyForNextRound:  [],
    lastModified: 0
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [kickUserId, setKickUserId] = useState('');
  const [leaveAttempt, setLeaveAttempt] = useState(false);
  
 
  useEffect(() => {
    if (!userId) {
      return;
    }

    const newSocket = io('/', {
    });


    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receiveRoomState', data => {
      setRoomState(data);
    });
   
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };

  }, [userId, roomId]);

  // queries for up-to-date room info
  useEffect(() => {
    if(!userId || !socket || !isConnected) {
      return;
    }

    socket.emit('joinRoom', { roomId, userId }, (error: string) => {
      if(error) {
        setErrorMessage(error);
      }
    });

  }, [socket, isConnected, roomId, userId]);

  // handles missing roomId
  if (roomId === undefined) {
    return(<LeaveRedirect immediate />);
  }

  // case where player clicked the leave button on an error screen
  if (errorMessage && leaveAttempt) {
    return(<LeaveRedirect immediate />);
  }

  if (errorMessage) {
    return(
      <Container className="h-100 d-flex flex-column text-center justify-content-center">
        <Alert variant="warning">Error: {errorMessage}</Alert>
        <Container className="text-center mt-5">
          <Button onClick={() => {setLeaveAttempt(true);}}>← Return to homepage</Button>
        </Container>
      </Container>
    );
  }


  
  // case where a user is kicked
  if (roomState.kickedPlayers.includes(userId)) {
    return (<LeaveRedirect kick />);
  }
  
  // case where player has been removed form server due to leave attempt
  if (!(roomState.players.map(player => player.playerId).includes(userId)) && leaveAttempt) {
    return (<LeaveRedirect />);

  }


  // loading screen
  if (roomState.players[0].playerId === 'placeholder') {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <h5>Attempting to connect to room...</h5>
      </Container>
    );
  }

  const isAdmin = roomState.players[0].playerId === userId ? true : false;
  const storyTeller = roomState.players[roomState.playerTurn];

  const handleLeave = () => {
    if (socket === null) return;
    setLeaveAttempt(true);
    socket.emit('leaveRoom', { roomId, userId }, (error: string) => {
      if(error) {
        setErrorMessage(error);
      }
    });
  };
  
  const kickPlayer = () => {
    if (socket === null) return;
    socket.emit('kickPlayer', { roomId, userId, kickUserId });
    setKickUserId('');
  };
  
  const changeName = (newName: string) => {
    if (socket === null) return;
    socket.emit('changeName', { roomId, userId, newName });
  };
  
  const changeOptions = (newOptions: number) => {
    if (socket === null) return;
    socket.emit('changeOptions', { roomId, userId, newOptions });
  };

  const currentName = roomState.players.find(p => p.playerId === userId)?.playerName;


  return (
    <>
      <Sidebar players={roomState.players} targetScore={roomState.targetScore} {...{userId, currentName, changeName}}/>
      {isAdmin && roomState.gamePhase == 'lobby' && <OptionsModal currentOptions={{targetScore: roomState.targetScore}} changeOptions={changeOptions} />}
      {!isConnected && 
        <Alert variant="danger" className="my-0">Connection with server interrupted. Attempting to reconnect...</Alert>
      }
      <KickModal kickUserId={kickUserId} setKickUserId={setKickUserId} kickPlayer={kickPlayer} players={roomState.players} />
    
      {roomState.gamePhase === 'lobby' && <Lobby players={roomState.players} roomId={roomId} userId={userId} handleLeave={handleLeave} 
        isAdmin={isAdmin} setKickUserId={setKickUserId} socket={socket}/>}

      {roomState.gamePhase === 'storyTellerPick' && <StoryTellerPick userId={userId} storyTeller={storyTeller} roomId={roomId} socket={socket}
        handSize={roomState.handSize} />}
      
      {roomState.gamePhase === 'otherPlayersPick' && <OtherPlayersPick userId={userId} storyTeller={storyTeller} roomId={roomId}
        storyDescriptor={roomState.storyDescriptor} socket={socket} players={roomState.players} submittedCards={roomState.submittedCards} />}

      {roomState.gamePhase === 'otherPlayersGuess' && <OtherPlayersGuess userId={userId} storyTeller={storyTeller} roomId={roomId}
        storyDescriptor={roomState.storyDescriptor} socket={socket} players={roomState.players} submittedCards={roomState.submittedCards}
        submittedGuesses={roomState.guesses} />}
      
      {roomState.gamePhase === 'scoring' && <Scoring userId={userId} storyTeller={storyTeller} roomId={roomId} socket={socket}
        players={roomState.players} submittedCards={roomState.submittedCards} readyPlayers={roomState.readyForNextRound}
        storyCardId={roomState.storyCardId} guesses={roomState.guesses} targetScore={roomState.targetScore} />} 
    </>
  );
}
