import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pagesRoot = path.join(repositoryRoot, "pages")
const outputPath = path.join(repositoryRoot, "src", "seo", "page-metadata-index.json")
const untranslatedMarker = "This page is not translated yet."

function frontmatterFromSource(source) {
  const fence = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const value = (name) => {
    const raw = fence?.[1].match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim()
    return raw ? raw.replace(/^["']|["']$/g, "") : undefined
  }
  return { title: value("title"), description: value("description") }
}

function routeFromFile(file) {
  const slug = path
    .relative(pagesRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.(mdx|md)$/, "")
  return `/${slug}`
}

function routeIdentity(pathname) {
  const segments = pathname.split("/").filter(Boolean)
  const locale = SUPPORTED_LOCALES.includes(segments[0]) ? segments.shift() : DEFAULT_LOCALE
  return { locale, translationKey: `/${segments.join("/")}` }
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

const pages = {}
for (const file of await collectMarkdownFiles(pagesRoot)) {
  const source = await readFile(file, "utf8")
  const pathname = routeFromFile(file)
  const { locale, translationKey } = routeIdentity(pathname)
  const { title, description } = frontmatterFromSource(source)
  const placeholder = source.includes(untranslatedMarker)
  const temporary = translationKey === "/guides/coming-soon"

  pages[pathname] = {
    pathname,
    translationKey,
    locale,
    title,
    description,
    indexable: !placeholder && !temporary,
    status: placeholder ? "untranslated" : temporary ? "temporary" : "published",
  }
}

for (const page of Object.values(pages)) {
  page.alternates = Object.values(pages)
    .filter((candidate) => candidate.translationKey === page.translationKey && candidate.indexable)
    .map(({ locale, pathname }) => ({ locale, pathname }))
    .sort(
      (left, right) =>
        SUPPORTED_LOCALES.indexOf(left.locale) - SUPPORTED_LOCALES.indexOf(right.locale),
    )
}

await writeFile(outputPath, `${JSON.stringify(pages, null, 2)}\n`)
console.log(
  `Wrote ${Object.keys(pages).length} page metadata records to src/seo/page-metadata-index.json`,
)
