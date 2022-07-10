import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function KickModal({ kickUserId, setKickUserId, kickPlayer }) {
  // from https://react-bootstrap.github.io/components/modal/

  const handleCloseKick = () => {
    setKickUserId('');
  };
  const handleKickButton = () => {
    kickPlayer();
  };

  return (
    <>
      <Modal show={kickUserId} onHide={handleCloseKick}>
        <Modal.Header closeButton>
          <Modal.Title>Kick Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you want to kick player?</h5>
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