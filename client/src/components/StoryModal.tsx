import React, { useEffect, useRef } from 'react';
import { Form, Image, Modal, Col} from 'react-bootstrap';
import ButtonTimer from './ButtonTimer';
import { Card } from '../../../types';

export default function StoryModal({
  selectedCard,
  setSelectedCard,
  descriptor,
  setDescriptor,
  handleSubmit
}:
                                    {
                                      selectedCard: Card | null,
                                      setSelectedCard: React.Dispatch<React.SetStateAction<Card | null>>,
                                      descriptor: string,
                                      setDescriptor: React.Dispatch<React.SetStateAction<string>>,
                                      handleSubmit: () => void
                                    }) {

  const handleCloseSelect = () => {
    setSelectedCard(null);
    setDescriptor('');
  };


  const descriptionForm = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCard && descriptionForm.current !== null) {
      descriptionForm.current.focus();
    }
  }, [selectedCard]);

  
  return (
    <Modal show={selectedCard !== null} onHide={handleCloseSelect}>
      <Modal.Header closeButton>
        <Modal.Title>You selected this image:</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={selectedCard?.locator} className="card-img" fluid />
      </Modal.Body>
      <Form onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Modal.Footer>
          <Col xs={8}>
            <Form.Control type="text" required name="descriptor"
              maxLength={45} placeholder="Describe the image"
              value={descriptor}
              onChange={e => setDescriptor(e.target.value.trimStart())}
              ref={descriptionForm} />
          </Col>
          <Col>
            <ButtonTimer onClick={handleSubmit} disabled={descriptor.length < 1}>Submit</ButtonTimer>
          </Col>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}