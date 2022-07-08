import React, { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import RulesModal from '../components/RulesModal';


export default function HomePage() {
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [roomIdSubmitted, setroomIdSubmitted] = useState(false);
  
  function roomCodeSubmit(e) {
    e.preventDefault();
    setroomIdSubmitted(true);
  }  
  
  if (roomIdSubmitted) {
    return (<Redirect to={`/room/${enteredRoomId}`} />);
  }
  
  return (
    <>
      <RulesModal />
          <Container align="center">
          <h1>Welcome to Greg's Image Game!</h1>
          <p>To play, create a room or join an already existing room.</p>
          <Button>Create Room</Button>

          <p>Join Existing Room</p>
          <Form onSubmit={roomCodeSubmit}>
            <Form.Group>
                  <Form.Label htmlFor="input_room_code">Room Code:</Form.Label>
                  <Form.Control className="w-auto" type="text" name="input_room_code" 
                    required size="4" maxLength="4" placeholder="XYZW" pattern="[A-Z]{4}"
                    onChange={e => setEnteredRoomId(e.target.value)}>
                  </Form.Control>
                  <Button type="submit">Join!</Button>
            </Form.Group>
          </Form>
      </Container>
    </>
  );
}
