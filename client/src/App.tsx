import React, { lazy, useCallback, useEffect } from 'react';
import { v4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useSessionStorage from './hooks/useSessionStorage';
import HomePage from './pages/HomePage';
const RoomPage = lazy(() => import('./pages/RoomPage'));
const FourOhFour = lazy(() => import('./pages/FourOhFour')) ;



function App() {

  const [userId, setUserId] = useSessionStorage('userId', '');

  const generateUuid = useCallback(() => {
    setUserId(v4());
  }, [setUserId]);

  useEffect(() => {
    if (userId === '') {
      generateUuid();
    }
  }, [userId, generateUuid]);

  return (
    <React.Suspense fallback={<></>}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage userId={userId} />} />
          <Route path="/room">
            <Route path=":roomId" element={<RoomPage userId={userId} />} />
            <Route path="/room" element={<FourOhFour />}/>
          </Route>
          <Route path="*" element={<FourOhFour />}/>
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
}

export default App;
