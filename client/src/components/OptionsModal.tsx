import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Options } from '../../../types';

export default function OptionsModal({ currentOptions, changeOptions }:{ currentOptions: Options, changeOptions: (score: number) => void }) {

  const [showOptions, setShowOptions] = useState(false);
  const [newOptions, setNewOptions] = useState(currentOptions.targetScore);

  const handleCloseOptions = () => setShowOptions(false);
  const handleShowOptions = () => setShowOptions(true);
  
  const changeOptionsToNew = (e: React.SyntheticEvent) => {
    e.preventDefault();
    changeOptions(newOptions);
    handleCloseOptions();
  };
  
  return (
    <>
      <Button variant="warning" className="options position-absolute top-0 end-0 btn-outline-dark"  onClick={handleShowOptions}>
        Advanced Options
      </Button>

      <Modal show={showOptions} onHide={handleCloseOptions}>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={changeOptionsToNew}>
            <Form.Group>
              <Form.Label htmlFor="new-target-score">Points to Win (Default 25, Valid range [5-100]):</Form.Label>
              <Form.Control className="w-auto" type="number" required name="new-target-score"
                value={newOptions}
                max={100}
                min={5}
                onChange={e => setNewOptions(Number(e.target.value))} />
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