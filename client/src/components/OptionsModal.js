import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

export default function OptionsModal({ currentOptions, changeOptions }) {

  const [showOptions, setShowOptions] = useState(false);
  const [newOptions, setNewOptions] = useState(currentOptions);

  const handleCloseOptions = () => setShowOptions(false);
  const handleShowOptions = () => setShowOptions(true);
  
  const changeOptionsToNew = e => {
    e.preventDefault();
    changeOptions(newOptions);
    handleCloseOptions();
  };
  
  return (
    <>
      <Button variant="warning" onClick={handleShowOptions}>
        Advanced Options
      </Button>

      <Modal show={showOptions} onHide={handleCloseOptions}>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={changeOptionsToNew}>
              <Form.Group>
                <Form.Label htmlFor="new-target-score">Target Score (Default 25, Valid range [5-100]):</Form.Label>
                <Form.Control className="w-auto" type="number" required name="new-target-score"
                value={newOptions}
                max="100"
                min="5"
                onChange={e => setNewOptions(e.target.value)} />
              <Button type="submit">Submit</Button>
              </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOptions}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}