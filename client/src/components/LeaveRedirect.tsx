import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';

export default function LeaveRedirect({ kick, immediate }: {kick?: boolean, immediate?: boolean}){
  
  const navigate = useNavigate();
  // timer for displaying before redirect
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/');
    }, immediate ? 0 : 2000);

    return () => clearTimeout(timeout);
  }, []);

  return(
    <Container className="h-75 d-flex flex-column text-center justify-content-center">
      <Alert variant={kick ? 'danger' : 'warning'} className="my-0">You have {kick ? 'been kicked from' : 'left'} the room. Taking you back to the homepage...</Alert>
    </Container>
 
  );
}
