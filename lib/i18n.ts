import { defineI18nUI } from 'fumadocs-ui/i18n'
import type { I18nConfig } from 'fumadocs-core/i18n'

// The URL segment of each locale. `en` and `zh` predate the rest and are already
// indexed, so they keep their short codes; the others mirror rooquiz-web's locales
// (en-US, de-DE, ja-JP, ...) with the region dropped where it adds nothing.
// Kept in sync with `functions/index.js` — `scripts/check-locales.mjs` enforces it.
export const LOCALES = ['en', 'zh', 'zh-TW', 'de', 'es', 'pt-BR', 'fr', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

// BCP 47 tag for `<html lang>` and hreflang. Differs from the URL segment only for
// `zh`: once `zh-TW` exists, a bare `zh` alternate would also claim Traditional
// Chinese readers.
const LANG_TAGS: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  de: 'de',
  es: 'es',
  'pt-BR': 'pt-BR',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko'
}

export function langTag(locale: string) {
  return LANG_TAGS[locale as Locale] ?? locale
}

// Native names, matching rooquiz-web's language switcher.
const DISPLAY_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-TW': '繁體中文',
  de: 'Deutsch',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어'
}

// The locale a visitor with no `Accept-Language` match lands on, and the one
// `x-default` points at in the sitemap. Kept in sync with `functions/index.js`,
// which runs at the Cloudflare edge and cannot import from here.
export const DEFAULT_LOCALE: Locale = 'en'

const config: I18nConfig<Locale> = {
  languages: [...LOCALES],
  defaultLanguage: DEFAULT_LOCALE,
  // `content/<locale>/**` — one directory per locale.
  parser: 'dir',
  // Keep the locale in every URL. The site is statically exported, so there is no
  // middleware to rewrite a locale-less path at request time.
  hideLocale: 'never',
  // No silent fallback: a page missing from one locale must 404 rather than serve
  // the other language. `app/sitemap.ts` emits hreflang alternates only for the
  // locales a page really has, and an alternate must never point at borrowed content.
  fallbackLanguage: null
}

// Per-locale UI strings for the docs chrome. `uiTranslations()` only registers the
// English source strings as keys — it ships no translations — so the non-English values
// are supplied here. Untranslated keys fall back to the English key itself.
export const { provider } = defineI18nUI(config, {
  en: {
    displayName: DISPLAY_NAMES.en
  },
  zh: {
    displayName: DISPLAY_NAMES.zh,
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
  },
  'zh-TW': {
    displayName: DISPLAY_NAMES['zh-TW'],
    'Search(search dialog)': '搜尋文件',
    'Search(search trigger)': '搜尋文件',
    'Open Search(search trigger)(aria-label)': '開啟搜尋',
    'Close Search(search dialog)(aria-label)': '關閉搜尋',
    'No results found(search dialog)': '找不到結果',
    'On this page(table of contents)': '本頁目錄',
    'No Headings(table of contents)': '本頁沒有小節',
    'Table of Contents(inline table of contents)': '本頁目錄',
    'Previous Page(pagination)': '上一頁',
    'Next Page(pagination)': '下一頁',
    'Edit on GitHub(edit page)': '編輯此頁',
    'Last updated on(page footer)': '最後更新於',
    'Choose a language(language switcher)': '選擇語言',
    'Choose a language(language switcher)(aria-label)': '選擇語言',
    'Toggle Theme(theme switcher)(aria-label)': '切換主題',
    'Light(theme switcher)(aria-label)': '淺色',
    'Dark(theme switcher)(aria-label)': '深色',
    'System(theme switcher)(aria-label)': '跟隨系統',
    'Toggle Menu(mobile menu)(aria-label)': '切換選單',
    'Open Sidebar(sidebar)(aria-label)': '展開側邊欄',
    'Close Sidebar(sidebar)(aria-label)': '收合側邊欄',
    'Collapse Sidebar(sidebar)(aria-label)': '收合側邊欄',
    'Show Sidebar(sidebar)': '顯示側邊欄',
    'Hide Sidebar(sidebar)': '隱藏側邊欄',
    'Copy Text(code block)(aria-label)': '複製',
    'Copied Text(code block)(aria-label)': '已複製',
    'Copy Anchor Link(heading anchor)(aria-label)': '複製本節連結',
    'Page Not Found(404 page)': '找不到頁面',
    'Back to Home(404 page)': '回到首頁',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': '你要找的頁面可能已被刪除、更名,或暫時無法存取。'
  },
  de: {
    displayName: DISPLAY_NAMES['de'],
    'Search(search dialog)': 'Dokumentation durchsuchen',
    'Search(search trigger)': 'Dokumentation durchsuchen',
    'Open Search(search trigger)(aria-label)': 'Suche öffnen',
    'Close Search(search dialog)(aria-label)': 'Suche schließen',
    'No results found(search dialog)': 'Keine Ergebnisse gefunden',
    'On this page(table of contents)': 'Auf dieser Seite',
    'No Headings(table of contents)': 'Keine Überschriften',
    'Table of Contents(inline table of contents)': 'Inhaltsverzeichnis',
    'Previous Page(pagination)': 'Vorherige Seite',
    'Next Page(pagination)': 'Nächste Seite',
    'Edit on GitHub(edit page)': 'Auf GitHub bearbeiten',
    'Last updated on(page footer)': 'Zuletzt aktualisiert am',
    'Choose a language(language switcher)': 'Sprache wählen',
    'Choose a language(language switcher)(aria-label)': 'Sprache wählen',
    'Toggle Theme(theme switcher)(aria-label)': 'Design wechseln',
    'Light(theme switcher)(aria-label)': 'Hell',
    'Dark(theme switcher)(aria-label)': 'Dunkel',
    'System(theme switcher)(aria-label)': 'System',
    'Toggle Menu(mobile menu)(aria-label)': 'Menü umschalten',
    'Open Sidebar(sidebar)(aria-label)': 'Seitenleiste öffnen',
    'Close Sidebar(sidebar)(aria-label)': 'Seitenleiste schließen',
    'Collapse Sidebar(sidebar)(aria-label)': 'Seitenleiste einklappen',
    'Show Sidebar(sidebar)': 'Seitenleiste anzeigen',
    'Hide Sidebar(sidebar)': 'Seitenleiste ausblenden',
    'Copy Text(code block)(aria-label)': 'Kopieren',
    'Copied Text(code block)(aria-label)': 'Kopiert',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Link zu diesem Abschnitt kopieren',
    'Page Not Found(404 page)': 'Seite nicht gefunden',
    'Back to Home(404 page)': 'Zur Startseite',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': 'Die gesuchte Seite wurde möglicherweise entfernt, umbenannt oder ist vorübergehend nicht verfügbar.'
  },
  es: {
    displayName: DISPLAY_NAMES['es'],
    'Search(search dialog)': 'Buscar en la documentación',
    'Search(search trigger)': 'Buscar en la documentación',
    'Open Search(search trigger)(aria-label)': 'Abrir búsqueda',
    'Close Search(search dialog)(aria-label)': 'Cerrar búsqueda',
    'No results found(search dialog)': 'No se encontraron resultados',
    'On this page(table of contents)': 'En esta página',
    'No Headings(table of contents)': 'Sin encabezados',
    'Table of Contents(inline table of contents)': 'Índice',
    'Previous Page(pagination)': 'Página anterior',
    'Next Page(pagination)': 'Página siguiente',
    'Edit on GitHub(edit page)': 'Editar en GitHub',
    'Last updated on(page footer)': 'Última actualización',
    'Choose a language(language switcher)': 'Elegir idioma',
    'Choose a language(language switcher)(aria-label)': 'Elegir idioma',
    'Toggle Theme(theme switcher)(aria-label)': 'Cambiar tema',
    'Light(theme switcher)(aria-label)': 'Claro',
    'Dark(theme switcher)(aria-label)': 'Oscuro',
    'System(theme switcher)(aria-label)': 'Sistema',
    'Toggle Menu(mobile menu)(aria-label)': 'Abrir o cerrar menú',
    'Open Sidebar(sidebar)(aria-label)': 'Abrir barra lateral',
    'Close Sidebar(sidebar)(aria-label)': 'Cerrar barra lateral',
    'Collapse Sidebar(sidebar)(aria-label)': 'Contraer barra lateral',
    'Show Sidebar(sidebar)': 'Mostrar barra lateral',
    'Hide Sidebar(sidebar)': 'Ocultar barra lateral',
    'Copy Text(code block)(aria-label)': 'Copiar',
    'Copied Text(code block)(aria-label)': 'Copiado',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copiar enlace a esta sección',
    'Page Not Found(404 page)': 'Página no encontrada',
    'Back to Home(404 page)': 'Volver al inicio',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': 'Es posible que la página que buscas se haya eliminado, haya cambiado de nombre o no esté disponible temporalmente.'
  },
  'pt-BR': {
    displayName: DISPLAY_NAMES['pt-BR'],
    'Search(search dialog)': 'Pesquisar na documentação',
    'Search(search trigger)': 'Pesquisar na documentação',
    'Open Search(search trigger)(aria-label)': 'Abrir pesquisa',
    'Close Search(search dialog)(aria-label)': 'Fechar pesquisa',
    'No results found(search dialog)': 'Nenhum resultado encontrado',
    'On this page(table of contents)': 'Nesta página',
    'No Headings(table of contents)': 'Sem títulos',
    'Table of Contents(inline table of contents)': 'Sumário',
    'Previous Page(pagination)': 'Página anterior',
    'Next Page(pagination)': 'Próxima página',
    'Edit on GitHub(edit page)': 'Editar no GitHub',
    'Last updated on(page footer)': 'Última atualização em',
    'Choose a language(language switcher)': 'Escolher idioma',
    'Choose a language(language switcher)(aria-label)': 'Escolher idioma',
    'Toggle Theme(theme switcher)(aria-label)': 'Alternar tema',
    'Light(theme switcher)(aria-label)': 'Claro',
    'Dark(theme switcher)(aria-label)': 'Escuro',
    'System(theme switcher)(aria-label)': 'Sistema',
    'Toggle Menu(mobile menu)(aria-label)': 'Alternar menu',
    'Open Sidebar(sidebar)(aria-label)': 'Abrir barra lateral',
    'Close Sidebar(sidebar)(aria-label)': 'Fechar barra lateral',
    'Collapse Sidebar(sidebar)(aria-label)': 'Recolher barra lateral',
    'Show Sidebar(sidebar)': 'Mostrar barra lateral',
    'Hide Sidebar(sidebar)': 'Ocultar barra lateral',
    'Copy Text(code block)(aria-label)': 'Copiar',
    'Copied Text(code block)(aria-label)': 'Copiado',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copiar link desta seção',
    'Page Not Found(404 page)': 'Página não encontrada',
    'Back to Home(404 page)': 'Voltar ao início',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': 'A página que você procura pode ter sido removida, ter mudado de nome ou estar temporariamente indisponível.'
  },
  fr: {
    displayName: DISPLAY_NAMES['fr'],
    'Search(search dialog)': 'Rechercher dans la documentation',
    'Search(search trigger)': 'Rechercher dans la documentation',
    'Open Search(search trigger)(aria-label)': 'Ouvrir la recherche',
    'Close Search(search dialog)(aria-label)': 'Fermer la recherche',
    'No results found(search dialog)': 'Aucun résultat',
    'On this page(table of contents)': 'Sur cette page',
    'No Headings(table of contents)': 'Aucun titre',
    'Table of Contents(inline table of contents)': 'Table des matières',
    'Previous Page(pagination)': 'Page précédente',
    'Next Page(pagination)': 'Page suivante',
    'Edit on GitHub(edit page)': 'Modifier sur GitHub',
    'Last updated on(page footer)': 'Dernière mise à jour le',
    'Choose a language(language switcher)': 'Choisir la langue',
    'Choose a language(language switcher)(aria-label)': 'Choisir la langue',
    'Toggle Theme(theme switcher)(aria-label)': 'Changer de thème',
    'Light(theme switcher)(aria-label)': 'Clair',
    'Dark(theme switcher)(aria-label)': 'Sombre',
    'System(theme switcher)(aria-label)': 'Système',
    'Toggle Menu(mobile menu)(aria-label)': 'Afficher ou masquer le menu',
    'Open Sidebar(sidebar)(aria-label)': 'Ouvrir la barre latérale',
    'Close Sidebar(sidebar)(aria-label)': 'Fermer la barre latérale',
    'Collapse Sidebar(sidebar)(aria-label)': 'Réduire la barre latérale',
    'Show Sidebar(sidebar)': 'Afficher la barre latérale',
    'Hide Sidebar(sidebar)': 'Masquer la barre latérale',
    'Copy Text(code block)(aria-label)': 'Copier',
    'Copied Text(code block)(aria-label)': 'Copié',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copier le lien vers cette section',
    'Page Not Found(404 page)': 'Page introuvable',
    'Back to Home(404 page)': "Retour à l'accueil",
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': 'La page que vous cherchez a peut-être été supprimée, renommée ou est temporairement indisponible.'
  },
  ja: {
    displayName: DISPLAY_NAMES['ja'],
    'Search(search dialog)': 'ドキュメントを検索',
    'Search(search trigger)': 'ドキュメントを検索',
    'Open Search(search trigger)(aria-label)': '検索を開く',
    'Close Search(search dialog)(aria-label)': '検索を閉じる',
    'No results found(search dialog)': '結果が見つかりません',
    'On this page(table of contents)': 'このページの内容',
    'No Headings(table of contents)': '見出しがありません',
    'Table of Contents(inline table of contents)': '目次',
    'Previous Page(pagination)': '前のページ',
    'Next Page(pagination)': '次のページ',
    'Edit on GitHub(edit page)': 'GitHub で編集',
    'Last updated on(page footer)': '最終更新日',
    'Choose a language(language switcher)': '言語を選択',
    'Choose a language(language switcher)(aria-label)': '言語を選択',
    'Toggle Theme(theme switcher)(aria-label)': 'テーマを切り替え',
    'Light(theme switcher)(aria-label)': 'ライト',
    'Dark(theme switcher)(aria-label)': 'ダーク',
    'System(theme switcher)(aria-label)': 'システム',
    'Toggle Menu(mobile menu)(aria-label)': 'メニューを切り替え',
    'Open Sidebar(sidebar)(aria-label)': 'サイドバーを開く',
    'Close Sidebar(sidebar)(aria-label)': 'サイドバーを閉じる',
    'Collapse Sidebar(sidebar)(aria-label)': 'サイドバーを折りたたむ',
    'Show Sidebar(sidebar)': 'サイドバーを表示',
    'Hide Sidebar(sidebar)': 'サイドバーを非表示',
    'Copy Text(code block)(aria-label)': 'コピー',
    'Copied Text(code block)(aria-label)': 'コピーしました',
    'Copy Anchor Link(heading anchor)(aria-label)': 'このセクションへのリンクをコピー',
    'Page Not Found(404 page)': 'ページが見つかりません',
    'Back to Home(404 page)': 'ホームに戻る',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': 'お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。'
  },
  ko: {
    displayName: DISPLAY_NAMES['ko'],
    'Search(search dialog)': '문서 검색',
    'Search(search trigger)': '문서 검색',
    'Open Search(search trigger)(aria-label)': '검색 열기',
    'Close Search(search dialog)(aria-label)': '검색 닫기',
    'No results found(search dialog)': '검색 결과가 없습니다',
    'On this page(table of contents)': '이 페이지의 내용',
    'No Headings(table of contents)': '제목이 없습니다',
    'Table of Contents(inline table of contents)': '목차',
    'Previous Page(pagination)': '이전 페이지',
    'Next Page(pagination)': '다음 페이지',
    'Edit on GitHub(edit page)': 'GitHub에서 편집',
    'Last updated on(page footer)': '마지막 업데이트',
    'Choose a language(language switcher)': '언어 선택',
    'Choose a language(language switcher)(aria-label)': '언어 선택',
    'Toggle Theme(theme switcher)(aria-label)': '테마 전환',
    'Light(theme switcher)(aria-label)': '라이트',
    'Dark(theme switcher)(aria-label)': '다크',
    'System(theme switcher)(aria-label)': '시스템',
    'Toggle Menu(mobile menu)(aria-label)': '메뉴 전환',
    'Open Sidebar(sidebar)(aria-label)': '사이드바 열기',
    'Close Sidebar(sidebar)(aria-label)': '사이드바 닫기',
    'Collapse Sidebar(sidebar)(aria-label)': '사이드바 접기',
    'Show Sidebar(sidebar)': '사이드바 표시',
    'Hide Sidebar(sidebar)': '사이드바 숨기기',
    'Copy Text(code block)(aria-label)': '복사',
    'Copied Text(code block)(aria-label)': '복사됨',
    'Copy Anchor Link(heading anchor)(aria-label)': '이 섹션 링크 복사',
    'Page Not Found(404 page)': '페이지를 찾을 수 없습니다',
    'Back to Home(404 page)': '홈으로 돌아가기',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)': '찾으시는 페이지가 삭제되었거나 이름이 변경되었거나 일시적으로 사용할 수 없습니다.'
  }
})

export const i18n = config
