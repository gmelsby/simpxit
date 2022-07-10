import React, { useEffect, useState } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import RulesModal  from '../components/RulesModal';
import KickModal from '../components/KickModal';
import KickRedirect from '../components/KickRedirect';
import PlayerList from '../components/PlayerList';
import { io } from "socket.io-client";

export default function RoomPage({ userId }) {
  
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [leaveRoom, setLeaveRoom] = useState(false);
  const [roomState, setRoomState] = useState({
    adminId: "placeholder", 
    players: [], 
    gamePhase: "lobby", 
    submittedCards: {}, 
    playersToSubmit: [],
    kickedPlayers: [],
    handSize: 6, 
    maxPlayers: 6, 
    targetScore: 25, 
    playerTurn: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [kickUserId, setKickUserId] = useState('');
  
  const handleLeave = () => {
    socket.emit('leaveRoom', { roomId, userId });
    socket.disconnect();
    setLeaveRoom(true);
  }
  
  useEffect(() => {
    if (!userId) {
      return;
    }
    
    // https://developer.okta.com/blog/2021/07/14/socket-io-react-tutorial
    const newSocket = io('127.0.0.1:3000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', { roomId, userId }, error => {
      if(error) {
        setErrorMessage(error)
      }
    });
    
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
    return(<p>Error: {errorMessage}</p>);
  }
  if (roomState.kickedPlayers.includes(userId)) {
    return (<KickRedirect />);
  }
  
  if (!(roomState.players.map(player => player.playerId).includes(userId))) {
    return(<p>Joining Room Unsuccessful</p>);
  }

  if (leaveRoom) {
    return (<Redirect to={'/'} />);
  }
 
  const isAdmin = roomState.players[0].playerId === userId ? true : false;
  

  return (
    <>
      <RulesModal />
      <KickModal socket={socket} roomId={roomId} userId={userId} kickUserId={kickUserId} setKickUserId={setKickUserId} />
      <p>Share this code (or the page's url) to let players join this room!</p>
      <h1>Room Code: {roomId}</h1>
      <h3>Your Name: {roomState.players.filter(player => player.playerId === userId)[0].playerName}</h3>
      
      <PlayerList players={roomState.players} setKickUserId={setKickUserId} userId={userId} isAdmin={isAdmin} />
      
      <Button onClick={handleLeave} variant="danger">Leave Room</Button>
      {isAdmin && <Button>Start Game</Button>}
      <footer><p>UUID: {userId}</p></footer>
    </>
  );
}
