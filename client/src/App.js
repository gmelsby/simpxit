import React, { useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import {BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import useSessionStorage from './hooks/useSessionStorage';



function App() {

  const [userId, setUserId] = useSessionStorage('image-app', '');

  const getUuid = async () => {
    const response = await fetch('/uuid');
    const data = await response.json();
    
    setUserId(data.uuid);
  };

   useEffect(() => {
    if (userId === '') {
       getUuid();
    }
  // eslint-disable-next-line
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
