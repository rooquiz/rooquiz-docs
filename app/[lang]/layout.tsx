import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import { DEFAULT_LOCALE, LOCALES, provider, type Locale } from '@/lib/i18n'
import { baseOptions, sidebarFooter } from '@/lib/layout.shared'
import PagefindSearchDialog from '@/components/search/search-dialog'
import '../global.css'

// This layout renders <html>/<body> itself — there is deliberately no
// `app/layout.tsx`, which would nest a second <html> around it.

// Per-locale metadata. A static `metadata` export would put the Chinese title on
// the /en tree as well, so it is generated from the [lang] segment instead.
const meta = {
  en: { title: 'RooQuiz Docs', description: 'RooQuiz product documentation' },
  zh: { title: 'RooQuiz 文档', description: 'RooQuiz 使用文档' }
} satisfies Record<Locale, { title: string; description: string }>

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const m = meta[lang as Locale] ?? meta[DEFAULT_LOCALE]

  return {
    title: { default: m.title, template: `%s – ${m.title}` },
    description: m.description
  }
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export default async function RootLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={provider(lang as Locale)}
          search={{ SearchDialog: PagefindSearchDialog }}
        >
          <DocsLayout
            {...baseOptions(lang)}
            tree={source.getPageTree(lang)}
            sidebar={{ footer: sidebarFooter(lang) }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
