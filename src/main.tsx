import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (Fontsource) — no request to Google, so no visitor IP is
// shared with a third party and there is nothing font-related to consent to.
// Weights match what the design uses (see tailwind.config.js fontFamily).
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import App from './App.tsx';
import './index.css';
import { initAnalytics } from './lib/analytics.ts';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
