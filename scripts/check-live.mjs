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
// Legacy image extensions must resolve to their WebP sibling, not to the SPA
// shell — an HTML body here means the rewrite is missing and old image URLs
// (bookmarks, search results, un-republished catalogues) render as broken.
{
  const r = await fetch(`${BASE}/images/brass_tray.png`, { redirect: 'follow' }).catch(() => null)
  const ct = r?.headers.get('content-type') || ''
  const good = !!r?.ok && ct.startsWith('image/')
  console.log(`  ${good ? '✓' : '✗'} [${r?.status ?? 'ERR'}] Legacy .png → .webp fallback`)
  if (!good) console.log(`       Expected an image, got Content-Type: ${ct || '(none)'}`)
}
await check('robots.txt', `${BASE}/robots.txt`)
await check('sitemap.xml', `${BASE}/sitemap.xml`)
await check('Publish endpoint (no auth — expect 401)', `${BASE}/api/admin/publish`, {
  method: 'POST',
  expectStatus: 401,
})

console.log('\nNote: publish is fail-closed. 401 = secret configured and enforced (correct).')
console.log('      503 = ADMIN_PUBLISH_SECRET missing while GITHUB_TOKEN is set — publishing')
console.log('      is disabled until you set the secret in the host env vars.')
console.log('\nDone.\n')
