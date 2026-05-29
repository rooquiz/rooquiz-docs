export { proxy } from 'nextra/locales'

export const config = {
  // Match all pathnames except for Next.js internals and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
}
