import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobile Error Catcher (Helps debug white screens on phone)
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const message = [
    'Message: ' + msg,
    'URL: ' + url,
    'Line: ' + lineNo,
    'Column: ' + columnNo,
    'Error object: ' + JSON.stringify(error)
  ].join('\n');
  alert("Pantry Bloom Crash: " + message);
  return false;
};

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  alert("Render Error: " + e.message);
}
