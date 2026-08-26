/**
 * Unit test for the vercel.json route-source validator.
 * Run: node scripts/test-validate-config.mjs
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Re-create the checker from validate-config.mjs by evaluating its definition,
// so the test exercises the real implementation rather than a copy.
const src = readFileSync(join(root, 'scripts', 'validate-config.mjs'), 'utf8')
const m = src.match(/const badQuantifier = \(src\) => \{[\s\S]*?\n    \}/)
if (!m) {
  console.error('  ✗ could not extract badQuantifier from validate-config.mjs')
  process.exit(1)
}
const badQuantifier = eval(`(${m[0].replace('const badQuantifier = ', '')})`)

const cases = [
  // [pattern, shouldBeFlagged, why]
  ['/images/(.*)\\.jpe?g', true, '"?" on the literal "e" — the real bug that blocked deploys'],
  ['/foo/bar+', true, '"+" on a literal'],
  ['/images/(.*)\\.png', false, 'plain escaped literal, no quantifier'],
  ['/images/(.*)\\.jpg', false, 'plain escaped literal'],
  ['/api/(.*)', false, 'unnamed group'],
  ['/((?!api/|robots\\.txt|sitemap\\.xml).*)', false, 'regex lookahead "(?!" is legal'],
  ['/admin(.*)', false, 'group after literal'],
  ['/blog/:slug?', false, 'optional named param is legal'],
  ['/files/:path+', false, 'repeating named param is legal'],
  ['/(.*)?', false, 'quantifier after a group is legal'],
  ['/version.json', false, 'plain path'],
]

let failures = 0
for (const [pattern, shouldFlag, why] of cases) {
  const flagged = badQuantifier(pattern) !== null
  const ok = flagged === shouldFlag
  if (!ok) failures++
  console.log(`  ${ok ? '✓' : '✗'} ${shouldFlag ? 'reject' : 'accept '} ${JSON.stringify(pattern)}  — ${why}`)
  if (!ok) console.log(`      expected flagged=${shouldFlag}, got ${flagged}`)
}

// The live config must itself be clean.
const v = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
for (const key of ['rewrites', 'redirects', 'headers']) {
  for (const [i, r] of (v[key] || []).entries()) {
    const bad = badQuantifier(r.source)
    if (bad) {
      failures++
      console.log(`  ✗ live vercel.json ${key}[${i}] is invalid: ${r.source}`)
    }
  }
}

console.log('')
if (failures) {
  console.error(`${failures} test(s) failed.`)
  process.exit(1)
}
console.log(`All ${cases.length} validator tests passed, and live vercel.json is clean.`)
