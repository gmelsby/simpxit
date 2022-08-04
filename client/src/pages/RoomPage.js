import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner, Container } from 'react-bootstrap';
import RulesModal  from '../components/RulesModal';
import KickModal from '../components/KickModal';
import NameModal from '../components/NameModal'
import KickRedirect from '../components/KickRedirect';
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
  const [socket, setSocket] = useState(null);
  const [roomState, setRoomState] = useState({
    adminId: "placeholder", 
    players: [{playerId: ' ', playerName: ''}, {playerId: userId}], 
    gamePhase: "lobby", 
    submittedCards: {}, 
    playersToSubmit: [],
    kickedPlayers: [],
    handSize: 6, 
    maxPlayers: 6, 
    targetScore: 25, 
    playerTurn: 0,
    guesses: {},
    readyForNextRound:  []
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [kickUserId, setKickUserId] = useState('');
  
 
  useEffect(() => {
    if (!userId) {
      return;
    }
    
    // Citation
    // Socket logic adapted from https://developer.okta.com/blog/2021/07/14/socket-io-react-tutorial
    // Date: 07/09/2022
    const newSocket = io('127.0.0.1:3000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', { roomId, userId }, error => {
      if(error) {
        setErrorMessage(error)
      }
    });
    // close socket on teardown
    return () => newSocket.close();

  }, [userId, roomId, setSocket])
  
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("receiveRoomState", data => {
      setRoomState(data);
    })
  }, [socket]);
  
  if (errorMessage) {
    return(
      <Alert variant="warning">Error: {errorMessage}</Alert>);
  }
  if (roomState.kickedPlayers.includes(userId)) {
    return (<KickRedirect />);
  }
  
  if (!(roomState.players.map(player => player.playerId).includes(userId))) {
    return (<LeaveRedirect />);
  }

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
    socket.emit('leaveRoom', { roomId, userId });
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
