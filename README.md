# RooQuiz Docs

Source for the RooQuiz product documentation site — written for creators who build and manage quizzes, assessments and surveys in the RooQuiz dashboard.

Built with [Nextra 4](https://nextra.site) on Next.js (App Router), exported as a fully static site and deployed to Cloudflare Pages.

## Requirements

- Node.js 22+
- pnpm 11 (pinned via `packageManager` in `package.json`; run `corepack enable` to pick it up automatically)

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000 — open /en or /zh
```

The bare root path `/` only works in a deployed/preview build (see [Locales](#locales)); in `pnpm dev` go straight to `/en` or `/zh`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server with hot reload |
| `pnpm build` | Static export into `out/`, then builds the Pagefind search index into `out/_pagefind` (`postbuild`) |
| `pnpm preview` | Serves the built `out/` through `wrangler pages dev` — the closest match to production, including the root-redirect Function |
| `pnpm deploy` | Manual `wrangler pages deploy out` (CI normally does this) |

Search is powered by [Pagefind](https://pagefind.app) and only exists after a build, so search will be empty in `pnpm dev`.

## Project structure

```
app/[lang]/            Next.js App Router shell — layout (navbar, footer, i18n, theme
                       strings) and the catch-all page that renders MDX
content/{en,zh}/       All documentation content, one mirrored tree per locale
functions/index.js     Cloudflare Pages Function: redirects `/` to `/en` or `/zh`
public/img/{en,zh}/    Screenshots, one folder per docs section, `.webp`
mdx-components.js      MDX component overrides on top of nextra-theme-docs
next.config.mjs        Nextra + `output: 'export'` + locale list
```

## Writing docs

Content lives in `content/<locale>/<section>/<page>.mdx`. **The `en` and `zh` trees mirror each other** — every page added to one should be added to the other with the same filename, so the navbar locale switcher lands on the matching page.

A page starts with frontmatter and may import Nextra components:

```mdx
---
title: Conditional Logic
---

import { Callout, Steps } from 'nextra/components'

# Conditional Logic
```

`Callout`, `Steps`, `Cards` and `Tabs` from `nextra/components` are the components used throughout.

### Sidebar order and titles

Each directory has a `_meta.js` that controls both the order and the display title of its pages, per locale. Add new pages there — the key is the filename without extension:

```js
export default {
  index: 'Editor Overview',
  'question-types': 'Question Types',
  logic: 'Conditional Logic'
}
```

The top-level `content/<locale>/_meta.js` also defines the sidebar section separators.

### Links

Internal links must include the locale prefix, e.g. `/en/getting-started/account` or `/zh/getting-started/account`. The site is statically exported with no middleware, so there is nothing to rewrite locale-less links at request time — they would 404.

### Images

Put screenshots in `public/img/<locale>/<section>/<name>.webp` and reference them absolutely:

```mdx
![RooQuiz dashboard](/img/en/getting-started/dashboard.webp)
```

Localized screenshots (UI in the matching language) go in the matching locale folder.

## Locales

Locales are `en` (default) and `zh`, listed in `next.config.mjs` and rendered through the `app/[lang]` segment with `generateStaticParams` — not middleware, which static export does not support.

Two details follow from that:

- `unstable_shouldAddLocaleToLinks` bakes the locale prefix into every page-map link.
- The bare root `/` is handled by `functions/index.js`, a Cloudflare Pages Function that picks a locale from the visitor's `Accept-Language` header and redirects. It runs in `pnpm preview` and in production, but not in `pnpm dev`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys `out/` to the `rooquiz-docs` Cloudflare Pages project. The workflow can also be run manually from the Actions tab, and needs these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Dependency pins

`pnpm-workspace.yaml` pins two transitive dependencies to work around upstream breakage — `zod` (4.4.x broke Nextra's schema validation) and `style-to-js` (1.x crashes the Nextra loader on any fenced code block). The file has the details; don't drop them without checking those issues first.
