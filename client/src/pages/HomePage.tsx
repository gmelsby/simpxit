import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Row, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ButtonTimer from '../components/ButtonTimer';
import Sidebar from '../components/Sidebar';


export default function HomePage( { userId }: { userId: string}) {
  
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [roomIdSubmitted, setroomIdSubmitted] = useState(false);

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // navigate to room page when roomId submitted
  const navigate = useNavigate();
  useEffect(() => {
    if (roomIdSubmitted) navigate(`/room/${enteredRoomId}`);
  }, [roomIdSubmitted]);

  
  const roomCodeSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setroomIdSubmitted(true);
  };
  
  
  
  // to make a new room before automatically being sent there
  const handleCreateRoom = async () => {
    const adminId = { userId };
    const response = await fetch('/api/room', {
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
      alert(`Failed to create room: ${response.status}`);
    }
  };
  
  return (
    <>
      <Sidebar />
      <Container className="d-flex flex-column justify-content-start text-center align-items-center pt-5 h-100">
        <Container>
          <h1>Simpxit: A Simpsons/Dixit Fan Game!</h1>
          <h5>Mashup of the board game <a href="https://boardgamegeek.com/boardgame/39856/dixit" target="_blank" rel="noopener noreferrer">Dixit</a> with screencaps of <a href="https://www.disneyplus.com/series/the-simpsons/3ZoBZ52QHb4x" target="_blank" rel="noopener noreferrer">The Simpsons</a> via <a href="https://frinkiac.com/" target="_blank" rel="noopener noreferrer">Frinkiac</a>.</h5>
          <h5>To play, create a room or join an already existing room.</h5>
          <ButtonTimer className="my-3" onClick={handleCreateRoom}>Create Room</ButtonTimer>
        </Container>
        <Row className="justify-content-center">
          <h4 className="mt-5">Join Existing Room</h4>
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
