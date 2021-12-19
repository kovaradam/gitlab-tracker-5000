import { DEV } from 'config';
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
  () => {
    if (DEV) {
      return;
    }

    const { location } = window;
    if (location.protocol !== 'https:') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  },
);

register();
