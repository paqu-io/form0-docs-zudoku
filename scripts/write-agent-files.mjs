import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { navigationDefinition } from "../src/navigation/navigation-definition.js"

const DOCS_ORIGIN = "https://docs.form0.dev"
const SITE_ORIGIN = "https://form0.dev"
const SKIP_CATEGORIES = new Set(["Useful Links"])

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

function categorySection(category) {
  const lines = collectDocs(category.items).map((doc) =>
    link(doc.label, `${DOCS_ORIGIN}/${doc.file}.md`),
  )
  return `## ${category.label}\n\n${lines.join("\n")}`
}

export function llmsTxt() {
  const sections = navigationDefinition
    .filter((item) => item.type === "category" && !SKIP_CATEGORIES.has(item.label))
    .map(categorySection)
    .join("\n\n")

  return `# form0 docs

> Documentation for form0, the open-source schema-driven form ecosystem. A JSON schema
> describes fields, visibility, validation and calculations; the engine evaluates it in
> Node.js, browsers, React Native and the CLI. There is no HTTP API.

The recommended first hour is the CLI: \`npm install -g form0-cli\`, then follow Quickstart.
form0 is a library you install and run yourself. It has no accounts, no hosted form service,
and no REST or webhook interface for agents to call. Persistence is opt-in through connectors.
form0-core is the engine if you already have an application.

${sections}

## Optional

${link(
  "Full documentation dump",
  `${DOCS_ORIGIN}/llms-full.txt`,
  "Concatenated page contents generated at build time.",
)}
${link("Website", `${SITE_ORIGIN}/llms.txt`, "Project index, packages, and site markdown.")}
`
}

const currentFile = fileURLToPath(import.meta.url)
const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]) === currentFile

if (invokedDirectly) {
  const dest = fileURLToPath(new URL("../dist/llms.txt", import.meta.url))
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, llmsTxt(), "utf8")
  console.log("Wrote dist/llms.txt")
}
