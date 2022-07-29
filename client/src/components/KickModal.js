import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function KickModal({ kickUserId, setKickUserId, kickPlayer, players }) {
  // Citation:
  // Modified from https://react-bootstrap.github.io/components/modal/
  // Date: 07/09/2022

  const handleCloseKick = () => {
    setKickUserId('');
  };
  const handleKickButton = () => {
    kickPlayer();
  };
  
  const playerName = kickUserId === ''? '' : players.filter(p => p.playerId === kickUserId)[0].playerName;

  return (
    <>
      <Modal show={kickUserId} onHide={handleCloseKick}>
        <Modal.Header closeButton>
          <Modal.Title>Kick Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you want to kick {playerName}?</h5>
            <p>
              Player will not be able to rejoin the room from the same tab.
            </p>
        </Modal.Body>
        <Modal.Footer>
          <div className="col text-center">
            <Button variant="danger" onClick={handleKickButton}>
              Kick
            </Button>
            <Button variant="secondary" onClick={handleCloseKick}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}