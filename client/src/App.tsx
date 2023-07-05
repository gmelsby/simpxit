import React, { useCallback, useEffect } from 'react';
import { v4 } from "uuid";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
      <Routes>
        <Route path="/" element={<HomePage userId={userId} />} />
        <Route path="/room">
          <Route path=":roomId" element={<RoomPage userId={userId} />} />
          <Route path="/room" element={<p>Page not found.</p>}/>
        </Route>
        <Route path="*" element={<p>Page not found.</p>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
