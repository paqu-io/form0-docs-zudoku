import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { navigationDefinition } from "../src/navigation/navigation-definition.js"
import {
  allPageMetadata,
  canonicalUrl,
  DOCS_ORIGIN,
  markdownUrl,
  PROJECT_ORIGIN,
} from "../src/seo/page-metadata.js"

const SKIP_CATEGORIES = new Set(["Useful Links"])
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const outputRoot = join(repositoryRoot, "dist")

function link(label, url, note) {
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`
}

function collectDocs(items) {
  const docs = []
  for (const item of items || []) {
    if (item.type === "doc" && item.file) docs.push(item)
    if (item.type === "category" && item.items) docs.push(...collectDocs(item.items))
  }
  return docs
}

function categorySection(category, pageByPath) {
  const lines = collectDocs(category.items)
    .map((doc) => pageByPath.get(`/${doc.file}`))
    .filter((page) => page?.indexable)
    .map((page) => link(page.title, markdownUrl(page.pathname), page.description))
  return lines.length ? `## ${category.label}\n\n${lines.join("\n")}` : null
}

export function llmsTxt() {
  const pages = allPageMetadata()
  const pageByPath = new Map(pages.map((page) => [page.pathname, page]))
  const sections = navigationDefinition
    .filter((item) => item.type === "category" && !SKIP_CATEGORIES.has(item.label))
    .map((category) => categorySection(category, pageByPath))
    .filter(Boolean)

  const translations = pages
    .filter((page) => page.indexable && page.locale !== "en")
    .sort((left, right) => left.pathname.localeCompare(right.pathname))
  if (translations.length) {
    sections.push(
      `## Translations\n\n${translations
        .map((page) =>
          link(`${page.title} (${page.locale})`, markdownUrl(page.pathname), page.description),
        )
        .join("\n")}`,
    )
  }

  return `# form0 docs

> Documentation for form0, the open-source schema-driven form ecosystem. A JSON schema
> describes fields, visibility, validation and calculations; the engine evaluates it in
> Node.js, browsers, React Native and the CLI. There is no HTTP API.

The recommended first hour is the CLI: \`npm install -g form0-cli\`, then follow Quickstart.
form0 is a library you install and run yourself. It has no accounts, no hosted form service,
and no REST or webhook interface for agents to call. Persistence is opt-in through connectors.
form0-core is the engine if you already have an application.

${sections.join("\n\n")}

## Optional

${link(
  "Full documentation dump",
  `${DOCS_ORIGIN}/llms-full.txt`,
  "Concatenated published page contents generated at build time.",
)}
${link("Website", `${PROJECT_ORIGIN}/llms.txt`, "Project index, packages, and site markdown.")}
`
}

export async function llmsFullTxt() {
  const documents = []
  const pages = allPageMetadata()
    .filter((page) => page.indexable)
    .sort((left, right) => left.pathname.localeCompare(right.pathname))

  for (const page of pages) {
    const relative = `${page.pathname.replace(/^\//, "")}.md`
    const content = await readFile(join(outputRoot, relative), "utf8")
    documents.push(`---

## Document: ${page.title}

Language: ${page.locale}
URL: ${canonicalUrl(page.pathname)}

${content.trim()}`)
  }

  return `# form0 docs

> Complete published documentation for Large Language Models. Untranslated placeholders and
> temporary section stubs are intentionally excluded.

${documents.join("\n\n")}
`
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const target = join(directory, entry.name)
      if (entry.isDirectory()) return collectHtmlFiles(target)
      return entry.name.endsWith(".html") ? [target] : []
    }),
  )
  return files.flat()
}

async function writePrerenderedLanguages() {
  for (const file of await collectHtmlFiles(outputRoot)) {
    const relative = file.slice(outputRoot.length + 1).replace(/\\/g, "/")
    const locale = /^(es|fr|it)\//.exec(relative)?.[1] || "en"
    const html = await readFile(file, "utf8")
    const localized = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
    if (localized !== html) await writeFile(file, localized, "utf8")
  }
}

const currentFile = fileURLToPath(import.meta.url)
const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]) === currentFile

if (invokedDirectly) {
  await mkdir(outputRoot, { recursive: true })
  await Promise.all([
    writeFile(join(outputRoot, "llms.txt"), llmsTxt(), "utf8"),
    llmsFullTxt().then((content) => writeFile(join(outputRoot, "llms-full.txt"), content, "utf8")),
    writePrerenderedLanguages(),
  ])
  console.log("Wrote filtered LLM discovery files and localized prerendered document languages")
}
