import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Offcanvas, Row, Tab, Tabs } from 'react-bootstrap';
import { BiMenu } from 'react-icons/bi';
import Rules from './Rules';
import { Player } from '../../../types';

export default function Sidebar({ currentName, changeName }: { players?: Player[], userId?: string, currentName?: string, changeName?: (newName: string) => void, targetScore?: number }) {
  const [show, setShow] = useState(false);
  const [newName, setNewName] = useState(currentName !== undefined ? currentName : '');
  const [tabKey, setTabKey] = useState('rules');
  useEffect(() => {
    if (currentName !== undefined) setNewName(currentName);
  }, [currentName, setNewName]);  


  // for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDrag, setTouchDrag] = useState<number | null>(null);
  // distance to count as a swipe
  const swipeDistance = 60;

  // handles swiping closed
  const onTouchStart = (e: TouchEvent) => {
    setTouchDrag(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchDrag(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    // check we have both touch coordinates
    if (touchStart === null || touchDrag === null) {
      return;
    }
    // check that swipe was long enough
    if (touchStart - touchDrag < swipeDistance) {
      return;
    }
    // close Sidebar
    setShow(false);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="secondary" aria-label="Info" className="top-left-button position-absolute top-0 start-0 btn-outline-dark" onClick={handleShow}>
        <BiMenu />
      </Button>

      <Offcanvas show={show} onHide={handleClose} className="offcanvas" {...{onTouchStart, onTouchMove, onTouchEnd}}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Info and Options</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Tabs
            activeKey={tabKey}
            onSelect={key => key !== null && setTabKey(key)}
            className="mb-2"
          >
            <Tab eventKey={'rules'} title="Rules">
              <Rules />
            </Tab>
            {changeName !== undefined && 
              <Tab eventKey={'changeName'} title="Change Name">
                <Form onSubmit={(e: React.SyntheticEvent) => {
                  e.preventDefault();
                  changeName(newName);
                }
                }>
                  <Form.Group>
                    <Row>
                      <Col xs={8} className='d-flex flex-col justify-content-center align-items-center'>
                        <Form.Control type="text" required name="new-name"
                          maxLength={20} placeholder="New Name"
                          value={newName}
                          onChange={e => setNewName(e.target.value.trimStart())}
                        />
                      </Col>
                      <Col>
                        <Button type="submit" className="my-2">Submit</Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Tab>
            }
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}