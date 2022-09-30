import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

export default function LeaveRedirect({ kick }) {
  
  const [leave, setLeave] = useState(false);

  // timer for displaying before redirect
  useEffect(() => {
    setTimeout(() => {
      setLeave(true);
    }, 2000);
  }, []);

  if(leave) {
    return(<Redirect to='/'/>);
  }

  if (kick) {
    return(
      <Alert variant="danger">You have been kicked from the room. Taking you back to the homepage in 3 seconds...</Alert>
    );
  }
  
  return(
    <Alert variant="danger">You have left the room. Taking you back to the homepage...</Alert>
  );
}
