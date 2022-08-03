import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PlayerList from './PlayerList';

export default function Scoreboard({ players, userId }) {

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
        <Modal.Title>Scoreboard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <PlayerList players={players} userId={userId} scoreboard />
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