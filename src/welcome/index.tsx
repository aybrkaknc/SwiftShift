import React from 'react';
import ReactDOM from 'react-dom/client';
import Welcome from './Welcome';
import '../styles/globals.css';
import { TranslationProvider } from '../utils/TranslationContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TranslationProvider>
            <Welcome />
        </TranslationProvider>
    </React.StrictMode>,
);
