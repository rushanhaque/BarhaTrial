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

// ── Auto-reload when a new deploy is detected ────────────────────────────
// We compare the build ID baked into this bundle at build time against the
// /api/version endpoint on the live server. If they differ, a new deploy has
// landed and we reload once so the user isn't stuck on stale JS.
const BUNDLE_BUILD_ID = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev'
const RELOAD_KEY = `barira_reloaded_${BUNDLE_BUILD_ID}`

// The authoritative build id is /version.json, written at build time by
// client/scripts/write-version.mjs from the same git SHA that Vite bakes into
// __BUILD_ID__. It is therefore guaranteed to match the deployed bundle.
// /api/version is only a fallback: it reports process.env.BUILD_ID, which is
// not set in every environment.
async function serverBuildId() {
  try {
    const r = await fetch('/version.json', { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (j?.buildId) return j.buildId
    }
  } catch {}
  try {
    const r = await fetch('/api/version', { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (j?.data?.buildId) return j.data.buildId
    }
  } catch {}
  return null
}

async function checkVersion() {
  // Never interrupt the admin — and never reload out from under unpublished edits.
  if (window.location.pathname.startsWith('/admin')) return
  try {
    if (localStorage.getItem('barira_admin_dirty') === '1') return
  } catch {}
  // Guard against reload loops: only reload once per build ID.
  if (sessionStorage.getItem(RELOAD_KEY)) return

  const live = await serverBuildId()
  if (!live || live === 'dev' || BUNDLE_BUILD_ID === 'dev') return
  if (live !== BUNDLE_BUILD_ID) {
    sessionStorage.setItem(RELOAD_KEY, '1')
    window.location.reload()
  }
}

// Check on load (after a short delay so the page can render first).
setTimeout(checkVersion, 3000)

// Also check when the user returns to this tab (covers bfcache and tab switching).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkVersion()
})
window.addEventListener('focus', checkVersion)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) checkVersion() // bfcache restore
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
)
