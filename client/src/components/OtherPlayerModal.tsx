import React from 'react';
import { Button, Stack, Image, Modal } from 'react-bootstrap';
import ButtonTimer from './ButtonTimer';
import { Card } from '../../../types';

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
                                      setSelectedCard: React.Dispatch<React.SetStateAction<Card | null>>,
                                      storyDescriptor: string,
                                      handleSubmit: () => void
                                    }) {

  const handleCloseSelect = () => {
    setSelectedCard(null);
  };

  const submitCard = () => {
    handleSubmit();
  };

  return (
    <Modal show={selectedCard !== null} onHide={handleCloseSelect}>
      <Modal.Header closeButton>
        <Modal.Title>
          Do you want to {use === 'deceive' ? 'submit' : 'guess'} this card for the phrase <b>{storyDescriptor}</b>?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={selectedCard !== null ? selectedCard.locator : ''} className="card-img" fluid />
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