import { Book, FolderCog, Link as LinkIcon, Sparkles } from "zudoku/icons"
import { DEFAULT_LOCALE, getLocale, getLocaleFromUrl, onLocaleChange } from "../utils/i18n.js"

const INTRO_PATH = "/introduction"
const API_PATH = "/api"

// Load every locale namespace eagerly so navigation labels can be resolved
// without waiting for the i18n provider to preload a specific namespace.
const namespaceModules = import.meta.glob("../locales/*/*.json", { eager: true })

const bundlesByNamespace = Object.entries(namespaceModules).reduce((acc, [path, mod]) => {
  const match = path.match(/..\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return acc
  const [, locale, namespace] = match
  if (!acc[namespace]) acc[namespace] = {}
  acc[namespace][`../locales/${locale}/${namespace}.json`] = mod
  return acc
}, {})

const getBundle = (namespace, locale) => {
  const bundles = bundlesByNamespace[namespace] || {}
  const key = `../locales/${locale}/${namespace}.json`
  const fallbackKey = `../locales/en/${namespace}.json`
  const resolved = bundles[key] || bundles[fallbackKey]
  return resolved?.default || resolved || {}
}

const getCommon = (locale) => getBundle("common", locale)
const getDocs = (locale) => getBundle("docs", locale)

// Priority namespaces to check for document titles; fall back to any other
// namespaces that exist (except "common", which is reserved for UI strings).
const PRIORITY_NAMESPACES = ["docs", "api"]
const getNamespaceOrder = () => {
  const order = new Set(PRIORITY_NAMESPACES)
  Object.keys(bundlesByNamespace)
    .filter((ns) => ns !== "common")
    .forEach((ns) => order.add(ns))
  return [...order]
}

const get = (obj, path, fallback) => {
  const parts = path.split(".")
  let current = obj
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part]
    } else {
      return fallback
    }
  }
  return current ?? fallback
}

const withLocalePrefix = (path, prefix) => {
  if (!prefix || prefix === "/") return path
  if (!path) return path
  // Skip external URLs and API path
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path === API_PATH || path === "api") return path
  if (path.startsWith(prefix)) return path
  // Ensure path starts with / before concatenating (Zudoku may strip leading slashes)
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${prefix}${normalizedPath}`
}

const stripPrefix = (path, prefix) => {
  if (!prefix || prefix === "/") return path
  return path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path
}

const pathToMessageKey = (path) =>
  path
    .replace(/^\/+/, "")
    .replace(/\/+/g, ".")
    .replace(/\.[^/.]+$/, "")

const getDocTitle = (slugKey, locale, fallbackLabel) => {
  for (const namespace of getNamespaceOrder()) {
    const bundle = getBundle(namespace, locale)
    const title = get(bundle, `${slugKey}.title`)
    if (title) return title
  }
  // Optional: allow nav.* overrides in common as a last resort
  const common = getCommon(locale)
  return get(common, `nav.${slugKey}`, fallbackLabel)
}

const buildNav = (localePrefix, locale) => {
  const prefix = localePrefix === "/" ? "" : localePrefix
  const common = getCommon(locale)
  const docs = getDocs(locale)
  const introductionLabel = get(docs, "introduction.title", "Introduction")

  return [
    {
      type: "category",
      label: get(common, "nav.gettingStarted", "Getting Started"),
      icon: Sparkles,
      items: [
        {
          type: "doc",
          label: introductionLabel,
          path: withLocalePrefix(INTRO_PATH, prefix),
        },
        {
          type: "link",
          icon: FolderCog,
          badge: {
            label: get(common, "nav.new", "New"),
            color: "purple",
          },
          label: get(common, "nav.api", "API Reference"),
          to: API_PATH,
        },
      ],
    },
    {
      type: "category",
      label: get(common, "nav.usefulLinks", "Useful Links"),
      collapsible: false,
      icon: LinkIcon,
      items: [
        {
          type: "link",
          icon: Book,
          label: get(common, "nav.zudokuDocs", "Zudoku Docs"),
          to: "https://zudoku.dev/docs/",
        },
      ],
    },
    {
      type: "link",
      to: API_PATH,
      label: get(common, "nav.api", "API Reference"),
    },
  ]
}

export function createLocalizedNavigationPlugin() {
  let baseNavigation = null
  let ctx = null
  let unsubscribeLocale = null

  const translateNavigation = (items, locale, prefix = "") =>
    items.map((item) => {
      const next = { ...item }

      if (next.label) {
        const common = getCommon(locale)
        if (next.label === "Documentation")
          next.label = get(common, "nav.documentation", "Documentation")
        if (next.label === "API Reference")
          next.label = get(common, "nav.api", "API Reference")
        if (next.label === "Getting Started")
          next.label = get(common, "nav.gettingStarted", "Getting Started")
        if (next.label === "Useful Links")
          next.label = get(common, "nav.usefulLinks", "Useful Links")
      }

      if (next.type === "doc" && next.path) {
        const normalizedPath = stripPrefix(next.path, prefix)
        const slugKey = pathToMessageKey(normalizedPath)
        next.label = getDocTitle(slugKey, locale, next.label)
        next.path = withLocalePrefix(next.path, prefix)
      }

      if (next.type === "link" && next.to) {
        next.to = withLocalePrefix(next.to, prefix)
      }

      if (next.type === "category" && next.link?.path) {
        next.link = { ...next.link, path: withLocalePrefix(next.link.path, prefix) }
      }

      if (next.type === "category" && Array.isArray(next.items)) {
        next.items = translateNavigation(next.items, locale, prefix)
      }

      return next
    })

  const applyNavigationLocale = (locale, forcePrefix = false) => {
    if (!ctx || !baseNavigation) return
    // Use locale prefix when:
    // 1. The locale is not the default (always prefix non-English)
    // 2. OR forcePrefix is true (explicit request to add prefix)
    // This ensures SSR and client render the same output.
    const prefix = locale !== DEFAULT_LOCALE || forcePrefix ? `/${locale}` : ""
    ctx.navigation = translateNavigation(baseNavigation, locale, prefix)
  }

  return {
    getRoutes: () => [],
    initialize: (context) => {
      ctx = context
      baseNavigation = context.navigation
      // Only apply navigation locale on the client.
      // On SSR, let getNavigation() handle it based on the request path
      // to ensure consistent hydration.
      if (typeof window !== "undefined") {
        const urlLocale = getLocaleFromUrl(window.location.pathname)
        const initial = urlLocale || getLocale() || DEFAULT_LOCALE
        applyNavigationLocale(initial)
        unsubscribeLocale = onLocaleChange((next) => applyNavigationLocale(next))
      }
    },
    events: {
      location: ({ to }) => {
        // Only handle location events on the client.
        // On SSR, getNavigation() handles navigation translation.
        if (typeof window === "undefined") return

        const urlLocale = getLocaleFromUrl(to.pathname)
        if (urlLocale) {
          applyNavigationLocale(urlLocale)
        } else {
          applyNavigationLocale(getLocale())
        }
      },
    },
    // For SSR and client route data fetching: set the navigation that should be used
    // for this path and return no extra items to avoid duplication.
    getNavigation: async (path, context) => {
      const localeFromUrl = getLocaleFromUrl(path)
      if (!baseNavigation) baseNavigation = context.navigation

      // Always translate navigation to get correct labels from locale files.
      // For default locale (English), use empty prefix; for others, use /${locale}.
      const locale = localeFromUrl || DEFAULT_LOCALE
      const prefix = localeFromUrl ? `/${locale}` : ""
      const nav = translateNavigation(baseNavigation, locale, prefix)
      context.navigation = nav
      return []
    },
  }
}
