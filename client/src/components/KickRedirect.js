import React, { useState, useEffect }from 'react';
import { Redirect } from 'react-router-dom';

export default function KickRedirect() {
  
  const [kick, setKick] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setKick(true);
    }, 3000);
  }, []);

  if(kick) {
    return(<Redirect to='/'/>);
  }

  return(<p>You have been kicked from the room. Taking you back to the homepage in 3 seconds...</p>);
}