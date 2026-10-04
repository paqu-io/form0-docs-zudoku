import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/i18n/constants.js"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pagesRoot = path.join(repositoryRoot, "pages")
const localizedLocales = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)
const untranslatedMarker = "This page is not translated yet."
const failures = []

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(target)
      return /\.mdx?$/.test(entry.name) ? [target] : []
    }),
  )
  return files.flat()
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const value = (key) => match?.[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim()
  return { title: value("title"), description: value("description") }
}

function body(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
}

function fencedCode(source) {
  return [...source.matchAll(/^```[^\n]*\r?\n[\s\S]*?^```\s*$/gm)].map((match) =>
    match[0].trimEnd(),
  )
}

function withoutFencedCode(source) {
  return source.replace(/^```[^\n]*\r?\n[\s\S]*?^```\s*$/gm, "")
}

function headings(source) {
  return withoutFencedCode(source)
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^(#{2,6})\s+/)
      return match ? [match[1].length] : []
    })
}

function inlineCode(source) {
  return [...withoutFencedCode(source).matchAll(/(?<!`)`([^`]+)`(?!`)/g)].map((match) =>
    match[1].replace(/\s+/g, " ").trim(),
  )
}

function components(source) {
  return [...withoutFencedCode(source).matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1])
}

function tableShapes(source) {
  const rows = withoutFencedCode(source)
    .split(/\r?\n/)
    .filter((line) => /^\s*\|.*\|\s*$/.test(line))
  return rows.map((row) => row.split("|").length - 2)
}

function links(source) {
  return [...withoutFencedCode(source).matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].map(
    (match) => match[1],
  )
}

function linkPaths(source) {
  return links(source).map((target) => target.split("#", 1)[0])
}

function headingText(line) {
  return line
    .replace(/^(?:#{1,6})\s+/, "")
    .replace(/\s+#+\s*$/, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
}

function headingAnchors(source) {
  const occurrences = new Map()

  return new Set(
    withoutFencedCode(source)
      .split(/\r?\n/)
      .filter((line) => /^(?:#{1,6})\s+/.test(line))
      .map((line) => {
        const base = headingText(line)
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
          .replace(/ /g, "-")
        const occurrence = occurrences.get(base) ?? 0
        occurrences.set(base, occurrence + 1)
        return occurrence === 0 ? base : `${base}-${occurrence}`
      }),
  )
}

function normalizeLocalizedTarget(target, locale) {
  if (!target.startsWith(`/${locale}/`)) return target
  return target.slice(locale.length + 1)
}

function compareArray(relativePath, locale, label, expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    failures.push(`${locale}/${relativePath}: ${label} differ from English`)
  }
}

const englishFiles = (await collectMarkdownFiles(pagesRoot)).filter((file) => {
  const relative = path.relative(pagesRoot, file).replace(/\\/g, "/")
  return !SUPPORTED_LOCALES.some((locale) => relative.startsWith(`${locale}/`))
})

for (const englishFile of englishFiles) {
  const relativePath = path.relative(pagesRoot, englishFile).replace(/\\/g, "/")
  const englishSource = await readFile(englishFile, "utf8")
  const temporary = relativePath === "guides/coming-soon.mdx"

  if (!temporary && (englishSource.match(/<PageBadges \/>/g) || []).length !== 1) {
    failures.push(`${relativePath}: expected exactly one PageBadges component`)
  }

  for (const locale of localizedLocales) {
    const localizedFile = path.join(pagesRoot, locale, relativePath)
    let localizedSource
    try {
      localizedSource = await readFile(localizedFile, "utf8")
    } catch {
      failures.push(`${locale}/${relativePath}: missing localized page`)
      continue
    }

    if (temporary) continue

    const localizedFrontmatter = frontmatter(localizedSource)
    if (!localizedFrontmatter.title || !localizedFrontmatter.description) {
      failures.push(`${locale}/${relativePath}: title and description are required`)
    }
    if (localizedSource.includes(untranslatedMarker) || /\(Coming soon\)/.test(localizedSource)) {
      failures.push(`${locale}/${relativePath}: contains untranslated placeholder copy`)
    }
    if ((localizedSource.match(/<PageBadges \/>/g) || []).length !== 1) {
      failures.push(`${locale}/${relativePath}: expected exactly one PageBadges component`)
    }

    const englishBody = body(englishSource)
    const localizedBody = body(localizedSource)
    compareArray(
      relativePath,
      locale,
      "heading hierarchy",
      headings(englishBody),
      headings(localizedBody),
    )
    compareArray(
      relativePath,
      locale,
      "fenced code",
      fencedCode(englishBody),
      fencedCode(localizedBody),
    )
    compareArray(
      relativePath,
      locale,
      "inline technical literals",
      inlineCode(englishBody),
      inlineCode(localizedBody),
    )
    compareArray(
      relativePath,
      locale,
      "MDX components",
      components(englishBody),
      components(localizedBody),
    )
    compareArray(
      relativePath,
      locale,
      "table shapes",
      tableShapes(englishBody),
      tableShapes(localizedBody),
    )
    compareArray(
      relativePath,
      locale,
      "link targets",
      linkPaths(englishBody),
      linkPaths(localizedBody).map((target) => normalizeLocalizedTarget(target, locale)),
    )
  }
}

const allMarkdownFiles = await collectMarkdownFiles(pagesRoot)
const pageSources = new Map()

for (const file of allMarkdownFiles) {
  const source = await readFile(file, "utf8")
  const pagePath = path
    .relative(pagesRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "")
  pageSources.set(`/${pagePath}`, source)
}

for (const file of allMarkdownFiles) {
  const source = await readFile(file, "utf8")
  const relativePath = path.relative(repositoryRoot, file).replace(/\\/g, "/")
  if (/\b(?:Reform|REFORM)\b/.test(source)) {
    failures.push(`${relativePath}: use lowercase reform`)
  }

  const currentRoute = `/${path
    .relative(pagesRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "")}`
  for (const target of links(source)) {
    const hashIndex = target.indexOf("#")
    if (hashIndex === -1 || /^[a-z][a-z+.-]*:/i.test(target)) continue

    const targetPath = target.slice(0, hashIndex)
    const encodedAnchor = target.slice(hashIndex + 1)
    const targetRoute = targetPath
      ? targetPath.startsWith("/")
        ? targetPath
        : path.posix.resolve(path.posix.dirname(currentRoute), targetPath)
      : currentRoute
    const targetSource = pageSources.get(targetRoute.replace(/\/$/, ""))
    let anchor
    try {
      anchor = decodeURIComponent(encodedAnchor)
    } catch {
      failures.push(`${relativePath}: invalid encoded anchor in ${target}`)
      continue
    }

    if (!targetSource) {
      failures.push(`${relativePath}: cannot validate anchor because ${targetRoute} does not exist`)
    } else if (!headingAnchors(targetSource).has(anchor)) {
      failures.push(`${relativePath}: anchor #${anchor} does not exist in ${targetRoute}`)
    }
  }
}

if (failures.length > 0) {
  console.error("Page parity validation failed:")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Validated page parity for ${englishFiles.length - 1} substantive documents across ${SUPPORTED_LOCALES.length} locales.`,
  )
}
