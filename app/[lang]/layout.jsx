import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

// Per-locale metadata. A static `metadata` export would apply Chinese titles to the
// /en tree as well, so this is generated from the [lang] segment instead.
const meta = {
  zh: { title: 'RooQuiz 文档', description: 'RooQuiz 使用文档' },
  en: { title: 'RooQuiz Docs', description: 'RooQuiz product documentation' }
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const m = meta[lang] ?? meta[DEFAULT_LOCALE]
  return {
    title: { default: m.title, template: `%s – ${m.title}` },
    description: m.description
  }
}

// Languages shown in the navbar locale switcher
const i18n = [
  { locale: 'zh', name: '简体中文' },
  { locale: 'en', name: 'English' }
]

// Must match `i18n.defaultLocale` in next.config.mjs — it is the fallback for both
// the metadata above and the UI strings below.
const DEFAULT_LOCALE = 'en'

// Localized UI strings for the docs theme chrome (TOC, edit link, feedback, etc.)
const ui = {
  zh: {
    logo: 'RooQuiz 文档',
    footer: `${new Date().getFullYear()} © RooQuiz · 让测验、测评与问卷更简单`,
    editLink: '编辑此页',
    feedback: '有问题?向我们反馈',
    tocTitle: '本页目录',
    backToTop: '回到顶部',
    theme: { light: '浅色', dark: '深色', system: '跟随系统' },
    search: { placeholder: '搜索文档…', emptyResult: '没有找到结果', loading: '加载中…', error: '加载搜索索引失败' }
  },
  en: {
    logo: 'RooQuiz Docs',
    footer: `${new Date().getFullYear()} © RooQuiz · Quizzes, assessments and surveys made simple`,
    editLink: 'Edit this page',
    feedback: 'Question? Give us feedback',
    tocTitle: 'On This Page',
    backToTop: 'Scroll to top',
    theme: { light: 'Light', dark: 'Dark', system: 'System' },
    search: { placeholder: 'Search documentation…', emptyResult: 'No results found.', loading: 'Loading…', error: 'Failed to load search index.' }
  }
}

export async function generateStaticParams() {
  return i18n.map(({ locale }) => ({ lang: locale }))
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params
  const t = ui[lang] ?? ui[DEFAULT_LOCALE]

  const navbar = <Navbar logo={<b>{t.logo}</b>} />
  const footer = <Footer>{t.footer}</Footer>
  const search = (
    <Search
      placeholder={t.search.placeholder}
      emptyResult={t.search.emptyResult}
      loading={t.search.loading}
      errorText={t.search.error}
    />
  )

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head>{/* Additional <head> tags */}</Head>
      <body>
        <Layout
          i18n={i18n}
          navbar={navbar}
          search={search}
          pageMap={await getPageMap(`/${lang}`)}
          docsRepositoryBase="https://github.com/rooquiz/rooquiz-docs/tree/main"
          editLink={t.editLink}
          feedback={{ content: t.feedback }}
          toc={{ title: t.tocTitle, backToTop: t.backToTop }}
          themeSwitch={{ light: t.theme.light, dark: t.theme.dark, system: t.theme.system }}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
