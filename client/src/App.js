import React from 'react';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import useLocalStorage from './hooks/useLocalStorage';



function App() {
  const [userId, setUserId] = useLocalStorage('user-id');

  return (
    <HomePage onRoomIdSubmit={setUserId} />
  );
}

export default App;
