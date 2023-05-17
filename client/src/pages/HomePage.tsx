import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Row, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import RulesModal from '../components/RulesModal';
import ButtonTimer from '../components/ButtonTimer';


export default function HomePage( { userId }: { userId: string}) {
  
  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [roomIdSubmitted, setroomIdSubmitted] = useState(false);
  
  const roomCodeSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setroomIdSubmitted(true);
  };
  
  if (roomIdSubmitted) {
    return <Redirect push to={`/room/${enteredRoomId}`} />;
  }
  
  // to make a new room before automatically being sent there
  const handleCreateRoom = async () => {
    const adminId = { userId };
    const response = await fetch(`/room`, {
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
      alert(`Failed to create room: ${response.status}`)
    }
  };
  
  return (
    <>
      <RulesModal />
      <Container className="text-center justify-content-center">
        <h1>Simpsxit: A Simpsons Fan Game!</h1>
        <h5>To play, create a room or join an already existing room.</h5>
        <ButtonTimer onClick={handleCreateRoom}>Create Room</ButtonTimer>

        <h5 className="mt-5">Join Existing Room</h5>
        <Row className="justify-content-center">
        <Col xs={5} sm={3}>
        <Form onSubmit={roomCodeSubmit}>
          <Form.Group className="justify-content-center">
            <Form.Label htmlFor="input-room-code">Room Code:</Form.Label>
            <Form.Control className="text-center" type="text" name="input-room-code" 
              required maxLength={4} placeholder="XYZW" pattern="[A-Z]{4}"
              value={enteredRoomId}
              onChange={e => setEnteredRoomId(e.target.value.toUpperCase())} />
            <Button className="my-2" type="submit" disabled={enteredRoomId.length !== 4}>Join!</Button>
          </Form.Group>
        </Form>
        </Col>
        </Row>
      </Container>
    </>
  );
}
