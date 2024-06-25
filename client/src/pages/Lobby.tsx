import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import PlayerList from '../components/PlayerList';
import { CopyIcon } from '../components/CopyIcon';
import { BiPencil, BiUndo } from 'react-icons/bi';
import { Socket } from 'socket.io-client';
import { Player } from '../../../types';

export default function Lobby({ players,
  roomId,
  userId,
  handleLeave,
  isAdmin,
  setKickUserId,
  socket
}:
                              {
                                players: Player[],
                                roomId: string,
                                userId: string,
                                handleLeave: React.MouseEventHandler<HTMLButtonElement>,
                                isAdmin: boolean,
                                setKickUserId: (value: React.SetStateAction<string>) => void,
                                socket: Socket | null
                              }) {

  // scroll to top of page automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  function handleStartGame() {
    if (socket !== null) {
      socket.emit('startGame', { roomId, userId } );
    }
  }

 
  return (
    <Container className="h-100 d-flex flex-column justify-content-evenly text-center">
      <Container className="mt-5 mt-md-0">
        <h1>Room Code: <b>{roomId}</b> <CopyIcon text={roomId} descriptor='Room Code'/></h1>
        <h5 className="my-0">Share this code</h5> 
        <h4 className="my-0">(or the page&apos;s url <CopyIcon text={window.location.href} descriptor="Room URL"/>)</h4>
        <h6>to let players join this room!</h6>
      </Container>
      <Container className="my-1">
        <Row className="mb-1 mb-md-5">
          <NameForm players={players} roomId={roomId} userId={userId} socket={socket}/>
        </Row>
        <h3 className="mb-3 mb-md-4">Player List</h3>
        <PlayerList players={players} setKickUserId={setKickUserId} userId={userId} isAdmin={isAdmin} />
      </Container>
      <Container className="my-1 mb-md-5">
        <Button className="m-2" onClick={handleLeave} variant="danger">Leave Room</Button>
        {isAdmin && <Button className="m-2" disabled={players.length <= 2 || players.filter(p => p.playerName === '').length > 0} onClick={handleStartGame}>Start Game</Button>}
        {players.filter(p => p.playerName === '').length > 0 && players.length > 2 && <p>All players must have names before the game can start.</p>}
        {players.length <= 2 && <p>At least 3 players must be in the room before the game can start.</p>}
      </Container>
    </Container>
  );
}

// allows for in-line editing of player name
function NameForm({ players, roomId, userId, socket }:
  {players: Player[], roomId: string, userId: string, socket: Socket | null}) {
  const currentName = players.find(player => player.playerId === userId)?.playerName;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const nameFormRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<HTMLInputElement>(null);

  const handleNameChange = useCallback((e: MouseEvent | React.SyntheticEvent) => {
    e.preventDefault();
    setIsEditingName(false);
    if (newName === currentName) {
      return;
    }
    if (socket !== null) {
      socket.emit('changeName', { roomId, userId, newName });
    }
  }, [roomId, userId, newName, socket, currentName]);

  useEffect(() => {
    if (nameFormRef !== null && nameFormRef.current !== null) {
      console.log(nameFormRef.current.value);
    }
  }, [currentName]);

  // if current name is empty '' automatically goes into editing name mode
  useEffect(() => {
    if (currentName === '' && newName === '') {
      setIsEditingName(true);
    }
  }, [currentName, isEditingName]);

  // updates name if updated elsewhere
  useEffect(() => {
    if (currentName !== undefined) setNewName(currentName);
  }, [setNewName, currentName]);

  // automatically selects text box
  useEffect(() => {
    if (isEditingName && nameFormRef !== null && nameFormRef.current !== null) {
      nameFormRef.current.focus();
      nameFormRef.current.select();
    }
  }, [isEditingName]);

  // check if click outside of text box, if so cancels update
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if(nameFormRef.current && !nameFormRef.current.contains(e.target as Node) && undoRef.current && !undoRef.current.contains(e.target as Node)) {
        handleNameChange(e);
      }
    };

    document.addEventListener('mousedown', clickHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
    };
  }, [nameFormRef, undoRef, handleNameChange]);

  // allows for in-line editing of name
  if (isEditingName) {
    return (
      <>
        <Form onSubmit={handleNameChange} className="text-center justify-content-center">
          <Row className='justify-content-center'>
            <Col xs="auto">
              <h5 className='mx-0'>Your Name: </h5>
            </Col>
            <Col xs="auto">
              <Form.Control className="px-1 mx-0" type="text" required name="new-name"
                maxLength={20} 
                value={newName}
                onChange={e => setNewName(e.target.value.trimStart())}
                ref={nameFormRef} />
            </Col>
            <Col xs="auto" className="d-none d-md-flex" ref={undoRef}>
              <h5>
                <BiUndo className="mx-1 selectable" onClick={() => {setIsEditingName(false);}}></BiUndo>
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
        <BiPencil className="mx-2 selectable" onClick={() => {setIsEditingName(true);}}></BiPencil>
      </h4>
    </>
  );
}

