import { access, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"
import { navigationDefinition } from "../src/navigation/navigation-definition.js"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const collectDocuments = (items) =>
  items.flatMap((item) => [
    ...(item.type === "doc" ? [item] : []),
    ...(item.type === "category" && item.link?.type === "doc" ? [item.link] : []),
    ...(item.items ? collectDocuments(item.items) : []),
  ])

async function documentExists(relativePath) {
  for (const extension of [".md", ".mdx"]) {
    try {
      await access(path.join(repositoryRoot, "pages", `${relativePath}${extension}`))
      return true
    } catch {
      // Try the next supported Markdown extension.
    }
  }
  return false
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

const documents = collectDocuments(navigationDefinition)
const files = documents.map(({ file }) => file)
const duplicates = files.filter((file, index) => files.indexOf(file) !== index)
const missing = []
const duplicateHeadings = []
const brokenLinks = []

for (const file of new Set(files)) {
  for (const locale of SUPPORTED_LOCALES) {
    const localizedFile = locale === DEFAULT_LOCALE ? file : `${locale}/${file}`
    if (!(await documentExists(localizedFile))) missing.push(localizedFile)
  }
}

for (const file of await collectMarkdownFiles(path.join(repositoryRoot, "pages"))) {
  const source = await readFile(file, "utf8")
  const relativeFile = path.relative(repositoryRoot, file).replace(/\\/g, "/")
  if (/^#\s+/m.test(source)) duplicateHeadings.push(relativeFile)

  for (const match of source.matchAll(/\]\((\/[^)\s?#]+)(?:[?#][^)]*)?\)/g)) {
    const route = match[1].replace(/\/$/, "").replace(/^\//, "")
    if (route && !(await documentExists(route))) {
      brokenLinks.push(`${relativeFile}: /${route}`)
    }
  }
}

if (duplicates.length || missing.length || duplicateHeadings.length || brokenLinks.length) {
  if (duplicates.length) console.error(`Duplicate navigation documents: ${duplicates.join(", ")}`)
  if (missing.length) console.error(`Missing navigation documents:\n${missing.join("\n")}`)
  if (duplicateHeadings.length) {
    console.error(
      `Top-level Markdown headings duplicate Zudoku's frontmatter title:\n${duplicateHeadings.join("\n")}`,
    )
  }
  if (brokenLinks.length)
    console.error(`Broken internal documentation links:\n${brokenLinks.join("\n")}`)
  process.exitCode = 1
} else {
  console.log(
    `Validated navigation, heading hierarchy and internal links across ${SUPPORTED_LOCALES.length} locales.`,
  )
}
