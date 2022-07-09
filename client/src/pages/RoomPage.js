import React from 'react';
import { useParams } from 'react-router-dom';
import RulesModal from '../components/RulesModal'

export default function RoomPage({ userId }) {
  
  const { roomId } = useParams();

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
