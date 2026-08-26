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

    // Route `source` patterns are path-to-regexp, NOT raw regex. An invalid
    // pattern makes Vercel refuse the deploy outright — no deployment record,
    // no build log, the site simply never updates. Catch it here instead.
    //
    // The trap: regex quantifiers (? + *) applied to a literal character are
    // rejected, because those characters are path-to-regexp modifiers that
    // must follow a parameter or group. e.g. "\\.jpe?g" is invalid; use two
    // separate rules for .jpg and .jpeg.
    // A "?" or "+" is only legal after a group ")", after a ":param", or as
    // part of a regex group opener "(?". Anywhere else it is being applied to
    // a literal character, which Vercel rejects.
    const badQuantifier = (src) => {
      for (let i = 0; i < src.length; i++) {
        const c = src[i]
        if (c !== '?' && c !== '+') continue
        if (i > 0 && src[i - 1] === '\\') continue // escaped literal
        const prev = src[i - 1]
        if (prev === ')' || prev === '(') continue // group modifier / "(?" opener
        // walk back over word chars; legal only if we land on a ":" param marker
        let j = i - 1
        while (j >= 0 && /[A-Za-z0-9_]/.test(src[j])) j--
        if (j >= 0 && src[j] === ':' && j < i - 1) continue // :param? / :param+
        return src[i]
      }
      return null
    }
    let routeErrors = 0
    for (const [key, list] of [['rewrites', v.rewrites], ['redirects', v.redirects], ['headers', v.headers]]) {
      if (!Array.isArray(list)) continue
      list.forEach((r, i) => {
        const src = r?.source
        if (typeof src !== 'string' || !src.startsWith('/')) {
          fail(`vercel.json ${key}[${i}]: "source" must be a string starting with "/"`)
          routeErrors++
          return
        }
        const bad = badQuantifier(src)
        if (bad) {
          fail(`vercel.json ${key}[${i}]: invalid source pattern ${JSON.stringify(src)} — the "${bad}" quantifier is applied to a literal character, which Vercel rejects (it refuses the whole deploy silently). Split it into separate rules.`)
          routeErrors++
        }
        try {
          new RegExp(src)
        } catch (e) {
          fail(`vercel.json ${key}[${i}]: source ${JSON.stringify(src)} is not parseable — ${e.message}`)
          routeErrors++
        }
      })
    }
    if (!routeErrors) pass('vercel.json route source patterns look valid')
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
