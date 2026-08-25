// Clear legacy localStorage keys from the old architecture where admin data was
// stored in the browser. The API is now the single source of truth.
try {
  localStorage.removeItem('barira_admin_products')
  localStorage.removeItem('barira_admin_custom_subcategories')
} catch {}

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/chrome.css'
import './styles/pages.css'
import './styles/v2.css'
import './styles/collectionsdolly.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
)
