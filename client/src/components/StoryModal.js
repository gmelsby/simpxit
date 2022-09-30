import { React, useEffect, useRef } from 'react';
import { Form, Image, Modal, Col} from 'react-bootstrap';
import ButtonTimer from './ButtonTimer';

export default function StoryModal({
                                    selectedCard,
                                    setSelectedCard,
                                    descriptor,
                                    setDescriptor,
                                    handleSubmit
                                    }) {

  const handleCloseSelect = () => {
    setSelectedCard(false);
    setDescriptor("");
  };

  const descriptionForm = useRef(null);

  useEffect(() => {
    if (selectedCard) {
      descriptionForm.current.focus();
    }
  }, [selectedCard]);

  
  return (
    <Modal show={selectedCard} onHide={handleCloseSelect}>
      <Modal.Header closeButton>
        <Modal.Title>You selected this image:</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={selectedCard.locator} fluid />
      </Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Modal.Footer>
            <Col xs={8}>
              <Form.Control type="text" required name="descriptor"
              maxLength="45" placeholder="Describe the image"
              value={descriptor}
              onChange={e => setDescriptor(e.target.value.trimStart())}
              ref={descriptionForm} />
            </Col>
            <Col>
              <ButtonTimer type="submit" disabled={descriptor.length < 1}>Submit</ButtonTimer>
            </Col>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}