import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

export default function LeaveRedirect() {
  
  const [leave, setLeave] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLeave(true);
    }, 2000);
  }, []);

  if(leave) {
    return(<Redirect to='/'/>);
  }

  return(<Alert variant="danger">You have left the room. Taking you back to the homepage...</Alert>);
}
