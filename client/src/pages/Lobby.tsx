import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import OptionsModal from '../components/OptionsModal';
import PlayerList from '../components/PlayerList';
import { BiPencil, BiUndo } from 'react-icons/bi';
import { Socket } from 'socket.io-client';
import { Player, Options } from "../../../types";

export default function Lobby({ players,
                                roomId,
                                userId,
                                handleLeave,
                                isAdmin,
                                setKickUserId,
                                currentOptions,
                                changeOptions,
                                socket
                              }:
                              {
                                players: Player[],
                                roomId: string,
                                userId: string,
                                handleLeave: React.MouseEventHandler<HTMLButtonElement>,
                                isAdmin: boolean,
                                setKickUserId: Function,
                                currentOptions: Options,
                                changeOptions: Function,
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
    <>
      {isAdmin && <OptionsModal currentOptions={currentOptions} changeOptions={changeOptions} />}
      <Container className="text-center justify-content-center">
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
    </>
  );
}

function NameForm({ players, roomId, userId, socket }:
  {players: Player[], roomId: string, userId: string, socket: Socket | null}) {
  const currentName = players.filter(player => player.playerId === userId)[0].playerName;
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
    }

    document.addEventListener("mousedown", clickHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, [nameFormRef, undoRef, handleNameChange]);

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
            maxLength={20} placeholder="New Name"
            value={newName}
            onChange={e => setNewName(e.target.value.trimStart())}
            ref={nameFormRef} />
          </Col>
          <Col xs="auto" className="d-none d-md-flex" ref={undoRef}>
            <h5>
              <BiUndo className="mx-1 selectable" onClick={() => {setIsEditingName(false)}}></BiUndo>
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
