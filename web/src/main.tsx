import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import { PlaybackProvider } from './PlaybackContext';
import { initAnalytics } from './firebase';
import './styles.css';

void initAnalytics();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <PlaybackProvider>
        <App />
      </PlaybackProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
