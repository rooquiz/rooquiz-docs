#!/usr/bin/env node
/**
 * Fail the build when a page's meta description is missing, too short, or shared with another page.
 *
 * Why this exists: `app/[lang]/layout.tsx` carries a site-level description ("RooQuiz product
 * documentation"). A page without its own frontmatter `description` silently inherits it, so every
 * such page ends up with the same meta description — which is exactly what Bing Webmaster Tools
 * reported for 23 pages before every page got one of its own. A missing description is a one-line
 * omission that nothing else catches, so catch it here.
 *
 * Runs automatically as `prebuild`; run it directly with `pnpm check:descriptions`.
 */
import fs from 'node:fs'
import path from 'node:path'

/** Bing asks for 150-160 characters; below this its "too short" rule fires. */
const MIN_LENGTH = 150
const CONTENT_DIR = 'content'

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.name.endsWith('.mdx')) acc.push(full)
  }
  return acc
}

/**
 * Read the `description` scalar out of the frontmatter block.
 *
 * Deliberately not a full YAML parser — it only has to understand the three ways a description can
 * be written here: single-quoted (with '' escapes), double-quoted, or bare.
 */
function readDescription(source) {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatter) return null
  const body = frontmatter[1]
  const at = body.search(/^description:[ \t]*/m)
  if (at === -1) return null

  const rest = body.slice(at).replace(/^description:[ \t]*/, '')
  // In a single-quoted YAML scalar an apostrophe is written '' — scan pairs rather than stopping at
  // the first quote, otherwise "your team''s plan" reads as a 22-character description.
  if (rest.startsWith("'")) {
    let out = ''
    for (let i = 1; i < rest.length; i++) {
      if (rest[i] !== "'") {
        out += rest[i]
        continue
      }
      if (rest[i + 1] === "'") {
        out += "'"
        i++
        continue
      }
      return out
    }
    return null
  }
  if (rest.startsWith('"')) {
    let out = ''
    for (let i = 1; i < rest.length; i++) {
      if (rest[i] === '\\') {
        out += rest[i + 1] ?? ''
        i++
        continue
      }
      if (rest[i] === '"') return out
      out += rest[i]
    }
    return null
  }
  return rest.split('\n')[0].trim() || null
}

const files = walk(CONTENT_DIR).sort()
const seen = new Map()
const problems = []

for (const file of files) {
  const description = readDescription(fs.readFileSync(file, 'utf8'))
  if (!description) {
    problems.push(`${file}: no frontmatter description — it would inherit the site-wide one`)
    continue
  }
  const length = [...description].length
  if (length < MIN_LENGTH) {
    problems.push(`${file}: description is ${length} characters, needs at least ${MIN_LENGTH}`)
  }
  const previous = seen.get(description)
  if (previous) problems.push(`${file}: description is identical to ${previous}`)
  else seen.set(description, file)
}

if (problems.length > 0) {
  console.error(`\nMeta description check failed for ${problems.length} of ${files.length} pages:\n`)
  for (const problem of problems) console.error(`  - ${problem}`)
  console.error('\nEvery page needs its own description of 150+ characters (see README > IndexNow neighbours).\n')
  process.exit(1)
}

console.log(`[check-descriptions] ${files.length} pages, all with a unique description of ${MIN_LENGTH}+ characters`)
