import React from 'react';
import { Button, Stack, Image, Modal } from 'react-bootstrap';
import ButtonTimer from './ButtonTimer';
import { Card } from '../../types';

export default function OtherPlayerModal({
                                    use,
                                    selectedCard,
                                    setSelectedCard,
                                    storyDescriptor,
                                    handleSubmit
                                    }:
                                    {
                                      use: 'deceive' | 'guess',
                                      selectedCard: Card | null,
                                      setSelectedCard: Function,
                                      storyDescriptor: string,
                                      handleSubmit: Function
                                    }) {

  const handleCloseSelect = () => {
    setSelectedCard(null);
  };

  const submitCard = () => {
    handleSubmit();
  }

  return (
    <Modal show={selectedCard !== null} onHide={handleCloseSelect}>
      <Modal.Header closeButton>
        {use === "deceive" &&
        <Modal.Title>
          Do you want to submit this card for the phrase "{storyDescriptor}"?
        </Modal.Title>}
        {use === "guess" &&
        <Modal.Title>
          Do you want to guess this card for the phrase "{storyDescriptor}"?
        </Modal.Title>}
      </Modal.Header>
      <Modal.Body>
        <Image src={selectedCard !== null ? selectedCard.locator : ""} fluid />
      </Modal.Body>
      <Modal.Footer>
        <Stack direction="horizontal" gap={3}>
          <Button variant="secondary" onClick={handleCloseSelect}>
            Close
          </Button>
          <ButtonTimer onClick={submitCard}>Submit</ButtonTimer>
        </Stack>
      </Modal.Footer>
    </Modal>
  );
}