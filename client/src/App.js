import React from 'react';
import {BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import useLocalStorage from './hooks/useLocalStorage';



function App() {
  const [userId, setUserId] = useLocalStorage('user-id');

  return (
    <>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <HomePage />
        </Route>
        <Route path="/room/:roomId">
          <RoomPage />
        </Route>
      </Switch>
    </BrowserRouter>
    </>
  );
}

export default App;
