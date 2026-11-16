import { source } from '@/lib/source'
import { LOCALES } from '@/lib/i18n'
import { markdownPath, pageToMarkdown } from '@/lib/llms'

// Static export: one Markdown file per page and locale, written to `out/md/<lang>/<slug>.md`.
export const dynamic = 'force-static'
export const dynamicParams = false

type Params = { lang: string; slug: string[] }

// The last segment carries the `.md` extension so the exported file is named `<slug>.md`
// and Cloudflare Pages serves it as Markdown. A locale index becomes `index.md`.
export function generateStaticParams(): Params[] {
  return source
    .generateParams('slug', 'lang')
    .filter(({ lang }) => (LOCALES as readonly string[]).includes(lang))
    .map(({ lang, slug }) => {
      const segments = markdownPath(lang, (slug ?? []).filter(Boolean)).split('/').slice(3)
      return { lang, slug: segments }
    })
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
  const { lang, slug } = await props.params
  const segments = slug.map((part, i) => (i === slug.length - 1 ? part.replace(/\.md$/, '') : part))
  const page = source.getPage(segments.length === 1 && segments[0] === 'index' ? [] : segments, lang)
  if (!page) return new Response('Not Found', { status: 404 })

  return new Response(await pageToMarkdown(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
