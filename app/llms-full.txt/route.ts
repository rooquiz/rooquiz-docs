import { source } from '@/lib/source'
import { DEFAULT_LOCALE } from '@/lib/i18n'
import { pageToMarkdown } from '@/lib/llms'

// Static export: generated once at build time into `out/llms-full.txt`.
export const dynamic = 'force-static'

// `/llms-full.txt`: every English help center page as one Markdown file, so an AI
// assistant can load the whole help center in a single request.
export async function GET() {
  const pages = source.getPages(DEFAULT_LOCALE)
  const rendered = await Promise.all(pages.map(pageToMarkdown))

  return new Response(rendered.join('\n---\n\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
