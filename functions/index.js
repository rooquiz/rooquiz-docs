// Cloudflare Pages Function for the bare root path `/`.
//
// The site is statically exported with no Next.js middleware, so this edge
// function replaces what `nextra/locales` used to do for the root: pick a
// locale from the visitor's `Accept-Language` header and redirect to it.
// Falls back to English when nothing matches.
//
// Localized paths (`/zh/...`, `/en/...`) are plain static assets and are not
// touched by this function.

// Mirrors `LOCALES` in `lib/i18n.ts` — `scripts/check-locales.mjs` fails the
// build if the two drift.
const LOCALES = ['en', 'zh', 'zh-TW', 'de', 'es', 'pt-BR', 'fr', 'ja', 'ko']
const DEFAULT_LOCALE = 'en'

// Map one lowercased language tag to a docs locale, or null.
function matchLocale(tag) {
  const [base, ...subtags] = tag.split('-')
  if (base === 'zh') {
    // Traditional script or a Traditional-Chinese region -> zh-TW, else Simplified.
    const traditional = subtags.some((s) => s === 'hant' || s === 'tw' || s === 'hk' || s === 'mo')
    return traditional ? 'zh-TW' : 'zh'
  }
  // Only Brazilian Portuguese is translated; it is still closer than English.
  if (base === 'pt') return 'pt-BR'
  return LOCALES.includes(base) ? base : null
}

function pickLocale(acceptLanguage) {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.startsWith('q='))
      const weight = q ? parseFloat(q.slice(2)) : 1
      // A malformed q would make the sort comparator inconsistent; treat it as 0.
      return { tag: tag.toLowerCase(), q: Number.isFinite(weight) ? weight : 0 }
    })
    // q=0 means "not acceptable" — never redirect to a language the visitor rejected.
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const locale = matchLocale(tag)
    if (locale) return locale
  }
  return DEFAULT_LOCALE
}

export function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const locale = pickLocale(request.headers.get('accept-language'))
  return Response.redirect(new URL(`/${locale}`, url).toString(), 302)
}
