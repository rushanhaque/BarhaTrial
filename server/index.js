import express from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import crypto from 'node:crypto'
import 'dotenv/config'

// ── Single source of truth — reads catalogue from GitHub JSON, short-TTL cache ──
import { getProducts, getSummaries, findProduct, saveProducts, saveMedia, readMedia, getVersion } from './data/store.js'

import { offices, milestones, people, factoryStats } from './data/factory.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5180

app.set('etag', false)
app.set('x-powered-by', false)
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Baseline security headers (safe defaults; no CSP on API).
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'SAMEORIGIN')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  if (req.path.startsWith('/')) console.log(`  · ${req.method}  /api${req.path}`)
  next()
})

const ok = (res, data) => res.json({ ok: true, data })
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// ── The Metalcraft Catalogue — all reads go through the live store ────────
app.get('/api/health', (_req, res) => ok(res, { house: 'Barira Handicrafts', status: 'open', version: '3.0' }))

// Catalogue version endpoint — lets the client poll for changes.
app.get('/api/catalogue-version', (_req, res) => ok(res, { version: getVersion() }))

app.get('/api/products', async (_req, res) => {
  try { ok(res, await getSummaries()) } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

app.get('/api/products-full', async (_req, res) => {
  try { ok(res, await getProducts()) } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

app.get('/api/products/:slug', async (req, res) => {
  try {
    const p = await findProduct(req.params.slug)
    if (!p) return res.status(404).json({ ok: false, error: 'No such product.' })
    const summaries = await getSummaries()
    const related = summaries.filter((s) => s.slug !== p.slug && s.family === p.family).slice(0, 3)
    if (related.length < 3) {
      related.push(...summaries.filter(s => s.slug !== p.slug && !related.find(r => r.slug === s.slug)).slice(0, 3 - related.length))
    }
    ok(res, { product: p, related })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

app.get('/api/factory', (_req, res) => ok(res, { offices, milestones, people, factoryStats }))

// ── Media proxy — images uploaded via admin are served from the repo ──────
// This lets Vercel serverless return images without a redeploy.
app.get('/api/media/:filename', async (req, res) => {
  const { filename } = req.params
  if (!/^[\w.\-]+$/.test(filename)) return res.status(400).send('Bad filename')
  const buf = await readMedia(filename)
  if (!buf) return res.status(404).send('Not found')
  const ext = filename.split('.').pop().toLowerCase()
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  res.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
  res.set('Content-Type', mime)
  res.send(buf)
})

// ── Version endpoint — lets clients poll for deploy changes ───────────────
// Vercel exposes the deployed commit as VERCEL_GIT_COMMIT_SHA; the client
// bundle is stamped with `git rev-parse --short HEAD`, so compare the short
// form. BUILD_ID stays available as an explicit override.
const BUILD_ID =
  process.env.BUILD_ID ||
  (process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : null) ||
  'dev'

app.get('/api/version', (_req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0')
  ok(res, { version: getVersion(), buildId: BUILD_ID })
})

app.get('/api/status', async (_req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0')
  let productCount = 0
  let catalogueOk = false
  try {
    const products = await getProducts()
    productCount = Array.isArray(products) ? products.length : 0
    catalogueOk = true
  } catch {}
  res.json({
    status: 'ok',
    buildId: BUILD_ID,
    version: getVersion(),
    github: process.env.GITHUB_TOKEN ? 'configured' : 'missing',
    catalogue: { ok: catalogueOk, products: productCount },
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  })
})

// ── Admin Engine ───────────────────────────────────────────────────────────
app.post('/api/admin/publish', async (req, res) => {
  // Auth is handled by Vercel env isolation — GITHUB_TOKEN is never exposed
  // to the client, so only server-side code can reach this endpoint in prod.

  const { products: newProducts } = req.body
  if (!newProducts || !Array.isArray(newProducts)) {
    return res.status(400).json({ ok: false, error: 'Invalid products data' })
  }

  // Validate photo paths — reject traversal attempts.
  const SAFE_PATH = /^\/api\/media\/img_[a-f0-9]{20}\.(jpg|png|webp|avif|gif)$/
  for (const p of newProducts) {
    if (p.image && p.image.startsWith('/') && !p.image.startsWith('/images/') && !SAFE_PATH.test(p.image)) {
      return res.status(400).json({ ok: false, error: `Invalid image path: ${p.image}` })
    }
  }

  try {
    const photoCount = newProducts.filter(p => p.image?.startsWith('data:image/')).length
    // Upload any base64 images; replace inline data with a stable URL.
    for (const p of newProducts) {
      if (p.image && p.image.startsWith('data:image/')) {
        const isPng = p.image.includes('image/png')
        const ext = isPng ? 'png' : 'jpeg'
        const base64Data = p.image.split(',')[1]
        const filename = `upload.${ext}`
        p.image = await saveMedia(filename, base64Data)
      }
      // Clear preview blob URLs that came from the browser
      delete p.imagePreview
    }

    const result = await saveProducts(newProducts)
    ok(res, { ...result, photosCommitted: photoCount })
  } catch (e) {
    const status = e.message.includes('too large') ? 413 : 500
    res.status(status).json({ ok: false, error: e.message })
  }
})

// ── B2B Custom Manufacturing Engine ────────────────────────────────────────
app.post('/api/custom-manufacturing', async (req, res) => {
  const { material = '', finish = '', category = '' } = req.body || {}
  try {
    const products = await getProducts()
    const summaries = await getSummaries()
    const scores = Object.fromEntries(products.map((p) => [p.slug, 0]))

    products.forEach((p) => {
      if (material && (p.materials?.primary || []).join(' ').toLowerCase().includes(material.toLowerCase())) scores[p.slug] += 3
      if (finish && (p.materials?.finish || []).join(' ').toLowerCase().includes(finish.toLowerCase())) scores[p.slug] += 2
      if (category && p.category.toLowerCase().includes(category.toLowerCase())) scores[p.slug] += 3
    })

    const ranked = [...products].sort((a, b) => scores[b.slug] - scores[a.slug])
    const top = ranked[0]
    const alt = ranked.slice(1, 3).map((p) => summaries.find((s) => s.slug === p.slug))
    ok(res, {
      match: top,
      alternates: alt,
      rationale: `Based on your interest in ${material || 'custom metal'}, finished in ${finish || 'our signature style'}, we recommend exploring the ${top.name} as a starting point for your custom order.`,
    })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// ── Correspondence & orders (demo: validate & echo, persist nothing) ────
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body || {}
  if (!isEmail(email)) return res.status(422).json({ ok: false, error: 'A valid email is required.' })
  ok(res, { message: 'You have subscribed to catalogue updates.' })
})
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {}
  if (!name || !isEmail(email) || !message) return res.status(422).json({ ok: false, error: 'Name, a valid email, and a message are required.' })
  ok(res, { message: `Thank you, ${String(name).split(' ')[0]}. Our export team will respond within two working days.` })
})
app.post('/api/orders', (req, res) => {
  const { name, email, items } = req.body || {}
  if (!name || !isEmail(email) || !Array.isArray(items) || items.length === 0) {
    return res.status(422).json({ ok: false, error: 'A name, valid email, and at least one item are required for a quote.' })
  }
  const count = items.reduce((n, it) => n + (it.qty || 1), 0)
  const reference = 'B2B-' + Math.abs(hash(email + items.map((i) => i.slug).join())).toString(36).toUpperCase().slice(0, 6)
  ok(res, {
    reference,
    message: `Quote Request ${reference} Received, ${String(name).split(' ')[0]} — ${count} ${count === 1 ? 'item' : 'items'}. A representative will contact you with shipping and bulk pricing.`,
  })
})

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return h
}

// ── Product Catalogue — force inline display in browser ────────────────
app.get('/catalogue.pdf', (_req, res) => {
  const pdf = path.join(__dirname, '..', 'client', 'public', 'catalogue.pdf')
  if (!fs.existsSync(pdf)) return res.status(404).send('Not found')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline; filename="Barira-Handicrafts-Catalogue.pdf"')
  res.sendFile(pdf)
})

// ── SEO: robots + sitemap ─────────────────────────────────────────────────
const baseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`
const ROUTES = ['/', '/catalogue', '/about', '/custom-orders', '/trade-fairs', '/blog', '/contact']

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl(req)}/sitemap.xml\n`)
})
app.get('/sitemap.xml', async (req, res) => {
  const b = baseUrl(req)
  const products = await getProducts().catch(() => [])
  const urls = [...ROUTES, ...products.map((p) => `/product/${p.slug}`)]
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${b}${u}</loc><changefreq>monthly</changefreq></url>`).join('\n') +
    `\n</urlset>\n`
  res.type('application/xml').send(body)
})

// ── Serve the built client in production (with per-route SEO meta) ──────
const dist = path.join(__dirname, '..', 'client', 'dist')
if (fs.existsSync(dist)) {
  // Static images were converted to WebP. The live catalogue on GitHub still
  // references the old .png/.jpeg names until an admin republishes, so map a
  // legacy extension onto its WebP sibling rather than 404ing.
  app.get(/^\/images\/(.+)\.(png|jpe?g)$/i, (req, res, next) => {
    const webp = path.join(dist, 'images', `${req.params[0]}.webp`)
    if (!fs.existsSync(webp)) return next()
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.type('image/webp').sendFile(webp)
  })

  // Hashed assets are immutable; cache hard.
  app.use(
    express.static(dist, {
      index: false,
      setHeaders: (res, filePath) => {
        if (/[\\/]assets[\\/]/.test(filePath)) res.set('Cache-Control', 'public, max-age=31536000, immutable')
      },
    })
  )

  const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const SEO = {
    '/': ['Barira Handicrafts — Manufacturer & Exporter', 'Premium metal handicrafts and decor exporter from India.'],
    '/catalogue': ['Metalcraft Catalogue — Barira Handicrafts', 'Browse our export catalogue of handcrafted brass, copper, and iron products.'],
    '/about': ['About the Factory — Barira Handicrafts', 'A leading exporter of Indian handicrafts and decorative metalwork.'],
    '/custom-orders': ['Custom Manufacturing — Barira Handicrafts', 'Submit an inquiry for custom B2B manufacturing.'],
    '/trade-fairs': ['Trade Fairs — Barira Handicrafts', 'Visit our showcases at global trade fairs.'],
    '/blog': ['Blog — Barira Handicrafts', 'Insights into metalworking and our manufacturing process.'],
    '/contact': ['Contact Us — Barira Handicrafts', 'Get in touch with our export team and global offices.'],
  }
  const metaFor = async (p) => {
    if (SEO[p]) return SEO[p]
    const m = p.match(/^\/product\/(.+)$/)
    if (m) {
      const f = await findProduct(decodeURIComponent(m[1])).catch(() => null)
      if (f) return [`${f.name} — Barira Handicrafts`, f.blurb]
    }
    return ['Barira Handicrafts', 'Manufacturer & Exporter of Premium Decor']
  }

  app.get('*', async (req, res) => {
    const [title, description] = await metaFor(req.path)
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${esc(description)}$2`)
    res.set('Cache-Control', 'no-cache').type('html').send(html)
  })
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('')
    console.log('   BARIRA HANDICRAFTS — server')
    console.log(`   listening · http://localhost:${PORT}`)
    console.log('')
  })
}

export default app
