/**
 * Verify every /images/... reference in source and data resolves to a real
 * file on disk. Guards against a rename/convert pass leaving a dead link.
 *
 * Run: node scripts/check-image-refs.mjs
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOTS = ['client/src', 'client/index.html', 'server/data', 'data']
const IMG_ROOT = join('client', 'public', 'images')

const walk = (p) => {
  const s = statSync(p)
  return s.isDirectory() ? readdirSync(p).flatMap((n) => walk(join(p, n))) : [p]
}

const files = ROOTS.flatMap((r) => {
  try { return walk(r) } catch { return [] }
}).filter((f) => /\.(jsx?|html|json|css)$/i.test(f))

const RE = /["'`(]\/images\/([^"'`)]+?\.(?:png|jpe?g|webp))/gi

const found = new Set()
const missing = []

for (const f of files) {
  const txt = readFileSync(f, 'utf8')
  for (const m of txt.matchAll(RE)) {
    const rel = decodeURIComponent(m[1])
    if (existsSync(join(IMG_ROOT, rel))) found.add(rel)
    else missing.push({ rel, file: f })
  }
}

console.log(`  ✓ ${found.size} image reference(s) resolved`)
if (missing.length) {
  console.log(`  ✗ ${missing.length} broken reference(s):`)
  for (const m of missing) console.log(`      ${m.rel}   ← ${m.file}`)
  process.exit(1)
}
console.log('\nAll image references resolve.')
