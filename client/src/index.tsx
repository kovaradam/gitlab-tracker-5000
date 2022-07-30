import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEV, EXTENSION } from 'config';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './pages';
import { register } from './register-sw';

const rootElement = document.getElementById('root');

if (EXTENSION && rootElement) {
  rootElement.style.width = '20rem';
  rootElement.style.height = '35rem';
}

export const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  rootElement,
  () => {
    const { location } = window;

    if (DEV || EXTENSION) {
      return;
    }

    if (location.protocol !== 'https:') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  },
);

register();
