import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function FourOhFour() {

  const navigate = useNavigate();

  return (
    <Container className="h-75 d-flex flex-column text-center justify-content-center">
      <Alert variant="warning">Page Not Found</Alert>
      <Container className="text-center mt-5">
        <Button onClick={() => navigate('/')}>← Return to homepage</Button>
      </Container>
    </Container>
  );
}