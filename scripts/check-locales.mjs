#!/usr/bin/env node
/**
 * Fail the build when the locale trees drift apart.
 *
 * Why this exists: `fallbackLanguage` is `null` (see `lib/i18n.ts`), so a page missing from one
 * locale 404s there, and its hreflang cluster silently shrinks. Nine trees maintained by hand drift
 * easily, so every locale must hold exactly the files `content/en` holds. Internal links must also
 * stay inside their own locale — a translated page linking to `/en/...` sends readers back to
 * English. Finally, `functions/index.js` keeps its own copy of the locale list because it runs at
 * the edge and cannot import `lib/i18n.ts`; the two must match.
 *
 * Runs automatically as `prebuild`; run it directly with `pnpm check:locales`.
 */
import fs from 'node:fs'
import path from 'node:path'

const CONTENT_DIR = 'content'
const SOURCE_LOCALE = 'en'

function readLocaleList(file, pattern) {
  const match = fs.readFileSync(file, 'utf8').match(pattern)
  if (!match) throw new Error(`Could not find the locale list in ${file}`)
  const list = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
  // An empty list would make every check below pass vacuously.
  if (list.length === 0) throw new Error(`Parsed an empty locale list from ${file}`)
  return list
}

function walk(dir, root = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, root, acc)
    else if (entry.name.endsWith('.mdx') || entry.name === 'meta.json') acc.push(path.relative(root, full))
  }
  return acc
}

const locales = readLocaleList('lib/i18n.ts', /export const LOCALES = \[([^\]]*)\]/)
const edgeLocales = readLocaleList('functions/index.js', /const LOCALES = \[([^\]]*)\]/)
const errors = []

if (locales.join() !== edgeLocales.join()) {
  errors.push(
    `functions/index.js lists [${edgeLocales.join(', ')}] but lib/i18n.ts lists [${locales.join(', ')}]`
  )
}

const expected = new Set(walk(path.join(CONTENT_DIR, SOURCE_LOCALE)))
// A link target that starts with a locale segment: markdown `](/en/...)`, a reference definition
// `[x]: /en/...`, a JSX `href="/en..."` or `href={'/en...'}`, or an absolute docs-site URL.
const linkPattern = new RegExp(
  `(?:\\]\\(|^\\[[^\\]]+\\]:[ \\t]*|href=\\{?["'\`]|https?://docs\\.rooquiz\\.com)/(${locales.join('|')})(?=[/)"'\`#\\s]|$)`,
  'gm'
)

for (const locale of locales) {
  const dir = path.join(CONTENT_DIR, locale)
  if (!fs.existsSync(dir)) {
    errors.push(`${dir}/ is missing`)
    continue
  }
  const actual = new Set(walk(dir))
  for (const file of expected) if (!actual.has(file)) errors.push(`${path.join(dir, file)}: missing`)
  for (const file of actual) {
    if (!expected.has(file)) errors.push(`${path.join(dir, file)}: not in ${CONTENT_DIR}/${SOURCE_LOCALE}`)
    if (!file.endsWith('.mdx')) continue
    const source = fs.readFileSync(path.join(dir, file), 'utf8')
    for (const [, target] of source.matchAll(linkPattern)) {
      if (target !== locale) errors.push(`${path.join(dir, file)}: links to /${target}/`)
    }
  }
}

if (errors.length > 0) {
  console.error(`check-locales: ${errors.length} problem(s)\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log(`check-locales: ${locales.length} locales × ${expected.size} files, all in sync`)
