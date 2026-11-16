// 给导出的每个 HTML 页面包上 Cloudflare 的 <!--email_off--> 标记。
//
// docs 的代码示例里有大量示例邮箱（lead@example.com 等）。Cloudflare 的
// Email Address Obfuscation 会把它们改写成指向 /cdn-cgi/l/email-protection
// 的链接：代码块里变成 "[email protected]"，SEO 爬虫（Ahrefs 等）还把这个
// 链接报成内链 404。文档站不需要邮箱混淆，整页关掉即可。
//
// React 渲染不保留 HTML 注释，所以只能在 next build 之后改 out/ 里的文件。
// 幂等：已经包过的页面跳过。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT_DIR = process.argv[2] ?? 'out'
const OPEN = '<!--email_off-->'
const CLOSE = '<!--/email_off-->'

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* htmlFiles(path)
    else if (entry.name.endsWith('.html')) yield path
  }
}

let changed = 0
for await (const file of htmlFiles(OUT_DIR)) {
  const html = await readFile(file, 'utf8')
  if (html.includes(OPEN)) continue
  const bodyOpen = html.match(/<body[^>]*>/)
  const bodyClose = html.lastIndexOf('</body>')
  if (!bodyOpen || bodyOpen.index === undefined || bodyClose === -1) continue
  const start = bodyOpen.index + bodyOpen[0].length
  await writeFile(file, html.slice(0, start) + OPEN + html.slice(start, bodyClose) + CLOSE + html.slice(bodyClose))
  changed++
}
console.log(`email_off: wrapped ${changed} HTML file(s) in ${OUT_DIR}`)
