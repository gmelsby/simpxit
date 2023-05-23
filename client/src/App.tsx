import React, { useCallback, useEffect } from 'react';
import { v4 } from "uuid";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css';
import {BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import useSessionStorage from './hooks/useSessionStorage';



function App() {

  const [userId, setUserId] = useSessionStorage('image-app', '');

  const generateUuid = useCallback(() => {
    setUserId(v4());
  }, [setUserId]);

   useEffect(() => {
    if (userId === '') {
       generateUuid();
    }
  }, [userId, generateUuid]);

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
