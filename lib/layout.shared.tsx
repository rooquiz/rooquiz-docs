import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { DEFAULT_LOCALE, type Locale } from './i18n'

export const DOCS_REPOSITORY_BASE = 'https://github.com/rooquiz/rooquiz-docs'

const chrome = {
  en: {
    logo: 'RooQuiz Docs',
    footer: 'RooQuiz · Quizzes, assessments and surveys made simple'
  },
  zh: {
    logo: 'RooQuiz 文档',
    footer: 'RooQuiz · 让测验、测评与问卷更简单'
  }
} satisfies Record<Locale, { logo: string; footer: string }>

export function chromeStrings(locale: string) {
  return chrome[locale as Locale] ?? chrome[DEFAULT_LOCALE]
}

// Shared between the docs layout and (should one ever be added) a home layout.
export function baseOptions(locale: string): BaseLayoutProps {
  const t = chromeStrings(locale)

  return {
    nav: {
      title: <b>{t.logo}</b>,
      url: `/${locale}`
    },
    githubUrl: DOCS_REPOSITORY_BASE
  }
}

export function sidebarFooter(locale: string) {
  const t = chromeStrings(locale)

  return (
    <p className="text-fd-muted-foreground text-xs">
      {new Date().getFullYear()} © {t.footer}
    </p>
  )
}
