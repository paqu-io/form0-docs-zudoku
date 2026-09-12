import { access, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"
import { allPageMetadata, canonicalUrl } from "../src/seo/page-metadata.js"

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
  "404.md",
  "llms.txt",
  "llms-full.txt",
  "robots.txt",
  "sitemap.xml",
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
  if (!llmsTxt.includes("## When to use form0 documentation")) {
    failures.push("llms.txt is missing explicit when-to-use guidance")
  }
  for (const banned of ["Questa è una prova", "dasdsadsa"]) {
    if (llmsTxt.includes(banned)) {
      failures.push(`llms.txt contains boilerplate page copy: ${banned}`)
    }
  }
}

try {
  const notFoundMarkdown = await readFile(path.join(outputRoot, "404.md"), "utf8")
  for (const target of [
    "https://docs.form0.dev/getting-started/quickstart.md",
    "https://docs.form0.dev/llms.txt",
    "https://docs.form0.dev/sitemap.xml",
  ]) {
    if (!notFoundMarkdown.includes(target)) {
      failures.push(`404.md is missing its recovery link to ${target}`)
    }
  }
} catch {
  // Missing output is already reported above.
}

let llmsFull = ""
try {
  llmsFull = await readFile(path.join(outputRoot, "llms-full.txt"), "utf8")
} catch {
  // Missing output is already reported above.
}
for (const banned of [
  "This page is not translated yet.",
  "Practical form0 guides will land here shortly.",
  "Questa è una prova",
  "dasdsadsa",
]) {
  if (llmsFull.includes(banned)) failures.push(`llms-full.txt contains excluded copy: ${banned}`)
}

try {
  const robots = await readFile(path.join(outputRoot, "robots.txt"), "utf8")
  if (!robots.includes("Sitemap: https://docs.form0.dev/sitemap.xml")) {
    failures.push("robots.txt does not advertise the canonical sitemap")
  }
  if (!robots.includes("Content-Signal: ai-train=no, search=yes, ai-input=yes")) {
    failures.push("robots.txt does not declare the expected Content Signals policy")
  }

  const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8")
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  const expected = allPageMetadata()
    .filter((page) => page.indexable)
    .map((page) => canonicalUrl(page.pathname))
  if (locations.length !== expected.length || expected.some((url) => !locations.includes(url))) {
    failures.push(
      `sitemap.xml contains ${locations.length} URLs instead of the ${expected.length} indexable documentation pages`,
    )
  }
} catch {
  failures.push("Unable to validate robots.txt and sitemap.xml")
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

  for (const icon of ["sparkles", "terminal", "cpu", "plug", "link", "book"]) {
    if (!html.includes(`<nav-${icon}`) || !html.includes(`"icon":"nav-${icon}"`)) {
      failures.push(`${htmlPath} does not contain the ${icon} navigation icon`)
    }
  }

  if (
    /<(?:sparkles|terminal|cpu|plug|book)(?:\s|>)|<link class="size-4|"icon":\{"displayName"/.test(
      html,
    )
  ) {
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
    const occurrences = html.split(unprefixedQuickstart).length - 1
    if (occurrences !== 1 || !html.includes(`${unprefixedQuickstart} data-discover="true"`)) {
      failures.push(
        `${htmlPath} must contain only the direct, non-redirecting English brand destination outside its localized navigation`,
      )
    }
  }

  const mdxPath = path.join(repositoryRoot, "pages", prefix, `${representativeDocument}.mdx`)
  let pageTitle
  try {
    const mdx = await readFile(mdxPath, "utf8")
    pageTitle = mdx.match(/^title:\s*(.+)$/m)?.[1]?.trim()
  } catch {
    pageTitle = undefined
  }
  if (pageTitle) {
    const expectedTabTitle = `form0 | docs · ${pageTitle}`
    const expectedOgTitle = commonMessages[locale].seo.titleTemplate.replace("{page}", pageTitle)
    if (!html.includes(`<title>${expectedTabTitle}</title>`)) {
      failures.push(`${htmlPath} does not contain tab title ${JSON.stringify(expectedTabTitle)}`)
    }
    if (!html.includes(`content="${expectedOgTitle}"`)) {
      failures.push(
        `${htmlPath} does not contain Open Graph title ${JSON.stringify(expectedOgTitle)}`,
      )
    }
  }

  if (!html.includes(`<html lang="${locale}">`)) {
    failures.push(`${htmlPath} does not declare its prerendered language as ${locale}`)
  }
  if (
    !html.includes(`rel="canonical" href="${canonicalUrl(`/${prefix}${representativeDocument}`)}"`)
  ) {
    failures.push(`${htmlPath} does not contain its canonical URL`)
  }
  for (const marker of [
    'name="robots" content="index, follow"',
    'property="og:description"',
    'property="og:url"',
    'property="og:image"',
    'name="twitter:card" content="summary_large_image"',
    'name="twitter:description"',
    'name="twitter:image"',
    'rel="describedby" href="https://docs.form0.dev/llms.txt"',
    'type="application/ld+json"',
  ]) {
    if (!html.includes(marker)) failures.push(`${htmlPath} is missing SEO marker ${marker}`)
  }

  if (html.includes('dangerouslysetinnerhtml="[object Object]"')) {
    failures.push(`${htmlPath} contains a serialized dangerouslySetInnerHTML attribute`)
  }

  const jsonLdBlocks = [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ]
  if (jsonLdBlocks.length !== 1) {
    failures.push(`${htmlPath} contains ${jsonLdBlocks.length} JSON-LD blocks instead of one`)
  }
  for (const [, jsonLd] of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(jsonLd.trim())
      if (parsed["@type"] !== "TechArticle") {
        failures.push(`${htmlPath} JSON-LD does not describe a TechArticle`)
      }
    } catch {
      failures.push(`${htmlPath} contains invalid JSON-LD`)
    }
  }

  if (!html.includes("localStorage.setItem(key, 'dark')")) {
    failures.push(`${htmlPath} is missing the executable default-theme script`)
  }
  for (const alternateLocale of SUPPORTED_LOCALES) {
    if (!html.includes(`hreflang="${alternateLocale}"`)) {
      failures.push(`${htmlPath} is missing its ${alternateLocale} substantive hreflang alternate`)
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

for (const page of allPageMetadata()) {
  const htmlPath = `${page.pathname.replace(/^\//, "")}.html`
  let html
  try {
    html = await readFile(path.join(outputRoot, htmlPath), "utf8")
  } catch {
    failures.push(`Missing dist/${htmlPath}`)
    continue
  }

  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length
  if (h1Count !== 1) failures.push(`${htmlPath} contains ${h1Count} H1 elements instead of one`)

  if (!page.indexable) {
    if (!html.includes('name="robots" content="noindex, follow"')) {
      failures.push(`${htmlPath} is not marked noindex, follow`)
    }
    if (/hreflang=/.test(html))
      failures.push(`${htmlPath} exposes hreflang for placeholder content`)
    if (/type="application\/ld\+json"/.test(html)) {
      failures.push(`${htmlPath} exposes article structured data for placeholder content`)
    }
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
for (const icon of ["sparkles", "terminal", "cpu", "plug", "link", "book"]) {
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
    "Validated localized navigation, metadata, heading hierarchy, sitemap, Markdown, Pagefind, edit links and filtered LLM outputs.",
  )
}
