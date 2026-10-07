import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shell.css';
import { ThirstyThursdaysPage } from './ThirstyThursdays';

// Demo shell only. The deliverable is everything inside ./ThirstyThursdays.
// Append ?impact to the URL to preview the (normally hidden) Our Impact section.
const showImpact = new URLSearchParams(window.location.search).has('impact');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirstyThursdaysPage showImpact={showImpact} />
  </StrictMode>,
);
