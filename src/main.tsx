import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './globals.css';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('Failed to find the root element to mount the React app.');
}

createRoot(mountNode).render(
    <StrictMode>
        <App />
    </StrictMode>
);
