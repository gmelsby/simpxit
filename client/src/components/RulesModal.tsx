import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function RulesModal() {
  // Citation:
  // Modified from https://react-bootstrap.github.io/components/modal/
  // Date: 07/09/2022


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
          <h5>Gameplay</h5>
            <p>
              Each round, one player will be designated the storyteller. 
              
              That player chooses a card
              and picks a word to go along with it. 
              
              The storyteller wants to pick a clue word obscure
              enough so that not everyone picks the right card but obvious enough so that at least one
              player guesses the right card.

              Then every other player gets to pick a card from their own hand that they think could fool
              other players into picking their card instead of the storyteller's.

              Once all non-storyteller players have submitted a card, they all get to guess which submitted
              card is the storyteller's.
            </p>
          <h5>Scoring</h5> 
              <p>If everybody guesses the storyteller's card, the storyteller gets 0 points and all other players get 2 points.</p>
              <p>If nobody guesses the storyteller's card, the storyteller gets 0 points and all other players get 2 points.</p>
              <p>If at least one person but not everybody guesses the storyteller's card, the storyteller and players who guesssed correctly get 3 points.</p>
              <p>If a non-story teller fools another player into guessing their card, they get 1 additional point per player fooled.</p>
        </Modal.Body>
        <Modal.Footer>
          <div className="col text-center">
            <Button variant="secondary" onClick={handleCloseRules}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}