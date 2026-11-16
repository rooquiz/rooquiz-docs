import { llms } from 'fumadocs-core/source'
import { source } from '@/lib/source'
import { DEFAULT_LOCALE } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site-url'
import { cleanMarkdown } from '@/lib/llms'

// Static export: generated once at build time into `out/llms.txt`.
export const dynamic = 'force-static'

// The product summary is the brand's canonical one-liner. It mirrors `BRAND_SUMMARY`
// in rooquiz-web (packages/core/src/lib/brandFacts.ts) — keep the two identical.
const PRODUCT_SUMMARY =
  'RooQuiz is a lightweight quiz and assessment builder for coaches, marketers, creators, and schools. Build interactive quizzes from ready-made templates (or with your own AI assistant over MCP), share them anywhere, and turn results into leads and shareable moments.'

// `/llms.txt`: a map of the help center for AI assistants (llmstxt.org). The page index
// comes from the same page tree as the sidebar, so a new page is listed automatically.
export function GET() {
  // Drop the generator's own top-level heading (this file has one) and make links absolute
  const index = cleanMarkdown(llms(source).index(DEFAULT_LOCALE).replace(/^# .*\n+/, ''))

  const body = `# RooQuiz Help Center

> ${PRODUCT_SUMMARY}

This is the official help center: how to build, score, publish, and analyze quizzes in RooQuiz, plus account, team, and developer topics. Product overview, pricing, and brand facts live on the main site: https://rooquiz.com/llms.txt

## Machine-readable versions
- [Full help center as one file](${SITE_URL}/llms-full.txt): every English page as Markdown
- Every page also has a Markdown version under /md/: ${SITE_URL}/en/editor/logic → ${SITE_URL}/md/en/editor/logic.md
- The help center is also published in Chinese (Simplified and Traditional), German, Spanish, Portuguese (Brazil), French, Japanese, and Korean; swap the locale segment (en → zh, zh-TW, de, es, pt-BR, fr, ja, ko).

## Pages (English)
${index}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
