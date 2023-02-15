import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import OptionsModal from '../components/OptionsModal';
import PlayerList from '../components/PlayerList';
import { BiPencil, BiUndo } from 'react-icons/bi';

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
  const nameFormRef = useRef(null);
  const undoRef = useRef(null);

  const handleNameChange = useCallback(e => {
    e.preventDefault();
    setIsEditingName(false);
    if (newName === currentName) {
      return;
    }
    socket.emit('changeName', { roomId, userId, newName });
  }, [roomId, userId, newName, socket, currentName]);

  // automatically selects text box
  useEffect(() => {
    if (isEditingName) {
      nameFormRef.current.focus();
      nameFormRef.current.select();
    }
  }, [isEditingName]);

  // check if click outside of text box, if so cancels update
  useEffect(() => {
    const clickHandler = e => {
      if(document.activeElement !== nameFormRef && undoRef.current && !undoRef.current.contains(e.target)) {
        handleNameChange(e);
      }
    }

    document.addEventListener("mousedown", clickHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, [nameFormRef, undoRef, handleNameChange]);

  if (isEditingName) {
    return (
    <>
      <Form onSubmit={handleNameChange} align="center">
        <Row className='justify-content-center'>
          <Col xs="auto">
            <h5>Your Name: </h5>
          </Col>
          <Col xs="auto">
            <Form.Control className="w-auto" type="text" required name="new-name"
            maxLength="20" placeholder="New Name"
            value={newName}
            onChange={e => setNewName(e.target.value.trimStart())}
            ref={nameFormRef} />
          </Col>
          <Col xs="auto" ref={undoRef}>
            <h5>
              <BiUndo className="mx-2 selectable" onClick={() => {setIsEditingName(false)}}></BiUndo>
            </h5>
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
        <BiPencil className="mx-2 selectable" onClick={() => {setIsEditingName(true)}}></BiPencil>
      </h4>
    </>
  );
}
