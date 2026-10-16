import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ensureProductionCleanSlate } from './backend/demoCleaner'

// Initialize production clean slate for real catalog and customer accounts
ensureProductionCleanSlate();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
