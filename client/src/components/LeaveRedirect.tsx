import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

export default function LeaveRedirect({ kick, immediate }: {kick?: boolean, immediate?: boolean}){
  
  const navigate = useNavigate();
  // timer for displaying before redirect
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/');
    }, immediate ? 0 : 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (kick) {
    return(
      <Alert variant="danger" className="my-0">You have been kicked from the room. Taking you back to the homepage...</Alert>
    );
  }
  
  return(
    <Alert variant="danger" className="my-0">You have left the room. Taking you back to the homepage...</Alert>
  );
}
