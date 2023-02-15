import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Spinner, Container } from 'react-bootstrap';
import RulesModal  from '../components/RulesModal';
import KickModal from '../components/KickModal';
import NameModal from '../components/NameModal'
import LeaveRedirect from '../components/LeaveRedirect'
import Scoreboard from '../components/Scoreboard';
import Lobby from './Lobby.js';
import StoryTellerPick from './StoryTellerPick.js'
import OtherPlayersPick from './OtherPlayersPick';
import OtherPlayersGuess from './OtherPlayersGuess';
import Scoring from './Scoring';
import { io } from "socket.io-client";


export default function RoomPage({ userId }) {
  
  const { roomId } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(undefined);
  const [roomState, setRoomState] = useState({
    adminId: "placeholder", 
    players: [{playerId: ' ', playerName: ''}, {playerId: userId}], 
    gamePhase: "lobby", 
    submittedCards: [], 
    playersToSubmit: [],
    kickedPlayers: [],
    handSize: 6, 
    maxPlayers: 8, 
    targetScore: 25, 
    playerTurn: 0,
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

    const newSocket = io('/');


    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on("receiveRoomState", data => {
      setRoomState(data);
    })
   
    setSocket(newSocket);

    return () => {
      newSocket.close();
    }

  }, [userId, roomId])

  // queries for up-to-date room info
  useEffect(() => {
    if(!userId || !socket || !isConnected) {
      return;
    }

    socket.emit('joinRoom', { roomId, userId }, error => {
      if(error) {
        setErrorMessage(error);
      }
    });

  }, [socket, isConnected, roomId, userId]);

   // case where player clicked the leave button on an error screen
  if (errorMessage && leaveAttempt) {
    return(<LeaveRedirect immediate />);
  }

  if (errorMessage) {
    return(
      <>
        <Alert variant="warning">Error: {errorMessage}</Alert>
        <Container className="text-center">
          <Button onClick={() => {setLeaveAttempt(true)}}>Return to homepage</Button>
        </Container>
      </>
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
  if (roomState.adminId === "placeholder") {
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
    setLeaveAttempt(true);
    socket.emit('leaveRoom', { roomId, userId }, error => {
      if(error) {
        setErrorMessage(error);
      }
    });
  }
  
  const kickPlayer = () => {
    socket.emit('kickPlayer', { roomId, userId, kickUserId });
    setKickUserId('');
  }
  
  const changeName = newName => {
    socket.emit('changeName', { roomId, userId, newName });
  }
  
  const changeOptions = newOptions => {
    socket.emit('changeOptions', { roomId, userId, newOptions });
  }
  

  return (
    <>
      {!isConnected && 
        <Alert variant="danger">Connection with server interrupted. Attempting to reconnect...</Alert>
      }
      <RulesModal />
      <NameModal currentName={roomState.players.filter(player => player.playerId === userId)[0].playerName} changeName={changeName}/>
      <KickModal kickUserId={kickUserId} setKickUserId={setKickUserId} kickPlayer={kickPlayer} players={roomState.players} />
      {roomState.gamePhase !== "lobby" && <Scoreboard players={roomState.players} userId={userId} targetScore={roomState.targetScore} />}
    
        {roomState.gamePhase === "lobby" && <Lobby players={roomState.players} roomId={roomId} userId={userId} handleLeave={handleLeave} 
          isAdmin={isAdmin} setKickUserId={setKickUserId} currentOptions={roomState.targetScore} changeOptions={changeOptions} socket={socket}/>}

        {roomState.gamePhase === "storyTellerPick" && <StoryTellerPick userId={userId} storyTeller={storyTeller} roomId={roomId} socket={socket}
          handSize={roomState.handSize} />}
      
        {roomState.gamePhase === "otherPlayersPick" && <OtherPlayersPick userId={userId} storyTeller={storyTeller} roomId={roomId}
          storyDescriptor={roomState.storyDescriptor} socket={socket} players={roomState.players} submittedCards={roomState.submittedCards} />}

        {roomState.gamePhase === "otherPlayersGuess" && <OtherPlayersGuess userId={userId} storyTeller={storyTeller} roomId={roomId}
          storyDescriptor={roomState.storyDescriptor} socket={socket} players={roomState.players} submittedCards={roomState.submittedCards}
          submittedGuesses={roomState.guesses} />}
      
        {roomState.gamePhase === "scoring" && <Scoring userId={userId} storyTeller={storyTeller} roomId={roomId} socket={socket}
          players={roomState.players} submittedCards={roomState.submittedCards} submittedGuesses={roomState.guesses} 
          readyPlayers={roomState.readyForNextRound} storyCard={roomState.storyCard} guesses={roomState.guesses} targetScore={roomState.targetScore} />} 
    </>
  );
}
