import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEV, EXTENSION } from 'config';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import invariant from 'tiny-invariant';
import './index.css';
import { App } from './pages';

((): void => {
  const { location } = window;
  if (DEV || EXTENSION) {
    return;
  }

  if (location.protocol !== 'https:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }
})();

const rootElement = document.getElementById('root');

invariant(rootElement, 'Did not find root element');

if (EXTENSION) {
  rootElement.style.width = '20rem';
  rootElement.style.height = '35rem';
}

export const queryClient = new QueryClient();

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
