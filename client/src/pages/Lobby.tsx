import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import PlayerList from '../components/PlayerList';
import { CopyIcon } from '../components/CopyIcon';
import { BiPencil } from 'react-icons/bi';
import { Socket } from 'socket.io-client';
import { Player } from '../../../types';
import JustifySafelyContainer from '../components/JustifySafelyContainer';

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
      socket.emit('startGame', { roomId, userId });
    }
  }


  return (
    <JustifySafelyContainer justifyType='evenly' className="h-100 d-flex flex-column text-center">
      <Container className="mt-5 mt-md-0">
        <h1>Room Code: <b>{roomId}</b> <CopyIcon text={roomId} descriptor='Room Code' /></h1>
        <h5 className="my-0">Share this code</h5>
        <h4 className="my-0">(or the page&apos;s url <CopyIcon text={window.location.href} descriptor="Room URL" />)</h4>
        <h6>to let players join this room!</h6>
      </Container>
      <Container className="my-1">
        <Row className="mb-1 mb-md-5">
          <NameForm players={players} roomId={roomId} userId={userId} socket={socket} />
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
    </JustifySafelyContainer>
  );
}

// allows for in-line editing of player name
function NameForm({ players, roomId, userId, socket }:
  { players: Player[], roomId: string, userId: string, socket: Socket | null }) {
  const currentName = players.find(player => player.playerId === userId)?.playerName;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentName ? currentName : '');
  const nameFormRef = useRef<HTMLInputElement>(null);

  const handleNameChange = useCallback((e: Event | React.SyntheticEvent) => {
    e.preventDefault();
    // check if player has not changed name
    if (currentName === newName) {
      setIsEditingName(false);
      return;
    }

    //check if another player already has that name
    if (players.some(p => p.playerName === newName)) {
      return;
    }

    setIsEditingName(false);

    if (socket !== null) {
      socket.emit('changeName', { roomId, userId, newName });
    }
  }, [roomId, userId, newName, socket, currentName]);

  // if current name is empty '' automatically goes into editing name mode
  useEffect(() => {
    if (currentName === '') {
      setIsEditingName(true);
    }
  }, [currentName, setIsEditingName]);

  // updates name if updated elsewhere
  useEffect(() => {
    if (currentName === undefined || currentName === '') return;
    setNewName(currentName);
    if (nameFormRef.current) {
      nameFormRef.current.blur();
    }

  }, [setNewName, currentName, nameFormRef.current]);

  // automatically selects text box
  useEffect(() => {
    if (isEditingName && nameFormRef.current !== null) {
      nameFormRef.current.focus();
      if (currentName !== '') {
        nameFormRef.current.select();
      }
    }
  }, [isEditingName, currentName, nameFormRef.current]);

  useEffect(() => {
    const unfocusHandler = (e: Event) => {
      if (newName !== '') {
        handleNameChange(e);
      }
    };

    // when 'done' is clicked on iOS keyboard or click outside text box is made
    document.addEventListener('focusout', unfocusHandler);
    return () => {
      document.removeEventListener('focusout', unfocusHandler);
    };
  }, [handleNameChange, newName]);

  // allows for in-line editing of name
  if (isEditingName) {
    return (
      <>
        <Form onSubmit={handleNameChange} className="text-center justify-content-center">
          <Row className='justify-content-center'>
            <Col xs="auto">
              <h5 className='mx-0'>{currentName == '' && 'Enter '}Your Name: </h5>
            </Col>
            <Col xs="auto">
              <Form.Control className="px-1 mx-0" type="text" required name="new-name"
                maxLength={20}
                value={newName}
                onChange={e => setNewName(e.target.value.trimStart())}
                autoFocus={true}
                ref={nameFormRef} />
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
        <BiPencil className="mx-2 selectable" onClick={() => { setIsEditingName(true); }}></BiPencil>
      </h4>
    </>
  );
}

