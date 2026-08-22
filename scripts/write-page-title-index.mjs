import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pagesRoot = path.join(repositoryRoot, "pages")
const outputPath = path.join(repositoryRoot, "src", "seo", "page-title-index.json")

function titleFromSource(source) {
  const fence = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const title = fence?.[1].match(/^title:\s*(.+)$/m)?.[1]?.trim()
  return title ? title.replace(/^["']|["']$/g, "") : undefined
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(target)
      return /\.(md|mdx)$/.test(entry.name) ? [target] : []
    }),
  )
  return files.flat()
}

const titles = {}
for (const file of await collectMarkdownFiles(pagesRoot)) {
  const slug = path
    .relative(pagesRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.(mdx|md)$/, "")
  const title = titleFromSource(await readFile(file, "utf8"))
  if (title) titles[slug] = title
}

await writeFile(outputPath, `${JSON.stringify(titles, null, 2)}\n`)
console.log(`Wrote ${Object.keys(titles).length} page titles to src/seo/page-title-index.json`)
