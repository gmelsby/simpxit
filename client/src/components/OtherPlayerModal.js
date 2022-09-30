import { Button, Stack, Image, Modal } from 'react-bootstrap';
import ButtonTimer from '../components/ButtonTimer';

export default function OtherPlayerModal({
                                    use,
                                    selectedCard,
                                    setSelectedCard,
                                    storyDescriptor,
                                    handleSubmit
                                    }) {

  const handleCloseSelect = () => {
    setSelectedCard(false);
  };

  const submitCard = () => {
    handleSubmit();
  }

  return (
    <Modal show={selectedCard} onHide={handleCloseSelect}>
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
        <Image src={selectedCard.locator} fluid />
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