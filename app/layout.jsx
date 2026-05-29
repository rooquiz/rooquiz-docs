import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'RooQuiz Docs',
    template: '%s – RooQuiz Docs'
  },
  description: 'RooQuiz documentation'
}

const banner = <Banner storageKey="rooquiz-docs">RooQuiz docs are live 🎉</Banner>
const navbar = <Navbar logo={<b>RooQuiz Docs</b>} />
const footer = <Footer>MIT {new Date().getFullYear()} © RooQuiz.</Footer>

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>{/* Additional <head> tags */}</Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
