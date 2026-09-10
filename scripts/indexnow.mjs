#!/usr/bin/env node
/**
 * Submit the pages that actually changed in this build to IndexNow
 * (one endpoint shared by Bing, Yandex, Seznam and Naver).
 *
 * Why only the changed ones: IndexNow treats repeatedly re-submitting unchanged URLs as abuse,
 * and every push to main redeploys all 108 pages. So we hash each page's exported HTML and
 * compare it with the snapshot from the last successful submission, then submit the diff.
 *
 * The snapshot is carried between runs by actions/cache (see .github/workflows/deploy.yml).
 * With no snapshot (first run, expired cache) it falls back to submitting everything once,
 * which is a legitimate IndexNow use.
 *
 * Usage:
 *   node scripts/indexnow.mjs <sitemap.xml> <out dir> [--state <snapshot>] [--all] [--dry-run]
 *
 * Exits 1 on failure so the CI step turns yellow; the snapshot is not written in that case,
 * so the next deploy retries the same URLs.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/** IndexNow ownership token. Must match public/<KEY>.txt byte for byte. */
const KEY = 'd7f6fee5fbda0ed6d958b64243f50d12'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
/** The protocol caps a request at 10000 URLs; leave some headroom. */
const BATCH_SIZE = 5000

const [, , sitemapPath, outDir] = process.argv
const stateIdx = process.argv.indexOf('--state')
const statePath = stateIdx === -1 ? null : process.argv[stateIdx + 1]
const submitAll = process.argv.includes('--all')
const dryRun = process.argv.includes('--dry-run')

if (!sitemapPath || !outDir) {
  console.error('usage: node scripts/indexnow.mjs <sitemap.xml> <out dir> [--state <snapshot>] [--all] [--dry-run]')
  process.exit(1)
}

/** Sitemap URL -> exported HTML file. Returns null when the page is not in this build. */
function resolveFile(pathname) {
  const clean = pathname.replace(/\/+$/, '')
  const candidates = clean === '' ? ['index.html'] : [`${clean}.html`, `${clean}/index.html`]
  for (const rel of candidates) {
    const file = path.join(outDir, rel)
    if (fs.existsSync(file)) return file
  }
  return null
}

/**
 * Hash of the page's content.
 *
 * `/_next/static/...` references are stripped first: those filenames carry chunk hashes, so a
 * one-line CSS change rewrites every page and every deploy would look like "all 108 URLs changed"
 * — re-submitting the same URLs over and over is exactly what IndexNow calls abuse. Without them
 * the hash only moves when the copy, headings or metadata actually move.
 */
function hashFile(file) {
  const normalized = fs.readFileSync(file, 'utf8').replace(/\/_next\/static\/[^"']+/g, '')
  return crypto.createHash('sha1').update(normalized).digest('hex')
}

async function submit(host, urls) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/${KEY}.txt`, urlList: urls }),
  })
  // 200 = accepted and will be crawled; 202 = accepted, key not verified yet (normal right after
  // the key file first goes live) — both are fine, anything else is a real failure.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow returned ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 300)}`)
  }
  return res.status
}

// The key file has to ship with this build or every submission is rejected. Check it first so the
// error points at the real cause.
const keyFile = path.join(outDir, `${KEY}.txt`)
if (!fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf8').trim() !== KEY) {
  console.error(`[indexnow] key file ${KEY}.txt missing from the build (or its content differs) — check public/${KEY}.txt`)
  process.exit(1)
}

const xml = fs.readFileSync(sitemapPath, 'utf8')
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
if (urls.length === 0) {
  console.error(`[indexnow] no <loc> entries in ${sitemapPath} — the build is probably broken`)
  process.exit(1)
}

const previous = statePath && fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : null
const current = {}
const changed = []
let unresolved = 0

for (const url of urls) {
  const file = resolveFile(new URL(url).pathname)
  if (!file) {
    unresolved++
    continue
  }
  const hash = hashFile(file)
  current[url] = hash
  if (submitAll || !previous || previous[url] !== hash) changed.push(url)
}

const host = new URL(urls[0]).host
console.log(
  `[indexnow] ${urls.length} sitemap URLs, ${unresolved} not found in the build, ` +
    `${changed.length} ${previous ? 'changed since the last run' : 'to submit (no snapshot, full run)'}`
)

if (changed.length === 0) {
  console.log('[indexnow] nothing to submit')
  process.exit(0)
}

if (dryRun) {
  console.log(changed.slice(0, 20).join('\n'))
  process.exit(0)
}

for (let i = 0; i < changed.length; i += BATCH_SIZE) {
  const batch = changed.slice(i, i + BATCH_SIZE)
  const status = await submit(host, batch)
  console.log(`[indexnow] submitted ${batch.length} URLs (HTTP ${status})`)
}

// Only write the snapshot after a successful submission: URLs that never made it must not be
// recorded as submitted.
if (statePath) {
  fs.writeFileSync(statePath, JSON.stringify(current))
  console.log(`[indexnow] snapshot written to ${statePath} (${Object.keys(current).length} URLs)`)
}
