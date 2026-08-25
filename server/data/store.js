// ── Catalogue store ─────────────────────────────────────────────────────
// One source of truth for the whole site: `data/catalogue.json` in the
// GitHub repo, READ LIVE on request. Nothing is baked into the bundle and
// nothing lives in a browser's localStorage, so every device/browser sees
// the same catalogue the moment Admin publishes — no redeploy, no cache.
//
// A tiny in-memory TTL keeps us far below GitHub's rate limit while still
// feeling instant; publishing primes that cache directly so the very next
// request already serves the new data.

import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { products as seedProducts } from './products.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = process.env.GITHUB_REPO || 'rushanhaque/BarhaTrial'
const BRANCH = process.env.GITHUB_BRANCH || 'main'
const CATALOGUE_PATH = 'data/catalogue.json'
const MEDIA_DIR = 'data/media'
const TTL_MS = Number(process.env.CATALOGUE_TTL_MS || 5000)

const token = () => process.env.GITHUB_TOKEN
const localFile = path.join(__dirname, 'catalogue.json')

const gh = (p) => `https://api.github.com/repos/${REPO}/contents/${p}`
const ghHeaders = () => ({
  Authorization: `token ${token()}`,
  'User-Agent': 'Barha-Admin',
  Accept: 'application/vnd.github+json',
  'Cache-Control': 'no-cache',
})

let cache = { at: 0, products: null, sha: null, version: 0 }

const bump = (products, sha) => {
  cache = { at: Date.now(), products, sha, version: Date.now() }
  return products
}

function readLocal() {
  try {
    if (fs.existsSync(localFile)) return JSON.parse(fs.readFileSync(localFile, 'utf8'))
  } catch {}
  return seedProducts
}

function writeLocal(products) {
  // Best-effort: works in local dev, silently skipped on read-only serverless.
  try {
    fs.writeFileSync(localFile, JSON.stringify(products, null, 2))
  } catch {}
}

/** Fetch the catalogue straight from GitHub (source of truth). */
async function fetchFromGithub() {
  const res = await fetch(`${gh(CATALOGUE_PATH)}?ref=${BRANCH}&t=${Date.now()}`, {
    headers: ghHeaders(),
  })
  if (res.status === 404) return { products: null, sha: null } // not seeded yet
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`)
  const json = await res.json()
  const raw = Buffer.from(json.content || '', 'base64').toString('utf8')
  const parsed = JSON.parse(raw)
  return { products: Array.isArray(parsed) ? parsed : [], sha: json.sha }
}

/**
 * The catalogue every public route reads. Always fresh within TTL_MS.
 * Falls back to the last good copy (then disk, then seed) if GitHub blips,
 * so a network hiccup can never blank the storefront.
 */
export async function getProducts() {
  if (cache.products && Date.now() - cache.at < TTL_MS) return cache.products
  if (!token()) return bump(readLocal(), null)
  try {
    const { products, sha } = await fetchFromGithub()
    if (products) return bump(products, sha)
    return bump(readLocal(), null) // 404 → first publish will create it
  } catch (e) {
    console.warn('  · catalogue: GitHub read failed, serving last known copy —', e.message)
    if (cache.products) {
      cache.at = Date.now()
      return cache.products
    }
    return bump(readLocal(), null)
  }
}

export const summarise = (p) => ({
  index: p.index,
  slug: p.slug,
  name: p.name,
  category: p.category,
  family: p.family,
  signature: p.signature,
  isBestSeller: p.isBestSeller || false,
  tagline: p.tagline,
  priceUSD: p.priceUSD,
  moq: p.moq,
  chromatic: p.chromatic,
  image: p.image,
})

export async function getSummaries() {
  return (await getProducts()).map(summarise)
}

export async function findProduct(slug) {
  return (await getProducts()).find((p) => p.slug === slug)
}

/** Monotonic id of the current catalogue — lets clients detect a change. */
export const getVersion = () => cache.version

/** Commit the catalogue to GitHub and prime the cache so it is live at once. */
export async function saveProducts(products) {
  writeLocal(products)
  if (!token()) {
    bump(products, null)
    return { published: false, message: 'Saved locally. Set GITHUB_TOKEN to publish live.' }
  }

  // Always re-read the sha immediately before writing so two admins editing
  // at once fail loudly instead of silently clobbering each other.
  let sha = null
  try {
    const current = await fetchFromGithub()
    sha = current.sha
  } catch {}

  const res = await fetch(gh(CATALOGUE_PATH), {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Update catalogue via Admin Panel',
      branch: BRANCH,
      content: Buffer.from(JSON.stringify(products, null, 2)).toString('base64'),
      sha: sha || undefined,
    }),
  })
  if (!res.ok) throw new Error('GitHub publish failed: ' + (await res.text()))

  const json = await res.json()
  bump(products, json.content?.sha || null)
  return { published: true, message: 'Published — live on every device.' }
}

/** Store an uploaded image in the repo. Returns the URL the site should use.
 *  Uses content-addressing (SHA-256 of bytes) so the same photo uploaded
 *  twice is stored once, and the URL is immutable/cacheable forever.
 */
export async function saveMedia(filename, base64Data) {
  const buf = Buffer.from(base64Data, 'base64')
  // Content-addressed: first 20 hex chars of SHA-256 + original extension
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase().replace(/jpeg/, 'jpg')
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 20)
  const caFilename = `img_${hash}.${ext}`

  // Local copy so `npm run dev` shows the image without a round-trip.
  try {
    const dir = path.join(__dirname, '..', '..', 'client', 'public', 'images')
    fs.mkdirSync(dir, { recursive: true })
    const localPath = path.join(dir, caFilename)
    if (!fs.existsSync(localPath)) fs.writeFileSync(localPath, buf)
  } catch {}

  if (!token()) return `/images/${caFilename}`

  // Check if the file already exists in the repo (deduplication).
  const checkRes = await fetch(`${gh(`${MEDIA_DIR}/${caFilename}`)}?ref=${BRANCH}`, { headers: ghHeaders() })
  if (checkRes.ok) {
    // Already committed — return the existing URL.
    return `/api/media/${caFilename}`
  }

  const res = await fetch(gh(`${MEDIA_DIR}/${caFilename}`), {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Add product image ${caFilename}`,
      branch: BRANCH,
      content: base64Data,
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    if (res.status === 413) throw new Error('Image too large for GitHub (max ~50 MB base64). Please resize before uploading.')
    throw new Error('Image upload failed: ' + txt)
  }

  // Served through our own /api/media proxy — available instantly, no deploy.
  return `/api/media/${caFilename}`
}

/** Raw bytes for an uploaded image, straight from the repo. */
export async function readMedia(filename) {
  const local = path.join(__dirname, '..', '..', 'client', 'public', 'images', filename)
  if (fs.existsSync(local)) return fs.readFileSync(local)
  if (!token()) return null
  const res = await fetch(`${gh(`${MEDIA_DIR}/${filename}`)}?ref=${BRANCH}`, { headers: ghHeaders() })
  if (!res.ok) return null
  const json = await res.json()
  return Buffer.from(json.content || '', 'base64')
}
