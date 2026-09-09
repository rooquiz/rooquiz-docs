import { createMDX } from 'fumadocs-mdx/next'

// `macro.include` tells the bundler plugin which files call `defineDocs()` from
// `fumadocs-mdx/macro`. The macro is expanded at build time, so there is no
// `source.config.ts` and no generated `.source/` directory to keep in sync.
const withMDX = createMDX({
  macro: { include: ['./lib/source.ts'] }
})

// `output: 'export'` produces a fully static site under `out/` for Cloudflare Pages.
// Locale routing lives in the `[lang]` segment + `generateStaticParams`, not in
// middleware — static export has no middleware. The bare root `/` is handled at the
// edge by `functions/index.js`.
export default withMDX({
  output: 'export',
  images: {
    unoptimized: true
  }
})
