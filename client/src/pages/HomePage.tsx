import React, { useState, useEffect } from 'react';
import { Button, Col, Row, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ButtonTimer from '../components/ButtonTimer';
import Sidebar from '../components/Sidebar';
import JustifyEvenlyContainer from '../components/JustifyEvenlyContainer';


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
      <JustifyEvenlyContainer className="d-flex flex-column text-center align-items-center h-100 m-auto">
        <Row className='m-5'>
          <h1 className='rock-salt-regular'>Simpxit</h1>
          <h4>A Simpsons/Dixit Fan Game!</h4>
          <h5>Mashup of the board game 
            <a href="https://boardgamegeek.com/boardgame/39856/dixit" 
              target="_blank" rel="noopener noreferrer">
              &nbsp;Dixit
            </a> 
            &nbsp;with screencaps of 
            <a href="https://www.disneyplus.com/series/the-simpsons/3ZoBZ52QHb4x" 
              target="_blank" 
              rel="noopener noreferrer">
              &nbsp;The Simpsons
            </a> 
            &nbsp;via 
            <a href="https://frinkiac.com/" 
              target="_blank" 
              rel="noopener noreferrer">
              &nbsp;Frinkiac
            </a>
            .
          </h5>
        </Row>
        <Row className='justify-content-center'>
          <Row>
            <h5>To play, create a room or join an already existing room.</h5>
            <Col>
              <ButtonTimer className="my-3" onClick={handleCreateRoom}>Create Room</ButtonTimer>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <h4 className="mt-5">Join Existing Room</h4>
            <Form onSubmit={roomCodeSubmit}>
              <Form.Group>
                <Row className="justify-content-center mb-1">
                  <Col xs="auto" className='justify-content-center align-items-center text-end px-0 mx-1'>
                    <div className="align-self-center">
                      <Form.Label className='my-0 self-center' htmlFor="input-room-code">Room Code:</Form.Label>
                    </div>
                  </Col>
                  <Col xs={4} md={2} lg={1} className='align-items-left p-0 mx-1'>
                    <Form.Control className="text-center" type="text" name="input-room-code" 
                      required maxLength={4} placeholder="XYZW" pattern="[A-Z]{4}"
                      value={enteredRoomId}
                      onChange={e => setEnteredRoomId(e.target.value.toUpperCase())} />
                  </Col>
                </Row>
                <Button className="my-2" type="submit" disabled={enteredRoomId.length !== 4}>Join!</Button>
              </Form.Group>
            </Form>
          </Row>
        </Row>
      </JustifyEvenlyContainer>
    </>
  );
}
