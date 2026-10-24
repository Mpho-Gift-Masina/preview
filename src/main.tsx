import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Always open at the top of the page on load or reload:
// 1. stop the browser restoring the old scroll position,
// 2. drop a leftover section anchor (e.g. #collection) from the URL so the browser doesn't jump to it.
//    Page routes such as #/policies are kept.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const { hash, pathname, search } = window.location;
if (hash && !hash.startsWith('#/')) history.replaceState(null, '', pathname + search);
window.scrollTo(0, 0);

// Mount the React app into <div id="root"> in index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
