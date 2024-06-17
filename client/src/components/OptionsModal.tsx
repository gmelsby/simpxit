import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { Options } from '../../../types';

export default function OptionsModal({ currentOptions, changeOptions }:{ currentOptions: Options, changeOptions: (score: number) => void }) {

  const [showOptions, setShowOptions] = useState(false);
  const [newOptions, setNewOptions] = useState(25);

  useEffect(() => {
    setNewOptions(currentOptions.targetScore);
  }, [currentOptions.targetScore]);

  const handleCloseOptions = () => setShowOptions(false);
  const handleShowOptions = () => {
    setShowOptions(true);
    setNewOptions(currentOptions.targetScore);
  };
  
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
          <Form>
            <Form.Group>
              <Container>
                <Row className="text-center">
                  <Form.Label htmlFor="new-target-score">Points to Win</Form.Label>
                </Row>
                <Row className="justify-content-evenly">
                  <Col xs={7} className="text-center">
                    <Form.Range className="w-100 align-middle" name="new-target-score"
                      value={newOptions}
                      max={100}
                      min={5}
                      step={5}
                      onChange={e => setNewOptions(Number(e.target.value))} />
                  </Col>
                  <Col xs={3}>
                    <Form.Control type="number" required name="new-target-score"
                      value={newOptions}
                      max={100}
                      min={5}
                      onChange={e => setNewOptions(Number(e.target.value))} />
                  </Col>
                </Row>
              </Container>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button onClick={changeOptionsToNew}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}