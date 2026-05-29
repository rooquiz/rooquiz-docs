// Cloudflare Pages Function for the bare root path `/`.
//
// The site is statically exported with no Next.js middleware, so this edge
// function replaces what `nextra/locales` used to do for the root: pick a
// locale from the visitor's `Accept-Language` header and redirect to it.
// Falls back to English when nothing matches.
//
// Localized paths (`/zh/...`, `/en/...`) are plain static assets and are not
// touched by this function.

const LOCALES = ['en', 'zh']
const DEFAULT_LOCALE = 'en'

function pickLocale(acceptLanguage) {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.startsWith('q='))
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q.slice(2)) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    // Match by primary subtag, e.g. `zh-CN` / `zh-Hant` -> `zh`.
    const base = tag.split('-')[0]
    if (LOCALES.includes(base)) return base
  }
  return DEFAULT_LOCALE
}

export function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const locale = pickLocale(request.headers.get('accept-language'))
  return Response.redirect(new URL(`/${locale}`, url).toString(), 302)
}
