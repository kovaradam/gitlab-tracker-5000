import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './pages';
import { register } from './register-sw';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

register();
