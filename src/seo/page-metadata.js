import pageMetadata from "./page-metadata-index.json" with { type: "json" }

export const DOCS_ORIGIN = "https://docs.form0.dev"
export const PROJECT_ORIGIN = "https://form0.dev"
export const LLMS_URL = `${DOCS_ORIGIN}/llms.txt`

export const OG_LOCALES = Object.freeze({
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
})

export function normalizeDocsPathname(pathname) {
  const clean = (pathname || "/").split("?")[0].split("#")[0].replace(/\/+$/, "")
  return clean || "/"
}

export function resolvePageMetadata(pathname) {
  return pageMetadata[normalizeDocsPathname(pathname)]
}

export function allPageMetadata() {
  return Object.values(pageMetadata)
}

export function sitemapExcludedPaths() {
  return allPageMetadata()
    .filter((page) => !page.indexable)
    .map((page) => page.pathname)
}

export function canonicalUrl(pathname) {
  return new URL(normalizeDocsPathname(pathname), `${DOCS_ORIGIN}/`).toString()
}

export function markdownUrl(pathname) {
  const path = normalizeDocsPathname(pathname)
  return path === "/" ? `${DOCS_ORIGIN}/index.md` : `${canonicalUrl(path)}.md`
}

export function socialImageUrl(locale) {
  const code = Object.hasOwn(OG_LOCALES, locale) ? locale : "en"
  return `${PROJECT_ORIGIN}/og/form0-${code}.png`
}
