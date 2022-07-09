import React, { useEffect, useState } from 'react';
import {BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';



function App() {
  const [userId, setUserId] = useState('');

  const getUuid = async () => {
    const response = await fetch('/uuid');
    const data = await response.json();
    
    setUserId(data.uuid);
  };
  
  useEffect(() => {
    getUuid();
  }, []);

  return (
    <>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <HomePage userId={userId} />
        </Route>
        <Route path="/room/:roomId">
          <RoomPage userId={userId} />
        </Route>
      </Switch>
    </BrowserRouter>
    </>
  );
}

export default App;
