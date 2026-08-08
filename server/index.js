import express from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

import { products, productSummaries, findProduct } from './data/products.js'
import { journal } from './data/journal.js'
import { offices, milestones, people, factoryStats } from './data/factory.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5180

app.set('etag', false)
app.set('x-powered-by', false)
app.use(compression())
app.use(cors())
app.use(express.json())

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

// ── The Metalcraft Catalogue ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => ok(res, { house: 'Barira Handicrafts', status: 'open', version: '3.0' }))
app.get('/api/products', (_req, res) => ok(res, productSummaries))
app.get('/api/products/:slug', (req, res) => {
  const p = findProduct(req.params.slug)
  if (!p) return res.status(404).json({ ok: false, error: 'No such product.' })
  const related = productSummaries
    .filter((s) => s.slug !== p.slug && s.family === p.family)
    .slice(0, 3)
  // If not enough same family, just pick others
  if (related.length < 3) {
      related.push(...productSummaries.filter(s => s.slug !== p.slug && !related.find(r => r.slug === s.slug)).slice(0, 3 - related.length))
  }
  ok(res, { product: p, related })
})
app.get('/api/journal', (_req, res) => ok(res, journal))
app.get('/api/factory', (_req, res) => ok(res, { offices, milestones, people, factoryStats }))

// ── B2B Custom Manufacturing Engine ─────────────────────────────────────
app.post('/api/custom-manufacturing', (req, res) => {
  const { material = '', finish = '', category = '' } = req.body || {}
  
  const scores = Object.fromEntries(products.map((p) => [p.slug, 0]))
  const bump = (slugs, by) => (slugs || []).forEach((s) => { if (scores[s] != null) scores[s] += by })
  
  // Very rough heuristic matching for demo purposes
  products.forEach(p => {
    if (material && p.materials.primary.join(' ').toLowerCase().includes(material.toLowerCase())) scores[p.slug] += 3;
    if (finish && p.materials.finish.join(' ').toLowerCase().includes(finish.toLowerCase())) scores[p.slug] += 2;
    if (category && p.category.toLowerCase().includes(category.toLowerCase())) scores[p.slug] += 3;
  });

  const ranked = [...products].sort((a, b) => scores[b.slug] - scores[a.slug])
  const top = ranked[0]
  const alt = ranked.slice(1, 3).map((p) => productSummaries.find((s) => s.slug === p.slug))
  ok(res, {
    match: top,
    alternates: alt,
    rationale: `Based on your interest in ${material || 'custom metal'}, finished in ${finish || 'our signature style'}, we recommend exploring the ${top.name} as a starting point for your custom order.`,
  })
})

// ── Correspondence & orders (demo: validate & echo, persist nothing) ──
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

// ── SEO: robots + sitemap ─────────────────────────────────────────────
const baseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`
const ROUTES = ['/', '/catalogue', '/about', '/custom-orders', '/trade-fairs', '/blog', '/contact']

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl(req)}/sitemap.xml\n`)
})
app.get('/sitemap.xml', (req, res) => {
  const b = baseUrl(req)
  const urls = [...ROUTES, ...products.map((p) => `/product/${p.slug}`)]
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${b}${u}</loc><changefreq>monthly</changefreq></url>`).join('\n') +
    `\n</urlset>\n`
  res.type('application/xml').send(body)
})

// ── Serve the built client in production (with per-route SEO meta) ─────
const dist = path.join(__dirname, '..', 'client', 'dist')
if (fs.existsSync(dist)) {
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
  const metaFor = (p) => {
    if (SEO[p]) return SEO[p]
    const m = p.match(/^\/product\/(.+)$/)
    if (m) {
      const f = findProduct(decodeURIComponent(m[1]))
      if (f) return [`${f.name} — Barira Handicrafts`, f.blurb]
    }
    return ['Barira Handicrafts', 'Manufacturer & Exporter of Premium Decor']
  }

  app.get('*', (req, res) => {
    const [title, description] = metaFor(req.path)
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

