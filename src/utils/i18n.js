import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n/constants.js"
const DEFAULT_NAMESPACES = ["common", "docs"]
const EAGER_NAMESPACES = ["common", "docs"]
const LOCALE_STORAGE_KEY = "form0-docs:locale"
const PATHNAME_LOCALE_EXCLUSIONS = ["/api"]

const localeModules = import.meta.glob("../locales/*/*.json")
const eagerModules = import.meta.glob("../locales/*/{common,docs}.json", { eager: true })

const cache = new Map()
const inflight = new Map()
const listeners = new Set()
let currentLocale = DEFAULT_LOCALE
let formatterMap = {}

function isSupportedLocale(locale) {
  return Boolean(locale) && SUPPORTED_LOCALES.includes(locale)
}

function getLocaleFromPath(pathname = "") {
  const segments = pathname.split("/").filter(Boolean)
  if (!segments.length) return null
  const candidate = segments[0].toLowerCase()
  return isSupportedLocale(candidate) ? candidate : null
}

function detectNavigatorLocale() {
  if (typeof navigator === "undefined") return null
  const possible = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language]

  for (const lang of possible) {
    if (!lang) continue
    const code = lang.split("-")[0].toLowerCase()
    if (isSupportedLocale(code)) return code
  }

  return null
}

function getStoredLocale() {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistLocale(locale) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore storage errors
  }
}

function syncDocumentLang(locale) {
  if (typeof document === "undefined") return
  document.documentElement.lang = locale
}

function isPathExcluded(pathname) {
  return PATHNAME_LOCALE_EXCLUSIONS.some((prefix) => pathname.startsWith(prefix))
}

function syncPathLocale(locale) {
  if (typeof window === "undefined") return
  const { pathname, search, hash } = window.location

  if (isPathExcluded(pathname)) return

  const segments = pathname.split("/").filter(Boolean)
  const pathLocale = getLocaleFromPath(pathname)

  if (pathLocale) {
    segments.shift()
  }

  const trailing = segments.length ? `/${segments.join("/")}` : ""
  const nextPath = locale === DEFAULT_LOCALE ? `${trailing || "/"}` : `/${locale}${trailing || ""}`

  const normalizedPath = nextPath === "" ? "/" : nextPath
  const nextUrl = `${normalizedPath}${search}${hash}`

  if (nextUrl !== `${pathname}${search}${hash}`) {
    window.history.replaceState({}, "", nextUrl)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
}

function getLocaleCache(locale) {
  if (!cache.has(locale)) {
    cache.set(locale, {})
  }
  return cache.get(locale)
}

function seedEagerCaches() {
  Object.entries(eagerModules).forEach(([path, mod]) => {
    const match = path.match(/..\/locales\/([^/]+)\/([^/]+)\.json$/)
    if (!match) return
    const [, locale, namespace] = match
    const localeCache = getLocaleCache(locale)
    localeCache[namespace] = mod.default || mod
  })
}

seedEagerCaches()

function getNested(obj, path) {
  if (!obj || !path) return undefined
  return path.split(".").reduce((current, part) => (current ? current[part] : undefined), obj)
}

function replaceParams(template, params = {}) {
  if (typeof template !== "string") return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return String(params[key])
    }
    return match
  })
}

function applyFormatter(value, formatterName, params) {
  if (!formatterName) return value
  const formatter = formatterMap[formatterName]
  if (typeof formatter === "function") {
    return formatter(value, params)
  }
  return value
}

async function loadNamespace(locale, namespace) {
  const localeCache = getLocaleCache(locale)
  if (localeCache[namespace]) return localeCache[namespace]

  const cacheKey = `${locale}:${namespace}`
  if (inflight.has(cacheKey)) return inflight.get(cacheKey)

  const importer = localeModules[`../locales/${locale}/${namespace}.json`]
  if (!importer) {
    localeCache[namespace] = {}
    return localeCache[namespace]
  }

  const promise = importer()
    .then((mod) => {
      const messages = mod.default || mod
      localeCache[namespace] = messages
      return messages
    })
    .catch(() => {
      localeCache[namespace] = {}
      return localeCache[namespace]
    })
    .finally(() => inflight.delete(cacheKey))

  inflight.set(cacheKey, promise)
  return promise
}

async function ensureNamespaces(locale, namespaces) {
  const targetLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
  const loads = namespaces.map((ns) => loadNamespace(targetLocale, ns))
  await Promise.all(loads)

  if (targetLocale !== DEFAULT_LOCALE) {
    const fallbackLoads = namespaces.map((ns) => loadNamespace(DEFAULT_LOCALE, ns))
    await Promise.all(fallbackLoads)
  }
}

function namespacesCached(locale, namespaces) {
  const target = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
  const localeCache = getLocaleCache(target)
  return namespaces.every((ns) => Boolean(localeCache[ns]))
}

function applyLocale(target, namespaces, options = {}) {
  currentLocale = target
  persistLocale(target)
  syncDocumentLang(target)
  if (options.syncPath) {
    syncPathLocale(target)
  }
  // Skip notification if silent mode (used during React render phase to avoid
  // updating other components' state during render)
  if (!options.silent) {
    notifyLocale(target, namespaces)
  }
  return target
}

export function primeLocale(locale, namespaces = DEFAULT_NAMESPACES, options = {}) {
  const target = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
  if (namespacesCached(target, namespaces)) {
    applyLocale(target, namespaces, { silent: options.silent })
    return true
  }
  return false
}

function notifyLocale(locale) {
  listeners.forEach((listener) => listener(locale))
}

function resolveMessage(key, locale = currentLocale) {
  if (!key) return key
  const parts = key.split(".")
  if (parts.length < 2) return key
  const [namespace, ...rest] = parts
  const path = rest.join(".")

  const localeCache = getLocaleCache(locale)
  const fallbackCache = getLocaleCache(DEFAULT_LOCALE)

  const primary = getNested(localeCache[namespace], path)
  if (primary !== undefined) return primary

  if (locale !== DEFAULT_LOCALE) {
    const fallback = getNested(fallbackCache[namespace], path)
    if (fallback !== undefined) return fallback
  }

  return key
}

export function detectLocale(options = {}) {
  const { pathname, serverLocale, storedLocale } = options

  if (serverLocale && isSupportedLocale(serverLocale)) return serverLocale

  const pathLocale = getLocaleFromPath(
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  )
  if (pathLocale) return pathLocale

  const savedLocale = storedLocale ?? getStoredLocale()
  if (savedLocale && isSupportedLocale(savedLocale)) return savedLocale

  const browserLocale = detectNavigatorLocale()
  if (browserLocale && isSupportedLocale(browserLocale)) return browserLocale

  return DEFAULT_LOCALE
}

export async function setLocale(locale, options = {}) {
  const namespaces = options.namespaces || DEFAULT_NAMESPACES
  const target = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE

  if (namespacesCached(target, namespaces)) {
    return applyLocale(target, namespaces, options)
  }

  await ensureNamespaces(target, namespaces)
  return applyLocale(target, namespaces, options)
}

export function getLocale() {
  return currentLocale
}

export function getSupportedLocales() {
  return [...SUPPORTED_LOCALES]
}

export function onLocaleChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function configureFormatters(newFormatters = {}) {
  formatterMap = { ...formatterMap, ...newFormatters }
}

export function t(key, params = {}, options = {}) {
  const { locale, formatter } = options
  const value = resolveMessage(key, locale || currentLocale)
  const withParams = replaceParams(value, params)
  return applyFormatter(withParams, formatter, params)
}

export function tn(key, count, params = {}, options = {}) {
  const { locale, formatter } = options
  const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`
  const chosen = resolveMessage(pluralKey, locale || currentLocale)
  const base = chosen === pluralKey ? resolveMessage(key, locale || currentLocale) : chosen
  const withParams = replaceParams(base, { ...params, count })
  return applyFormatter(withParams, formatter, { ...params, count })
}

export function getLocaleFromUrl(pathname) {
  if (isPathExcluded(pathname)) return null
  return getLocaleFromPath(pathname)
}

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  DEFAULT_NAMESPACES,
  EAGER_NAMESPACES,
  LOCALE_STORAGE_KEY,
  PATHNAME_LOCALE_EXCLUSIONS,
}
