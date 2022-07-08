import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function LeaveModal() {
  // from https://react-bootstrap.github.io/components/modal/
  const [showLeave, setShowLeave] = useState(false);

  const handleCloseLeave = () => setShowLeave(false);
  const handleShowLeave = () => setShowLeave(true);

  return (
    <>
     <Button onClick={handleShowLeave}>
        Leave Room
      </Button>

      <Modal show={showLeave} onHide={handleCloseLeave}>
        <Modal.Header closeButton>
          <Modal.Title>Leave Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you want to leave the room?</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button>
            Leave
          </Button>
          <Button variant="secondary" onClick={handleCloseLeave}>
            Stay
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}