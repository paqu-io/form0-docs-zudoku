import { access, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"

const LANGUAGE_LABELS = {
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputRoot = path.join(repositoryRoot, "dist")
const representativeDocument = "getting-started/quickstart"

const commonMessages = Object.fromEntries(
  await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => [
      locale,
      JSON.parse(
        await readFile(path.join(repositoryRoot, "src", "locales", locale, "common.json"), "utf8"),
      ),
    ]),
  ),
)

const failures = []

const requireFile = async (relativePath) => {
  try {
    await access(path.join(outputRoot, relativePath))
  } catch {
    failures.push(`Missing dist/${relativePath}`)
  }
}

async function collectFiles(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name)
      return entry.isDirectory()
        ? collectFiles(target, predicate)
        : predicate(target)
          ? [target]
          : []
    }),
  )
  return files.flat()
}

for (const artifact of [
  "llms.txt",
  "llms-full.txt",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
]) {
  await requireFile(artifact)
}

try {
  const pagefindEntry = JSON.parse(
    await readFile(path.join(outputRoot, "pagefind/pagefind-entry.json"), "utf8"),
  )
  const pagefindJs = await readFile(path.join(outputRoot, "pagefind/pagefind.js"), "utf8")
  if (pagefindEntry.version && !pagefindJs.includes(pagefindEntry.version)) {
    failures.push(
      `pagefind.js does not contain index version ${pagefindEntry.version}; the search client and index are out of sync`,
    )
  }
} catch {
  failures.push("Unable to read pagefind version metadata")
}

let llmsTxt
try {
  llmsTxt = await readFile(path.join(outputRoot, "llms.txt"), "utf8")
} catch {
  llmsTxt = ""
}

if (llmsTxt) {
  if (!/\[[^\]]+\]\(https:\/\//.test(llmsTxt)) {
    failures.push("llms.txt does not contain markdown hyperlinks")
  }
  if (!llmsTxt.includes("https://docs.form0.dev/getting-started/quickstart.md")) {
    failures.push("llms.txt is missing the Quickstart absolute .md URL")
  }
  for (const banned of ["Questa è una prova", "dasdsadsa"]) {
    if (llmsTxt.includes(banned)) {
      failures.push(`llms.txt contains boilerplate page copy: ${banned}`)
    }
  }
}

for (const locale of SUPPORTED_LOCALES) {
  const prefix = locale === DEFAULT_LOCALE ? "" : `${locale}/`
  const htmlPath = `${prefix}${representativeDocument}.html`
  const markdownPath = `${prefix}${representativeDocument}.md`
  await requireFile(htmlPath)
  await requireFile(markdownPath)

  let html
  try {
    html = await readFile(path.join(outputRoot, htmlPath), "utf8")
  } catch {
    continue
  }

  const expectedHref = `/${prefix}${representativeDocument}`
  const expectedLabel = commonMessages[locale].nav.quickstart
  if (!html.includes(`href="${expectedHref}"`) || !html.includes(expectedLabel)) {
    failures.push(`${htmlPath} does not contain its localized Quickstart navigation link and label`)
  }
  if (!html.includes(`href="/${prefix}${representativeDocument}.md"`)) {
    failures.push(`${htmlPath} does not contain its published Markdown link`)
  }
  if (!html.includes(`pages/${prefix}${representativeDocument}.mdx`)) {
    failures.push(`${htmlPath} does not contain its locale-specific edit-page target`)
  }

  for (const icon of ["sparkles", "cpu", "link", "book"]) {
    if (!html.includes(`<nav-${icon}`) || !html.includes(`"icon":"nav-${icon}"`)) {
      failures.push(`${htmlPath} does not contain the ${icon} navigation icon`)
    }
  }

  if (/<(?:sparkles|cpu|book)(?:\s|>)|<link class="size-4|"icon":\{"displayName"/.test(html)) {
    failures.push(`${htmlPath} contains an unresolved navigation icon element`)
  }

  const calloutPath = `${prefix}getting-started/schema-edit.html`
  try {
    const calloutHtml = await readFile(path.join(outputRoot, calloutPath), "utf8")
    if (
      !calloutHtml.includes('role="note"') ||
      !calloutHtml.includes("--callout-color:var(--callout-caution)")
    ) {
      failures.push(`${calloutPath} does not contain the expected caution callout styling`)
    }
  } catch {
    failures.push(`Missing dist/${calloutPath}`)
  }

  if (locale !== DEFAULT_LOCALE) {
    const unprefixedQuickstart = `href="/${representativeDocument}"`
    if (html.includes(unprefixedQuickstart)) {
      failures.push(`${htmlPath} contains an unprefixed localized navigation link`)
    }
  }

  const selectedLanguageLabels = [
    ...html.matchAll(/aria-label="Select language"[^>]*>([\s\S]*?)<\/button>/g),
  ].map((match) => {
    const text = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return Object.values(LANGUAGE_LABELS).find((label) => text.includes(label)) ?? text
  })
  const expectedLanguageLabel = LANGUAGE_LABELS[locale]
  if (selectedLanguageLabels.length === 0) {
    failures.push(`${htmlPath} does not contain a language selector`)
  } else if (selectedLanguageLabels.some((label) => label !== expectedLanguageLabel)) {
    failures.push(
      `${htmlPath} language selector rendered ${selectedLanguageLabels.join(", ")} instead of ${expectedLanguageLabel}`,
    )
  }
}

for (const htmlFile of await collectFiles(outputRoot, (file) => file.endsWith(".html"))) {
  const html = await readFile(htmlFile, "utf8")
  if (/href="\/(?:es|fr|it)\/(?:en|es|fr|it)\//.test(html)) {
    failures.push(
      `${path.relative(outputRoot, htmlFile)} contains a repeated or mixed locale prefix`,
    )
  }
}

const cssFiles = await collectFiles(path.join(outputRoot, "assets"), (file) =>
  file.endsWith(".css"),
)
const compiledCss = (await Promise.all(cssFiles.map((file) => readFile(file, "utf8")))).join("\n")
for (const icon of ["sparkles", "cpu", "link", "book"]) {
  if (!compiledCss.includes(`nav-${icon}`)) {
    failures.push(`Compiled CSS is missing the nav-${icon} icon mask`)
  }
}
for (const variable of [
  "note",
  "tip",
  "info",
  "caution",
  "danger",
  "sparkles",
  "rocket",
  "settings",
  "zap",
  "lock",
  "megaphone",
]) {
  const occurrences = compiledCss.match(new RegExp(`--callout-${variable}:`, "g"))?.length ?? 0
  if (occurrences < 2) {
    failures.push(`Compiled CSS is missing light and dark --callout-${variable} definitions`)
  }
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    "Validated localized navigation, icons, callouts, Markdown, Pagefind, edit links and LLM outputs.",
  )
}
