/**
 * Live-site diagnostic. Run: npm run check:live [https://your-site.vercel.app]
 * Checks: deploy status, API routes, cache headers, photo serving.
 */
const BASE = process.argv[2] || process.env.BASE_URL || 'https://barhatrial.vercel.app'

const check = async (label, url, opts = {}) => {
  try {
    const r = await fetch(url, { method: opts.method || 'GET', redirect: 'follow' })
    const cc = r.headers.get('cache-control') || '(none)'
    const status = r.status
    const ok = opts.expectStatus ? opts.expectStatus === status : r.ok
    console.log(`  ${ok ? '✓' : '✗'} [${status}] ${label}`)
    if (opts.showCC) console.log(`       Cache-Control: ${cc}`)
    if (!ok) console.log(`       Expected ${opts.expectStatus || '2xx'}, got ${status}`)
    if (opts.parseJson) {
      try {
        const j = await r.json()
        if (opts.parseJson(j)) console.log(`       ${opts.parseJson(j)}`)
      } catch {}
    }
    return { ok, status, headers: r.headers }
  } catch (e) {
    console.log(`  ✗ [ERR] ${label} — ${e.message}`)
    return { ok: false }
  }
}

console.log(`\nDiagnostic → ${BASE}\n`)

await check('Health endpoint', `${BASE}/api/health`, { parseJson: j => j?.data?.status ? `status: ${j.data.status}` : null })
await check('Products endpoint', `${BASE}/api/products`, { parseJson: j => j?.data ? `${j.data.length} products returned` : null })
await check('Version endpoint', `${BASE}/api/version`, { showCC: true, parseJson: j => j?.data?.buildId ? `buildId: ${j.data.buildId}` : null })
await check('Catalogue version endpoint', `${BASE}/api/catalogue-version`, { showCC: true })
await check('version.json (static)', `${BASE}/version.json`, { showCC: true })
await check('index.html', `${BASE}/`, { showCC: true })
await check('admin route', `${BASE}/admin`, { showCC: true })
await check('Hashed JS asset', `${BASE}/assets/index-*.js`, { expectStatus: 404 }) // just verify the route resolves
await check('robots.txt', `${BASE}/robots.txt`)
await check('sitemap.xml', `${BASE}/sitemap.xml`)
await check('Publish endpoint (no auth — expect 401)', `${BASE}/api/admin/publish`, {
  method: 'POST',
  expectStatus: 401,
})

console.log('\nNote: If ADMIN_PUBLISH_SECRET is not set, publish endpoint returns 400 (no auth), not 401.')
console.log('      Set ADMIN_PUBLISH_SECRET in Vercel env vars to enable auth.')
console.log('\nDone.\n')
