// Polyfill Buffer for mind-ar's safe-buffer dependency (Node built-in, absent in browser bundles)
import { Buffer } from 'buffer'
globalThis.Buffer = globalThis.Buffer ?? Buffer

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
