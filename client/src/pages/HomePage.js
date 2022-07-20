import React, { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import RulesModal from '../components/RulesModal';


export default function HomePage( { userId }) {
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [roomIdSubmitted, setroomIdSubmitted] = useState(false);
  
  const roomCodeSubmit = e => {
    e.preventDefault();
    setroomIdSubmitted(true);
  };
  
  if (roomIdSubmitted) {
    return <Redirect push to={`/room/${enteredRoomId}`} />;
  }
  
  const handleCreateRoom = async () => {
    const adminId = { userId };
    const response = await fetch('/createroom', {
      method: 'POST',
      body: JSON.stringify(adminId),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 201) {
      const data = await response.json();
      setEnteredRoomId(data.newRoomCode);
      setroomIdSubmitted(true);
    }
    
    else if (response.status === 403) {
      const data = await response.json();
      alert(`Failed to create room: ${data.error}`);
    }
    
    else {
      alert('Failed to create room')
    }
  };
  
  return (
    <>
      <RulesModal />
          <Container align="center">
          <h1>Welcome to Greg's Image Game!</h1>
          <p>To play, create a room or join an already existing room.</p>
          <Button onClick={handleCreateRoom}>Create Room</Button>

          <p>Join Existing Room</p>
          <Form onSubmit={roomCodeSubmit}>
            <Form.Group>
              <Form.Label htmlFor="input-room-code">Room Code:</Form.Label>
              <Form.Control className="w-auto" type="text" name="input-room-code" 
                required size="4" maxLength="4" placeholder="XYZW" pattern="[A-Z]{4}"
                value={enteredRoomId}
                onChange={e => setEnteredRoomId(e.target.value.toUpperCase())} />
              <Button type="submit">Join!</Button>
            </Form.Group>
          </Form>
      </Container>
      <footer><p>UUID: {userId}</p></footer>
    </>
  );
}
