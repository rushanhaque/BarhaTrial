// Thin client for the maison-server. In dev, Vite proxies /api → :5180.
// GETs retry with backoff to ride out the dev-proxy cold start (during which
// Vite briefly serves index.html for /api/* before the proxy is live). In
// production the Express server owns /api on the same origin, so try #1 succeeds.

async function once(path, opts = {}) {
  // Callers pass the full path (e.g. "/api/journal"); do not double-prefix.
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...opts,
  })
  const text = await res.text()
  // An HTML body means the proxy isn't ready yet (SPA fallback) — treat as retryable.
  if (!text || text[0] === '<') throw new Error('not-ready')
  const json = JSON.parse(text)
  if (!res.ok || !json.ok) throw new Error(json?.error || 'Request failed.')
  return json.data
}

import { getFallbackProducts } from '../data/fallback.js'

async function request(path, opts = {}) {


  const isWrite = opts.method && opts.method !== 'GET'
  const tries = isWrite ? 1 : 9
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      return await once(path, opts)
    } catch (e) {
      lastErr = e
      if (i < tries - 1) await new Promise((r) => setTimeout(r, Math.min(1000, 180 * (i + 1))))
    }
  }
  throw new Error('The maison did not respond as expected.')
}

export const get = (path) => request(path)
export const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
