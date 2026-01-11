
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Disable automatic scroll restoration to fix the "jump to footer" issue on reload
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Service Worker Registration for "App" functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('App service worker registered', reg))
      .catch(err => console.log('App service worker registration failed', err));
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
