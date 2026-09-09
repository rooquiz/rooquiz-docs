import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import type { MDXComponents } from 'mdx/types'

// Registered globally so content files don't each need an import line — the four
// components below are what the docs actually use. `defaultMdxComponents` already
// provides Callout, Card/Cards, code blocks and headings.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tabs,
    Tab,
    Steps,
    Step,
    ...components
  } satisfies MDXComponents
}
