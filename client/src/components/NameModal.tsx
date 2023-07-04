import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

export default function NameModal({ currentName, changeName }: {currentName: string, changeName: Function}) {
  // Citation:
  // Modified from https://react-bootstrap.github.io/components/modal/
  // Date: 07/09/2022

  const [showName, setShowName] = useState(false);
  const [newName, setNewName] = useState(currentName);
  
  // enables automatic focus on form when modal pops up
  const nameForm = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if(showName && nameForm.current) {
      nameForm.current.focus();
    }
  }, [showName])

  const handleCloseName = () => setShowName(false);
  const handleShowName = () => setShowName(true);
  
  const changeNameToNew = (e: React.SyntheticEvent) => {
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
                maxLength={20} placeholder="New Name"
                value={newName}
                onChange={e => setNewName(e.target.value.trimStart())}
                ref={nameForm} />
              <Button type="submit">Submit</Button>
              </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>
    </>
  )
}