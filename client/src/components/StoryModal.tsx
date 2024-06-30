import React, { useEffect, useRef } from 'react';
import { Form, Modal, Col} from 'react-bootstrap';
import ButtonTimer from './ButtonTimer';
import { GameCard } from '../../../types';
import GameImage from './GameImage';

export default function StoryModal({
  selectedCard,
  setSelectedCard,
  descriptor,
  setDescriptor,
  handleSubmit
}:
                                    {
                                      selectedCard: GameCard | null,
                                      setSelectedCard: React.Dispatch<React.SetStateAction<GameCard | null>>,
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
        <GameImage card={selectedCard ? selectedCard : {id: '-1', locator:'/image-placeholder.svg'}} className="card-img" />
      </Modal.Body>
      <Form onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Modal.Footer>
          <Col xs={8} md={9}>
            <Form.Control type="text" required name="descriptor"
              maxLength={45} placeholder="Describe the image"
              value={descriptor}
              onChange={e => setDescriptor(e.target.value.trimStart())}
              ref={descriptionForm} />
          </Col>
          <Col className='text-center'>
            <ButtonTimer onClick={handleSubmit} disabled={descriptor.length < 1}>Submit</ButtonTimer>
          </Col>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}