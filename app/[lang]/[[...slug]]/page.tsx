import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  DocsBody,
  DocsPage,
  DocsTitle,
  EditOnGitHub
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { source } from '@/lib/source'
import { languagesFor, pageUrl } from '@/lib/alternates'
import { DOCS_REPOSITORY_BASE } from '@/lib/layout.shared'
import { getMDXComponents } from '@/components/mdx'

type Params = { lang: string; slug?: string[] }

export default async function Page(props: { params: Promise<Params> }) {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {/*
        Pagefind indexes the exported HTML. Once any element on a page carries
        `data-pagefind-body` only that element is indexed, which keeps the sidebar,
        navbar and TOC out of every page's index. `data-pagefind-meta` supplies the
        result heading, since the title is no longer an H1 inside the body.
      */}
      <div data-pagefind-body>
        <DocsTitle data-pagefind-meta="title">{page.data.title}</DocsTitle>
        <DocsBody>
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </DocsBody>
      </div>
      <div className="flex flex-row items-center gap-2 border-t pt-6">
        {/* `parser: 'dir'` strips the locale from `page.path`, so put it back. */}
        <EditOnGitHub
          href={`${DOCS_REPOSITORY_BASE}/blob/main/content/${page.locale}/${page.path}`}
        />
      </div>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams('slug', 'lang')
}

export async function generateMetadata(props: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  // The locale index comes back as [] (or ['']) — same normalisation the route map
  // uses, so `/en` and `/en/editor/logic` both resolve to a real entry.
  const segments = (slug ?? []).filter(Boolean)

  return {
    title: page.data.title,
    description: page.data.description,
    // Self-referencing canonical plus the page's hreflang cluster. Without these
    // the en and zh trees are two structurally identical sets of URLs with nothing
    // in the markup tying them together, which invites Google to treat one as a
    // duplicate of the other and drop it.
    alternates: {
      canonical: pageUrl(lang, segments),
      languages: languagesFor(segments)
    }
  }
}
