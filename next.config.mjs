import nextra from 'nextra'

const withNextra = nextra({
  // ... Add Nextra-specific options here
})

// Export the final Next.js config with Nextra included
export default withNextra({
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh'
  }
})
