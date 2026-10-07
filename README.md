# RooQuiz Docs

Source for the RooQuiz product documentation site — written for creators who build and manage quizzes, assessments and surveys in the RooQuiz dashboard.

Built with [Fumadocs](https://fumadocs.dev) on Next.js (App Router) and Tailwind CSS 4, exported as a fully static site and deployed to Cloudflare Pages.

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
| `pnpm typecheck` | `tsc --noEmit` over the framework shell |
| `pnpm preview` | Serves the built `out/` through `wrangler pages dev` — the closest match to production, including the root-redirect Function |
| `pnpm deploy` | Manual `wrangler pages deploy out` (CI normally does this) |

Search is powered by [Pagefind](https://pagefind.app) and only exists after a build, so search will be empty in `pnpm dev`.

## Project structure

```
app/[lang]/            App Router shell — layout (<html>, providers, DocsLayout) and
                       the catch-all page that renders MDX
app/global.css         Tailwind 4 + the fumadocs-ui theme preset
app/robots.ts          robots.txt — everything crawlable except the Pagefind index
app/sitemap.ts         sitemap.xml — every page in both locales, with hreflang links
app/site-url.ts        Canonical origin, used by the two metadata routes above
lib/i18n.ts            Locale list, defaults and the localized UI strings
lib/source.ts          The content collection + Fumadocs loader (page tree, URLs)
lib/layout.shared.tsx  Navbar title, GitHub URL and sidebar footer, per locale
components/mdx.tsx     MDX components made available to every content file
components/search/     Pagefind-backed search dialog for the Fumadocs search UI
content/{en,zh}/       All documentation content, one mirrored tree per locale
functions/index.js     Cloudflare Pages Function: redirects `/` to `/en` or `/zh`
public/_redirects      Cloudflare Pages redirect rules (301s for retired URLs)
public/img/{en,zh}/    Screenshots, one folder per docs section, `.webp`
next.config.mjs        fumadocs-mdx plugin + `output: 'export'`
```

There is deliberately **no `app/layout.tsx`** — `app/[lang]/layout.tsx` renders `<html>`/`<body>` itself, because the `lang` attribute depends on the route segment. Adding a root layout would nest a second `<html>`.

## Writing docs

Content lives in `content/<locale>/<section>/<page>.mdx`. **The `en` and `zh` trees mirror each other** — every page added to one should be added to the other with the same filename, so the navbar locale switcher lands on the matching page.

A page is frontmatter plus body. There are no imports: `Callout`, `Steps`/`Step`, `Cards`/`Card` and `Tabs`/`Tab` are registered globally in `components/mdx.tsx` and can be used directly.

```mdx
---
title: Conditional Logic
---

**Conditional logic** shows or hides questions based on earlier answers.

<Callout type="warning">
  Rules are evaluated top to bottom.
</Callout>
```

Do **not** repeat the title as an `# H1` in the body — Fumadocs renders `title` as the page heading, so a body `# H1` would be a second one.

### Sidebar order and titles

Each directory has a `meta.json` controlling the order of its pages, and — for a section folder — the folder's own label:

```json
{
  "title": "Editor & Question Types",
  "pages": ["index", "question-types", "logic"]
}
```

`pages` entries are filenames without extension. Page labels come from each page's frontmatter `title`, so they are not repeated here. The top-level `content/<locale>/meta.json` also defines the sidebar section separators, written as `"---Core Features---"`.

When a page's sidebar label should differ from its heading — a section overview headed "Leads & Conversion" but listed as "Overview" — add `sidebarTitle`:

```mdx
---
title: Leads & Conversion
sidebarTitle: Overview
---
```

### Links

Internal links must include the locale prefix, e.g. `/en/getting-started/account` or `/zh/getting-started/account`. The site is statically exported with no middleware, so there is nothing to rewrite locale-less links at request time — they would 404.

Heading anchors are slugified from the heading text, CJK included (`## 转让所有权` → `#转让所有权`).

### Images

Put screenshots in `public/img/<locale>/<section>/<name>.webp` and reference them absolutely:

```mdx
![RooQuiz dashboard](/img/en/getting-started/dashboard.webp)
```

Localized screenshots (UI in the matching language) go in the matching locale folder; only `en` and `zh` have their own today, so the other locales reference `/img/en/` (`zh-TW` uses `/img/zh/`). Fumadocs resolves these against `public/` at build time and emits them as sized, lazy-loaded, content-hashed assets under `_next/static/media`, which is why the originals stay in `public/`.

## Locales

Locales match the languages rooquiz-web ships, declared once in `lib/i18n.ts`:

| URL segment | `<html lang>` / hreflang | rooquiz-web locale |
| --- | --- | --- |
| `en` (default) | `en` | `en-US` |
| `zh` | `zh-CN` | `zh-CN` |
| `zh-TW` | `zh-TW` | `zh-TW` |
| `de` | `de` | `de-DE` |
| `es` | `es` | `es` |
| `pt-BR` | `pt-BR` | `pt-BR` |
| `fr` | `fr` | `fr` |
| `ja` | `ja` | `ja-JP` |
| `ko` | `ko` | `ko-KR` |

`en` and `zh` keep their original short URLs because they were indexed before the other locales existed; the hreflang tag for `zh` is `zh-CN` so it does not also claim Traditional Chinese readers. Every locale is rendered through the `app/[lang]` segment with `generateStaticParams` — not middleware, which static export does not support. That is also why there is no `proxy.ts`/`middleware.ts`, even though Fumadocs' i18n docs call for one.

Two details follow from that:

- `loader({ i18n })` in `lib/source.ts` bakes the locale prefix into every sidebar, breadcrumb and pagination URL, so nothing needs rewriting at request time.
- The bare root `/` is handled by `functions/index.js`, a Cloudflare Pages Function that picks a locale from the visitor's `Accept-Language` header and redirects. It runs in `pnpm preview` and in production, but not in `pnpm dev`. It keeps its own copy of the locale list because it runs at the edge, outside the bundle. It maps regional tags onto the docs locales: `zh-TW`/`zh-HK`/`zh-Hant` go to `zh-TW`, any other `zh` to `zh`, any `pt` to `pt-BR`.

`fallbackLanguage` is `null` on purpose: a page present in only one locale must 404 in the other rather than silently serve the wrong language, because `sitemap.xml` promises hreflang alternates only for the locales a page actually has.

UI strings for the docs chrome (search, TOC, pagination, theme switcher) are translated in `lib/i18n.ts`. The keys are the English source strings; anything left untranslated falls back to the key.

## Search

Search uses Pagefind rather than Fumadocs' built-in search: the index is per-language and chunked, so a visitor downloads a few tens of KB on first search instead of a whole client-side database.

Two pieces make that work:

- `app/[lang]/[[...slug]]/page.tsx` marks the page body with `data-pagefind-body`. Once any element on a page carries that attribute, Pagefind indexes only that element — which is what keeps the navbar, sidebar and TOC out of every page's index. `data-pagefind-meta="title"` supplies the result heading.
- `components/search/` provides a `SearchClient` over Pagefind's JS API and a `SearchDialog` built from Fumadocs' own dialog primitives, wired in through `RootProvider`. Pagefind picks the language index from `<html lang>`, and the client re-initializes it when the locale changes.

## robots.txt and sitemap.xml

Both are Next.js metadata routes exported as static files (`out/robots.txt`, `out/sitemap.xml`).

`app/sitemap.ts` builds its entry list from `source.generateParams()` — the same helper the
catch-all page route uses — so **a new page needs no sitemap step**: add the MDX file and it
shows up. Each page is listed once per locale, carrying the full set of hreflang alternates
plus `x-default` pointing at the default locale. Entries have no `lastmod`: the CI checkout
resets file mtimes and the shallow clone has no per-file git history, so any date here would
be fiction.

Adding a locale means:

- adding it to `LOCALES`, `LANG_TAGS`, `DISPLAY_NAMES` and the UI strings in `lib/i18n.ts`, to `chrome`
  in `lib/layout.shared.tsx` and to `meta` in `app/[lang]/layout.tsx` (all typed as `Record<Locale, …>`,
  so `pnpm typecheck` flags a missing one);
- adding it to the locale list in `functions/index.js`;
- creating `content/<locale>/` with every file `content/en/` has, internal links rewritten to `/<locale>/`.

`scripts/check-locales.mjs` runs as `prebuild` (and as `pnpm check:locales`) and fails the build when a
locale tree is missing a file `content/en` has, has one it doesn't, links into another locale, or when
`functions/index.js` lists different locales than `lib/i18n.ts`. Changing an English page therefore
means updating the same file in every locale.

## Meta descriptions

Every page needs its own `description` in the frontmatter. Without one it inherits the site-level
description from `app/[lang]/layout.tsx` ("RooQuiz product documentation"), so a handful of pages
without one all end up sharing a single meta description — Bing Webmaster Tools reported exactly
that for 23 pages.

`scripts/check-descriptions.mjs` runs as `prebuild` (and via `pnpm check:descriptions`) and fails
the build when a description is missing, shorter than 150 characters, or identical to another
page's. Descriptions are also what the search-result snippet shows, so write them for a reader
deciding whether to open the page, not as a keyword list.

## IndexNow

After every deploy the workflow submits the pages whose exported HTML changed to
[IndexNow](https://www.indexnow.org), the shared endpoint Bing, Yandex, Seznam and Naver read —
so an edit is picked up in minutes instead of waiting for the next crawl.

- Ownership is proven by `public/d7f6fee5fbda0ed6d958b64243f50d12.txt`, served at the site root.
  Its **name and contents are the key**, and `scripts/indexnow.mjs` hardcodes the same value;
  rotating the key means changing all three together.
- `scripts/indexnow.mjs` diffs the build against a snapshot of per-URL content hashes carried
  between runs by `actions/cache`. Re-submitting unchanged URLs counts as abuse, hence the diff.
  With no snapshot it submits everything once.
- A failed submission never fails the deploy: the step is `continue-on-error`, and the snapshot
  is only written after a successful submission, so the next run retries the same URLs.
- To submit by hand after a build: `node scripts/indexnow.mjs out/sitemap.xml out --all`
  (add `--dry-run` to only print what would go out).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys `out/` to the `rooquiz-docs` Cloudflare Pages project. The workflow can also be run manually from the Actions tab, and needs these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Dependency pins

`pnpm-workspace.yaml` pins one transitive dependency to work around upstream breakage: `style-to-js` must be 2.x, because 1.x crashes `hast-util-to-estree` on any fenced code block. The file has the details; don't drop it without checking first.
