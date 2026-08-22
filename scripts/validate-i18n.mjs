import { readdir, readFile } from "node:fs/promises"

const DEFAULT_LOCALE = "en"
const localesUrl = new URL("../src/locales/", import.meta.url)

function flatten(value, path = "", result = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => flatten(entry, `${path}[${index}]`, result))
    return result
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value).sort()) {
      flatten(value[key], path ? `${path}.${key}` : key, result)
    }
    return result
  }

  const placeholders =
    typeof value === "string"
      ? [...value.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]).sort()
      : []
  result.set(path, placeholders)
  return result
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value))
}

const localeEntries = await readdir(localesUrl, { withFileTypes: true })
const locales = localeEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

if (!locales.includes(DEFAULT_LOCALE)) {
  throw new Error(`Missing default locale directory: ${DEFAULT_LOCALE}`)
}

const referenceFiles = (await readdir(new URL(`${DEFAULT_LOCALE}/`, localesUrl)))
  .filter((file) => file.endsWith(".json"))
  .sort()
const referenceFileSet = new Set(referenceFiles)
const errors = []

for (const locale of locales) {
  const localeUrl = new URL(`${locale}/`, localesUrl)
  const localeFiles = (await readdir(localeUrl)).filter((file) => file.endsWith(".json")).sort()
  const localeFileSet = new Set(localeFiles)

  for (const file of difference(referenceFileSet, localeFileSet)) {
    errors.push(`${locale}: missing namespace ${file}`)
  }
  for (const file of difference(localeFileSet, referenceFileSet)) {
    errors.push(`${locale}: unexpected namespace ${file}`)
  }

  for (const file of referenceFiles.filter((name) => localeFileSet.has(name))) {
    const [referenceRaw, localeRaw] = await Promise.all([
      readFile(new URL(`${DEFAULT_LOCALE}/${file}`, localesUrl), "utf8"),
      readFile(new URL(`${locale}/${file}`, localesUrl), "utf8"),
    ])
    const reference = flatten(JSON.parse(referenceRaw))
    const candidate = flatten(JSON.parse(localeRaw))
    const referenceKeys = new Set(reference.keys())
    const candidateKeys = new Set(candidate.keys())

    for (const key of difference(referenceKeys, candidateKeys)) {
      errors.push(`${locale}/${file}: missing key ${key}`)
    }
    for (const key of difference(candidateKeys, referenceKeys)) {
      errors.push(`${locale}/${file}: unexpected key ${key}`)
    }

    for (const key of referenceKeys) {
      if (!candidate.has(key)) continue
      const expected = reference.get(key).join(",")
      const actual = candidate.get(key).join(",")
      if (expected !== actual) {
        errors.push(`${locale}/${file}: placeholders differ at ${key} (${actual} vs ${expected})`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Locale validation failed:")
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Validated ${referenceFiles.length} namespaces across ${locales.length} locales.`)
}
