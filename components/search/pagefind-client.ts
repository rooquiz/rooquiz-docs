import type { SortedResult } from 'fumadocs-core/search'
import type { SearchClient } from 'fumadocs-core/search/client'

// Minimal shape of the bits of the Pagefind JS API we use.
// https://pagefind.app/docs/api/
interface PagefindSubResult {
  title: string
  url: string
  excerpt: string
}

interface PagefindDocument {
  url: string
  excerpt: string
  meta: { title?: string }
  sub_results: PagefindSubResult[]
}

interface PagefindModule {
  options: (options: Record<string, unknown>) => Promise<void>
  init: () => Promise<void>
  search: (query: string) => Promise<{
    results: { id: string; data: () => Promise<PagefindDocument> }[]
  }>
}

/** How many matching sections of a single page to list. */
const MAX_SUB_RESULTS = 5

// The index only exists after `pnpm build` runs Pagefind over `out/`, so this path
// cannot be resolved at bundle time. Keep the specifier non-literal (and tell
// webpack to leave it alone) so it stays a real runtime import.
const PAGEFIND_URL = '/_pagefind/pagefind.js'

let modulePromise: Promise<PagefindModule> | undefined
// Pagefind is a singleton holding one loaded language at a time, so switching
// locale means re-initializing it. `pending` serializes that against in-flight
// searches — otherwise a locale switch mid-query reads the wrong index.
let pending: Promise<unknown> = Promise.resolve()
let loadedLocale: string | undefined

function loadModule(): Promise<PagefindModule> {
  modulePromise ??= (async () => {
    const url = PAGEFIND_URL
    const pagefind: PagefindModule = await import(/* webpackIgnore: true */ url)
    await pagefind.options({ baseUrl: '/' })
    return pagefind
  })()
  return modulePromise
}

function withPagefind<T>(locale: string, fn: (pagefind: PagefindModule) => Promise<T>): Promise<T> {
  const run = pending.then(async () => {
    const pagefind = await loadModule()
    // `init()` picks the per-language index from `<html lang>` — the locale layout
    // sets it, and Next updates it on a client-side locale switch. Re-init when our
    // locale changes so the switch actually swaps the index. (Pagefind's `init`
    // takes an override argument, but it does not reliably select the index, so
    // this mirrors what the site did before the migration.)
    if (loadedLocale !== locale) {
      await pagefind.init()
      loadedLocale = locale
    }
    return fn(pagefind)
  })
  // Keep the queue alive even if this call rejects.
  pending = run.catch(() => undefined)
  return run
}

// Pagefind derives result URLs from the exported file paths, so they carry the
// `.html` suffix of the static export. The site's real URLs never do.
function normalizeUrl(url: string): string {
  const [path, hash] = url.split('#')
  const clean = path.replace(/(?:\/index)?\.html$/, '').replace(/\/$/, '') || '/'
  return hash ? `${clean}#${hash}` : clean
}

function toResults(id: string, doc: PagefindDocument): SortedResult[] {
  const url = normalizeUrl(doc.url)
  const out: SortedResult[] = [
    {
      id,
      url,
      type: 'page',
      content: doc.meta.title ?? url
    }
  ]

  const sections = doc.sub_results.filter((sub) => sub.url.includes('#')).slice(0, MAX_SUB_RESULTS)

  if (sections.length === 0) {
    out.push({ id: `${id}:excerpt`, url, type: 'text', content: doc.excerpt })
    return out
  }

  for (const sub of sections) {
    const subUrl = normalizeUrl(sub.url)
    out.push({ id: `${id}:${subUrl}`, url: subUrl, type: 'heading', content: sub.title })
    out.push({ id: `${id}:${subUrl}:text`, url: subUrl, type: 'text', content: sub.excerpt })
  }

  return out
}

/**
 * A `SearchClient` backed by Pagefind, so Fumadocs' search UI queries the same
 * per-language index the site already ships instead of downloading a whole
 * client-side database.
 *
 * `useDocsSearch` debounces on our behalf, hence plain `search()` rather than
 * Pagefind's own `debouncedSearch()` (which resolves to `null` when superseded).
 */
export function pagefindClient(locale: string): SearchClient {
  return {
    deps: [locale],
    search(query) {
      return withPagefind(locale, async (pagefind) => {
        const { results } = await pagefind.search(query)
        const docs = await Promise.all(results.map(async (r) => toResults(r.id, await r.data())))
        return docs.flat()
      })
    }
  }
}
