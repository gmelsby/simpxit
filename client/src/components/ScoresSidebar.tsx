import React, { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import { Player } from '../../../types';
import PlayerList from './PlayerList';

export default function ScoresSidebar({ players, userId, targetScore }: { players: Player[], userId: string, targetScore: number }) {
  const [show, setShow] = useState(false);

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
    if (touchDrag - touchStart < swipeDistance) {
      return;
    }
    // close Sidebar
    setShow(false);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="secondary" className="top-right-button position-absolute top-0 end-0 btn-outline-dark" onClick={handleShow}>
        Scoreboard
      </Button>

      <Offcanvas placement={'end'} show={show} onHide={handleClose} className="offcanvas" {...{onTouchStart, onTouchMove, onTouchEnd}}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Scoreboard</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <h5>Points to win: {targetScore}</h5>
          <PlayerList {...{players, userId}} isScoreboard />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}