import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// gets bootstrap style sheet
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.render(
  (<StrictMode>
    <App />
  </StrictMode>), 
  document.getElementById('root') as HTMLElement
);

reportWebVitals();
