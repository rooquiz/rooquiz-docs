'use client'

import { useMemo } from 'react'
import { useDocsSearch } from 'fumadocs-core/search/client'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import type { SharedProps } from 'fumadocs-ui/contexts/search'
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay
} from 'fumadocs-ui/components/dialog/search'
import { pagefindClient } from './pagefind-client'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Replaces Fumadocs' default dialog so search runs on the Pagefind index built by
// the `postbuild` script. Everything else — the shell, keyboard handling, result
// rendering and its `<mark>` highlighting — is Fumadocs'.
export default function PagefindSearchDialog(props: SharedProps) {
  const { locale = DEFAULT_LOCALE } = useI18n()
  const client = useMemo(() => pagefindClient(locale), [locale])
  const { search, setSearch, query } = useDocsSearch({ client })

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  )
}
