import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

export default function LeaveRedirect({ kick, immediate }: {kick: boolean, immediate: boolean}){
  
  const [leave, setLeave] = useState(immediate);

  // timer for displaying before redirect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLeave(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if(leave) {
    return(<Redirect to='/'/>);
  }

  if (kick) {
    return(
      <Alert variant="danger" className="my-0">You have been kicked from the room. Taking you back to the homepage in 3 seconds...</Alert>
    );
  }
  
  return(
    <Alert variant="danger" className="my-0">You have left the room. Taking you back to the homepage...</Alert>
  );
}
