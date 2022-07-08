import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function RulesModal() {
  // from https://react-bootstrap.github.io/components/modal/
  const [showRules, setShowRules] = useState(false);

  const handleCloseRules = () => setShowRules(false);
  const handleShowRules = () => setShowRules(true);

  return (
    <>
     <Button onClick={handleShowRules}>
        View Rules
      </Button>

      <Modal show={showRules} onHide={handleCloseRules}>
        <Modal.Header closeButton>
          <Modal.Title>Game Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Starting the game</h5>
            <p>
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
            </p>
          <h5>Scoring</h5> 
            <p>
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
              Rules Rules Rules Rules Rules. Rules rules rules.
            </p>
        </Modal.Body>
        <Modal.Footer>
          <div class="col text-center">
            <Button variant="secondary" onClick={handleCloseRules}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}