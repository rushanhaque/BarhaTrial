/**
 * Compress every image under client/public/images and client/public in place.
 * Keeps the same filename/extension (so no source references change), but
 * re-encodes at a sane max dimension + quality so the site stops shipping
 * near-lossless 900KB PNGs for what are effectively web thumbnails/photos.
 *
 * Run: node scripts/optimize-images.mjs
 */
import sharp from 'sharp'
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const DIR = join(process.cwd(), 'client', 'public', 'images')
const MAX_DIM = 1600
const JPEG_Q = 78
const PNG_Q = 78
const WEBP_Q = 80

let totalBefore = 0
let totalAfter = 0
let count = 0

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    const s = statSync(p)
    return s.isDirectory() ? walk(p) : [p]
  })
}

const files = walk(DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))

for (const file of files) {
  const before = statSync(file).size
  const ext = extname(file).toLowerCase()
  // Read fully into memory first — sharp holding a native handle on `file`
  // while we later write to the same path causes a sharing-violation on Windows.
  const srcBuf = readFileSync(file)
  const decoded = await sharp(srcBuf)
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .toBuffer()

  const img = sharp(decoded)
  const buf = ext === '.png'
    ? await img.png({ quality: PNG_Q, compressionLevel: 9, palette: true }).toBuffer()
    : ext === '.webp'
      ? await img.webp({ quality: WEBP_Q }).toBuffer()
      : await img.jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer()

  const after = buf.length
  if (after < before) {
    // Windows/AV can transiently lock a just-read file handle; retry a couple times.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        writeFileSync(file, buf)
        break
      } catch (e) {
        if (attempt === 4) throw e
        await sleep(150)
      }
    }
    totalBefore += before
    totalAfter += after
    count++
    console.log(`  ✓ ${file.replace(process.cwd(), '')}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`)
  } else {
    console.log(`  · ${file.replace(process.cwd(), '')}  already optimal, skipped`)
  }
}

console.log(`\nOptimized ${count}/${files.length} images.`)
console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (saved ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`)
