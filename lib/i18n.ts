import { defineI18nUI } from 'fumadocs-ui/i18n'
import type { I18nConfig } from 'fumadocs-core/i18n'

export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]

// The locale a visitor with no `Accept-Language` match lands on, and the one
// `x-default` points at in the sitemap. Kept in sync with `functions/index.js`,
// which runs at the Cloudflare edge and cannot import from here.
export const DEFAULT_LOCALE: Locale = 'en'

const config: I18nConfig<Locale> = {
  languages: [...LOCALES],
  defaultLanguage: DEFAULT_LOCALE,
  // `content/en/**` and `content/zh/**` — one directory per locale, which is what
  // the tree already looks like.
  parser: 'dir',
  // Keep /en and /zh in every URL. The site is statically exported, so there is no
  // middleware to rewrite a locale-less path at request time.
  hideLocale: 'never',
  // No silent fallback: a page missing from one locale must 404 rather than serve
  // the other language. `app/sitemap.ts` emits hreflang alternates only for the
  // locales a page really has, and an alternate must never point at borrowed content.
  fallbackLanguage: null
}

// Per-locale UI strings for the docs chrome. `uiTranslations()` only registers the
// English source strings as keys — it ships no translations — so the Chinese values
// are supplied here. Untranslated keys fall back to the English key itself.
export const { provider } = defineI18nUI(config, {
  en: {
    displayName: 'English'
  },
  zh: {
    displayName: '简体中文',
    'Search(search dialog)': '搜索文档',
    'Search(search trigger)': '搜索文档',
    'Open Search(search trigger)(aria-label)': '打开搜索',
    'Close Search(search dialog)(aria-label)': '关闭搜索',
    'No results found(search dialog)': '没有找到结果',
    'On this page(table of contents)': '本页目录',
    'No Headings(table of contents)': '本页没有小节',
    'Table of Contents(inline table of contents)': '本页目录',
    'Previous Page(pagination)': '上一页',
    'Next Page(pagination)': '下一页',
    'Edit on GitHub(edit page)': '编辑此页',
    'Last updated on(page footer)': '最后更新于',
    'Choose a language(language switcher)': '选择语言',
    'Choose a language(language switcher)(aria-label)': '选择语言',
    'Toggle Theme(theme switcher)(aria-label)': '切换主题',
    'Light(theme switcher)(aria-label)': '浅色',
    'Dark(theme switcher)(aria-label)': '深色',
    'System(theme switcher)(aria-label)': '跟随系统',
    'Toggle Menu(mobile menu)(aria-label)': '切换菜单',
    'Open Sidebar(sidebar)(aria-label)': '展开侧边栏',
    'Close Sidebar(sidebar)(aria-label)': '收起侧边栏',
    'Collapse Sidebar(sidebar)(aria-label)': '收起侧边栏',
    'Show Sidebar(sidebar)': '显示侧边栏',
    'Hide Sidebar(sidebar)': '隐藏侧边栏',
    'Copy Text(code block)(aria-label)': '复制',
    'Copied Text(code block)(aria-label)': '已复制',
    'Copy Anchor Link(heading anchor)(aria-label)': '复制本节链接',
    'Page Not Found(404 page)': '页面不存在',
    'Back to Home(404 page)': '回到首页',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
      '你要找的页面可能已被删除、改名,或暂时无法访问。'
  }
})

export const i18n = config
