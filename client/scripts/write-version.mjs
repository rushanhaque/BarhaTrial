import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let buildId
try {
  buildId = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  buildId = String(Date.now())
}

const out = join(__dirname, '..', 'dist', 'version.json')
writeFileSync(out, JSON.stringify({ buildId, builtAt: new Date().toISOString() }))
console.log(`  ✓ version.json written (buildId: ${buildId})`)
