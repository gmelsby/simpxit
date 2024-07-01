import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { Options } from '../../../types';

export default function OptionsModal({ currentOptions, changeOptions }:{ currentOptions: Options, changeOptions: (score: number) => void }) {

  const [showOptions, setShowOptions] = useState(false);
  const [newOptions, setNewOptions] = useState(25);

  useEffect(() => {
    setNewOptions(currentOptions.targetScore);
  }, [currentOptions.targetScore]);

  const handleCloseOptions = () => {
    setShowOptions(false);
    if (currentOptions.targetScore !== newOptions) {
      changeOptions(newOptions);
    }
  };
  const handleShowOptions = () => {
    setShowOptions(true);
    setNewOptions(currentOptions.targetScore);
  };
  
  return (
    <>
      <Button variant="warning" className="top-right-button position-absolute top-0 end-0 btn-outline-dark"  onClick={handleShowOptions}>
        Options
      </Button>

      <Modal show={showOptions} onHide={handleCloseOptions}>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Container>
                <Row className="text-center">
                  <Form.Label htmlFor="new-target-score">Points to Win</Form.Label>
                </Row>
                <Row className="justify-content-evenly">
                  <Col xs={9} className="text-center">
                    <Form.Range className="w-100 align-middle" id="new-target-score"
                      value={newOptions}
                      max={100}
                      min={5}
                      step={5}
                      onChange={e => setNewOptions(Number(e.target.value))} />
                  </Col>
                  <Col xs={3} className="text-center">
                    <h3>{newOptions}</h3>
                  </Col>
                </Row>
              </Container>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}