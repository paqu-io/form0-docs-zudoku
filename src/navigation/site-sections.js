import { localizePath, stripLocalePrefix } from "./localize-navigation.js"

export const DOCUMENTATION_SECTION = "documentation"
export const GUIDES_SECTION = "guides"

export const SITE_SECTIONS = [
  {
    id: DOCUMENTATION_SECTION,
    labelKey: "common.nav.documentation",
    path: "/getting-started/quickstart",
  },
  {
    id: GUIDES_SECTION,
    labelKey: "common.nav.guides",
    path: "/guides/coming-soon",
  },
]

const collectFiles = (item) => [
  ...(item?.type === "doc" && item.file ? [item.file] : []),
  ...(item?.items ? item.items.flatMap(collectFiles) : []),
]

const isGuidesFile = (file) => {
  const unprefixed = stripLocalePrefix(file)
  return unprefixed === "guides" || unprefixed.startsWith("guides/")
}

export function getSectionIdFromPath(pathname) {
  const unprefixed = stripLocalePrefix(pathname || "")
  return unprefixed === "guides" || unprefixed.startsWith("guides/")
    ? GUIDES_SECTION
    : DOCUMENTATION_SECTION
}

export function getSectionIdFromCategory(item) {
  return collectFiles(item).some(isGuidesFile) ? GUIDES_SECTION : DOCUMENTATION_SECTION
}

export function sectionHref(section, locale) {
  return localizePath(section.path, locale)
}
