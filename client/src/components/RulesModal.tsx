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
              Each round, one player is designated the storyteller. 
              
              That player chooses a card from their hand
              and enters a clue word or phrase to help other players pick the card they selected.
            </p>

            <p>
              The storyteller wants to enter a clue specific enough that at least one player guesses their card but
              vague enough that not everyone guesses their card.
            </p>
            
            <p>
              Every other player then picks a card from their hand in an attempt to fool
              other players into picking their card instead of the storyteller's.
            </p>
            <p><em>Note: In a 3-player game, non-storytellers submit two cards each.</em></p>

            <p>
              Once all non-storyteller players have submitted a card, they get to view the cards all other players submitted.
              They then guess which card the storyteller submitted.
            </p>
          <h5>Scoring</h5> 
              <p>If everybody guesses the storyteller's card, the storyteller gets 0 points and all other players get 2 points.</p>
              <p>If nobody guesses the storyteller's card, the storyteller gets 0 points and all other players get 2 points.</p>
              <p>If at least one player but not every player guesses the storyteller's card, the storyteller and players who guesssed correctly get 3 points.</p>
              <p>If a non-story teller fools another player into guessing their card, they get an additional point per player fooled.</p>
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