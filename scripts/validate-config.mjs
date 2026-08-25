/**
 * Pre-build config validator.
 * Checks vercel.json for known bad patterns before the build runs.
 * Run: node scripts/validate-config.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let ok = true

function fail(msg) {
  console.error('  ✗ ' + msg)
  ok = false
}
function pass(msg) {
  console.log('  ✓ ' + msg)
}

// ── vercel.json ──────────────────────────────────────────────────────────
const vFile = join(root, 'vercel.json')
if (existsSync(vFile)) {
  let v
  try {
    v = JSON.parse(readFileSync(vFile, 'utf8'))
  } catch (e) {
    fail('vercel.json is not valid JSON: ' + e.message)
  }
  if (v) {
    // Vercel sets additionalProperties:false — comment keys (//) break deploys.
    const commentKeys = Object.keys(v).filter(k => k.startsWith('//'))
    if (commentKeys.length) fail(`vercel.json has comment keys (not allowed): ${commentKeys.join(', ')}`)
    else pass('vercel.json has no comment keys')

    if (v.version !== 2) fail('vercel.json: "version" must be 2')
    else pass('vercel.json version: 2')

    const KNOWN = new Set(['version', 'buildCommand', 'outputDirectory', 'installCommand', 'framework', 'rewrites', 'redirects', 'headers', 'cleanUrls', 'trailingSlash', 'regions', 'functions', 'crons', 'env', 'build', 'github', 'ignoreCommand'])
    const unknown = Object.keys(v).filter(k => !KNOWN.has(k))
    if (unknown.length) fail(`vercel.json has unknown top-level keys (will silently break deploy): ${unknown.join(', ')}`)
    else pass('vercel.json top-level keys are all known')
  }
} else {
  pass('vercel.json not found (not a Vercel project)')
}

// ── ENV check ────────────────────────────────────────────────────────────
const envFile = join(root, 'server', '.env')
if (existsSync(envFile)) {
  const env = readFileSync(envFile, 'utf8')
  if (env.includes('GITHUB_TOKEN=')) pass('server/.env has GITHUB_TOKEN')
  else fail('server/.env is missing GITHUB_TOKEN (publish will save locally only)')
} else {
  console.log('  · server/.env not found (using environment variables from host)')
}

console.log('')
if (!ok) {
  console.error('Config validation FAILED. Fix the issues above before deploying.')
  process.exit(1)
} else {
  console.log('Config validation passed.')
}
