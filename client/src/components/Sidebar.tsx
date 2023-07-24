import React, { useState } from 'react';
import { Button, Offcanvas, Tab, Tabs } from 'react-bootstrap';
import { BiMenu } from 'react-icons/bi';
import Rules from './Rules';
import Scoreboard from './Scoreboard';

export default function Sidebar() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="light" className="sidebar position-absolute top-0 start-0 btn-outline-dark" onClick={handleShow}>
        <BiMenu />
      </Button>

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Tabs>
            <Tab eventKey={'rules'} title="Rules">
              <Rules />
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}