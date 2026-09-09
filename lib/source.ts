import { defineDocs } from 'fumadocs-mdx/macro'
import { loader } from 'fumadocs-core/source'
import { pageSchema } from 'fumadocs-core/source/schema'
import { z } from 'zod'
import { i18n } from './i18n'

// Fumadocs uses one frontmatter field for both the page heading and the sidebar
// label. A handful of section overviews want them to differ — the sidebar reads
// "概览" under a "线索与转化" folder, while the page itself is headed "线索与转化" —
// so `sidebarTitle` overrides the label only, via the page tree transformer below.
const docSchema = pageSchema.extend({
  sidebarTitle: z.string().optional()
})

// Expanded at build time by the `macro` plugin configured in `next.config.mjs`.
// With `parser: 'dir'` the locale directory is stripped from the slug, so
// `content/zh/editor/logic.mdx` becomes locale `zh` + slug `['editor', 'logic']`.
const docs = defineDocs({
  dir: 'content',
  docs: { schema: docSchema }
})

// `baseUrl: '/'` + i18n yields `/zh` for a locale index and `/zh/editor/logic`
// for a page — the URL shape the site already publishes.
export const source = loader({
  i18n,
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      {
        file(node, filePath) {
          if (!filePath) return node
          const data = this.storage.read(filePath)?.data
          const sidebarTitle =
            data && 'sidebarTitle' in data ? (data.sidebarTitle as string | undefined) : undefined
          return sidebarTitle ? { ...node, name: sidebarTitle } : node
        }
      }
    ]
  }
})
