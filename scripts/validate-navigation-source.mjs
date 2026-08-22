import { access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"
import { navigationDefinition } from "../src/navigation/navigation-definition.js"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const collectDocuments = (items) =>
  items.flatMap((item) => [
    ...(item.type === "doc" ? [item] : []),
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

const documents = collectDocuments(navigationDefinition)
const files = documents.map(({ file }) => file)
const duplicates = files.filter((file, index) => files.indexOf(file) !== index)
const missing = []

for (const file of new Set(files)) {
  for (const locale of SUPPORTED_LOCALES) {
    const localizedFile = locale === DEFAULT_LOCALE ? file : `${locale}/${file}`
    if (!(await documentExists(localizedFile))) missing.push(localizedFile)
  }
}

if (duplicates.length || missing.length) {
  if (duplicates.length) console.error(`Duplicate navigation documents: ${duplicates.join(", ")}`)
  if (missing.length) console.error(`Missing navigation documents:\n${missing.join("\n")}`)
  process.exitCode = 1
} else {
  console.log(
    `Validated ${files.length} navigation documents across ${SUPPORTED_LOCALES.length} locales.`,
  )
}
