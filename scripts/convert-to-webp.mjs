/**
 * Convert every static site image under client/public/images to WebP and
 * rewrite the references that point at them.
 *
 * WebP is ~60-70% smaller than PNG for photographic content at visually
 * equivalent quality. Every PNG in this directory was verified fully opaque,
 * so nothing depends on an alpha channel.
 *
 * Legacy .png/.jpeg URLs stay working via the fallback in server/index.js,
 * which matters because the live catalogue JSON on GitHub still references
 * the old extensions until an admin republishes.
 *
 * Run: node scripts/convert-to-webp.mjs [--dry]
 */
import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const DRY = process.argv.includes('--dry')
const ROOT = process.cwd()
const IMG_DIR = join(ROOT, 'client', 'public', 'images')
const QUALITY = 82
const MAX_DIM = 1600

// Files whose text may reference an image path.
const REF_GLOBS = [
  join(ROOT, 'client', 'src'),
  join(ROOT, 'client', 'index.html'),
  join(ROOT, 'server', 'data'),
  join(ROOT, 'data'),
]

function walk(p) {
  const s = statSync(p)
  if (!s.isDirectory()) return [p]
  return readdirSync(p).flatMap((n) => walk(join(p, n)))
}

// ── 1. Convert ────────────────────────────────────────────────────────────
const images = readdirSync(IMG_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f))
const renames = new Map() // "old.png" -> "old.webp"

let before = 0
let after = 0

for (const file of images) {
  const src = join(IMG_DIR, file)
  const outName = basename(file, extname(file)) + '.webp'
  const out = join(IMG_DIR, outName)

  const srcBuf = readFileSync(src)
  const sizeBefore = srcBuf.length

  const buf = await sharp(srcBuf)
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer()

  // A few already-tight JPEGs re-encode larger as WebP — keep those as-is.
  if (buf.length >= sizeBefore) {
    before += sizeBefore
    after += sizeBefore
    console.log(`  · ${file}  kept (WebP would be larger: ${(buf.length / 1024).toFixed(0)}KB vs ${(sizeBefore / 1024).toFixed(0)}KB)`)
    continue
  }

  before += sizeBefore
  after += buf.length
  renames.set(file, outName)

  console.log(`  ${DRY ? '·' : '✓'} ${file} → ${outName}  ${(sizeBefore / 1024).toFixed(0)}KB → ${(buf.length / 1024).toFixed(0)}KB`)

  if (!DRY) {
    writeFileSync(out, buf)
    unlinkSync(src)
  }
}

console.log(`\nImages: ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB (saved ${((1 - after / before) * 100).toFixed(0)}%)\n`)

// ── 2. Rewrite references ─────────────────────────────────────────────────
const refFiles = REF_GLOBS.flatMap((p) => {
  try { return walk(p) } catch { return [] }
}).filter((f) => /\.(jsx?|tsx?|html|json|css)$/i.test(f))

let touched = 0
for (const file of refFiles) {
  const original = readFileSync(file, 'utf8')
  let next = original
  for (const [oldName, newName] of renames) {
    if (next.includes(oldName)) next = next.split(oldName).join(newName)
  }
  if (next !== original) {
    if (!DRY) writeFileSync(file, next)
    touched++
    console.log(`  ${DRY ? '·' : '✓'} refs updated: ${file.replace(ROOT, '')}`)
  }
}

console.log(`\n${DRY ? '[dry run] would update' : 'Updated'} ${touched} file(s) with new image references.`)
if (DRY) console.log('No files were written. Re-run without --dry to apply.')
