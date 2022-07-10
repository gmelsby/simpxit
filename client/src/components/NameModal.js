import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

export default function NameModal({ currentName, changeName}) {
  // from https://react-bootstrap.github.io/components/modal/

  const [showName, setShowName] = useState(false);
  const [newName, setNewName] = useState(currentName);

  const handleCloseName = () => setShowName(false);
  const handleShowName = () => setShowName(true);
  
  const changeNameToNew = e => {
    e.preventDefault();
    changeName(newName);
    handleCloseName();
  };

  return (
    <>
     <Button onClick={handleShowName}>
        Change Name
      </Button>

      <Modal show={showName} onHide={handleCloseName}>
        <Modal.Header closeButton>
          <Modal.Title>Change Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={changeNameToNew}>
              <Form.Group>
                <Form.Control className="w-auto" type="text" required name="new-name"
                maxLength="20" placeholder="New Name" pattern=".\S+.*"
                value={newName}
                onChange={e => setNewName(e.target.value.trimStart())} />
              <Button type="submit">Submit</Button>
              </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseName}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}