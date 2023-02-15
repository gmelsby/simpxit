import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import OptionsModal from '../components/OptionsModal';
import PlayerList from '../components/PlayerList';
import { BsPencil } from 'react-icons/bs';

export default function Lobby({ players,
                                roomId,
                                userId,
                                handleLeave,
                                isAdmin,
                                setKickUserId,
                                currentOptions,
                                changeOptions,
                                socket
                              }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  function handleStartGame() {
    socket.emit('startGame', { roomId, userId } );
  }

 
  return (
    <>
      {isAdmin && <OptionsModal currentOptions={currentOptions} changeOptions={changeOptions} />}
      <Container align="center">
        <p>Share this code (or the page's url) to let players join this room!</p>
        <h1>Room Code: {roomId}</h1>
        <NameForm players={players} roomId={roomId} userId={userId} socket={socket}/>
        
        <h3>Player List</h3>
        <PlayerList players={players} setKickUserId={setKickUserId} userId={userId} isAdmin={isAdmin} />
        
        <Button onClick={handleLeave} variant="danger">Leave Room</Button>
        {isAdmin && players.length > 2 && <Button onClick={handleStartGame}>Start Game</Button>}
        {isAdmin && players.length <= 2 && <Button disabled>Start Game</Button>}
        {players.length <= 2 && <p>At least 3 players must be in the room to start a game.</p>}
      </Container>
      <p>Target score: {currentOptions}</p>
    </>
  );
}

function NameForm({ players, roomId, userId, socket }) {
  const currentName = players.filter(player => player.playerId === userId)[0].playerName;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const nameForm = useRef(null);
  useEffect(() => {
    if (isEditingName) {
      nameForm.current.focus();
      nameForm.current.select();
    }
  }, [isEditingName]);

   function handleNameChange(e) {
    e.preventDefault();
    socket.emit('changeName', { roomId, userId, newName });
    setIsEditingName(false);
  }

  if (isEditingName) {
    return (
    <>
      <Form onSubmit={handleNameChange} align="center">
        <Row className='justify-content-center'>
          <Col xs="auto">
            <h4>Your Name: </h4>
          </Col>
          <Col xs="auto">
            <Form.Control className="w-auto" type="text" required name="new-name"
            maxLength="20" placeholder="New Name"
            value={newName}
            onChange={e => setNewName(e.target.value.trimStart())}
            ref={nameForm} />
          </Col>
          <Col xs="auto">
            <Button variant="danger" onClick={() => setIsEditingName(false)}>Cancel</Button>
          </Col>
          <Col xs="auto">
            <Button type="submit">Submit</Button>
          </Col>
        </Row>
      </Form>
    </>
    );
  }

  return (
    <>
      <h4>
        Your Name: {currentName}
        <BsPencil className="mx-2 selectable" onClick={() => {setIsEditingName(true)}}></BsPencil>
      </h4>
    </>
  );
}
