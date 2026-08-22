import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n/constants.js"

const EXTERNAL_URL_PATTERN = /^[a-z][a-z\d+.-]*:|^\/\//i
const LOCALE_PREFIX_PATTERN = new RegExp(`^/?(?:${SUPPORTED_LOCALES.join("|")})(?=/|$)`, "i")

export const stripLocalePrefix = (path) =>
  path.replace(LOCALE_PREFIX_PATTERN, "").replace(/^\/+/, "")

export function localizePath(path, locale) {
  if (!path || EXTERNAL_URL_PATTERN.test(path)) return path
  if (path === "api" || path === "/api") return path

  const unprefixed = stripLocalePrefix(path)
  return locale === DEFAULT_LOCALE ? `/${unprefixed}` : `/${locale}/${unprefixed}`
}

const localizeFile = (file, locale) => {
  const unprefixed = stripLocalePrefix(file)
  return locale === DEFAULT_LOCALE ? unprefixed : `${locale}/${unprefixed}`
}

const localizeBadge = (badge, locale, resolveLabel) =>
  badge
    ? {
        ...badge,
        label: resolveLabel({ label: badge.label, locale, type: "badge" }),
      }
    : badge

function localizeItem(item, locale, resolveLabel) {
  const next = {
    ...item,
    label: item.label ? resolveLabel({ label: item.label, locale, type: item.type }) : item.label,
    badge: localizeBadge(item.badge, locale, resolveLabel),
  }

  if (item.type === "doc") {
    const file = localizeFile(item.file, locale)
    return {
      ...next,
      file,
      path: localizePath(item.path ?? item.file, locale),
      label: resolveLabel({
        file: stripLocalePrefix(item.file),
        label: item.label,
        locale,
        type: item.type,
      }),
    }
  }

  if (item.type === "link") {
    return { ...next, to: localizePath(item.to, locale) }
  }

  if (item.type === "category") {
    return {
      ...next,
      items: item.items.map((child) => localizeItem(child, locale, resolveLabel)),
      link: item.link ? localizeItem(item.link, locale, resolveLabel) : item.link,
    }
  }

  return next
}

export function localizeNavigation(items, locale, resolveLabel = ({ label }) => label) {
  const supportedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  return items.map((item) => localizeItem(item, supportedLocale, resolveLabel))
}
