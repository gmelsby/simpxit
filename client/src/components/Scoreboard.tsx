import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PlayerList from './PlayerList';
import { Player } from '../../../types';

export default function Scoreboard({ players, userId, targetScore }: {players: Player[], userId: string, targetScore: number}) {

  const [showScoreboard, setShowScoreboard] = useState(false);

  const handleCloseScoreboard = () => setShowScoreboard(false);
  const handleShowScoreboard = () => setShowScoreboard(true);

  return (
    <>
    <Button onClick={handleShowScoreboard}>
      Scoreboard
    </Button>

    <Modal show={showScoreboard} onHide={handleCloseScoreboard}>
      <Modal.Header closeButton>
        <Modal.Title>Scoreboard </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <h6>Target Score: {targetScore}</h6>
        <PlayerList players={players} userId={userId} isScoreboard />
      </Modal.Body>
      <Modal.Footer>
        <div className="col text-center">
          <Button variant="secondary" onClick={handleCloseScoreboard}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
    </>
  );
}