import { source } from './source'
import { DEFAULT_LOCALE } from './i18n'
import { SITE_URL } from './site-url'

type DocPage = NonNullable<ReturnType<typeof source.getPage>>

/** Slug segments of a page, with the locale index normalised to [] */
function segmentsOf(page: DocPage): string[] {
  return page.slugs.filter(Boolean)
}

/** Public URL of a page's HTML version, e.g. https://docs.rooquiz.com/en/editor/logic */
export function htmlUrl(page: DocPage): string {
  return [SITE_URL, page.locale ?? DEFAULT_LOCALE, ...segmentsOf(page)].join('/')
}

/**
 * Path of a page's Markdown version. The site is a static export on Cloudflare Pages,
 * which cannot rewrite `<page>.md` onto another file, so the Markdown files live under
 * their own `/md/` tree: `/md/en/editor/logic.md`, and `/md/en/index.md` for a locale index.
 */
export function markdownPath(locale: string, segments: string[]): string {
  const parts = segments.length > 0 ? segments : ['index']
  return `/md/${[locale, ...parts].join('/')}.md`
}

export function markdownUrl(page: DocPage): string {
  return `${SITE_URL}${markdownPath(page.locale ?? DEFAULT_LOCALE, segmentsOf(page))}`
}

/**
 * Make the processed Markdown stand on its own: site-relative links become absolute
 * (the file is read outside the site, and concatenated into /llms-full.txt), and the
 * stringifier's `&#x2A;` escape for a literal asterisk before bold text is undone.
 */
export function cleanMarkdown(markdown: string): string {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, (_match, path: string) => `](${SITE_URL}${path})`).replace(/&#x2A;/g, '*')
}

/** One page as standalone Markdown: title, source URL, description, then the body */
export async function pageToMarkdown(page: DocPage): Promise<string> {
  const body = cleanMarkdown(await page.data.getText('processed'))
  const description = page.data.description ? `\n\n> ${page.data.description}` : ''
  return `# ${page.data.title}\n\nSource: ${htmlUrl(page)}${description}\n\n${body.trim()}\n`
}
