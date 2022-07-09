import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RulesModal from '../components/RulesModal';
import { io } from "socket.io-client";

export default function RoomPage({ userId }) {
  
  const { roomId } = useParams();
  const [roomState, setroomState] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (!userId) {
      return;
    }
    const socket = io("127.0.0.1:3000");
    console.log("attempting to join room")
    socket.emit('joinRoom', { roomId, userId }, error => {
      if(error) {
        setErrorMessage(error)
      }
    });
    
  }, [userId, roomId])

  return (
    <>
      <RulesModal />
      <p>Share this code (or the page's url) to let players join this room!</p>
      <h1>Room Code: {roomId}</h1>
      
      <ul>
        <li>Player 1</li>
        <li>Player 2</li>
        <li>Player 3</li>
        <li>Player 4</li>
        <li>Player 5</li>
      </ul>


      
      <button>Leave Room</button>
      <footer><p>UUID: {userId}</p></footer>
    </>
  );
}
