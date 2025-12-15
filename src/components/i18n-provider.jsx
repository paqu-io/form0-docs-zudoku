import React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACES,
  PATHNAME_LOCALE_EXCLUSIONS,
  detectLocale,
  getLocale,
  getLocaleFromUrl,
  getSupportedLocales,
  onLocaleChange,
  primeLocale,
  setLocale as setI18nLocale,
  t as baseT,
  tn as baseTn,
} from "../utils/i18n.js"

const I18nContext = createContext({
  locale: "en",
  loading: true,
  t: (key) => key,
  tn: (key) => key,
  setLocale: async () => DEFAULT_NAMESPACES,
  preloadNamespaces: DEFAULT_NAMESPACES,
})

export function I18nProvider({ children, initialLocale, preload = DEFAULT_NAMESPACES }) {
  const detectedLocale = useMemo(() => initialLocale || detectLocale(), [initialLocale])
  const preloadRef = useRef(preload)
  const seeded = useMemo(
    // Use silent mode to avoid triggering notifyLocale during render phase
    // (which would cause "Cannot update component while rendering" errors)
    () => primeLocale(detectedLocale, preloadRef.current, { silent: true }),
    [detectedLocale],
  )
  const [locale, setLocaleState] = useState(detectedLocale)
  const [loading, setLoading] = useState(!seeded)

  useEffect(() => {
    preloadRef.current = preload
  }, [preload])

  useLayoutEffect(() => {
    if (seeded) return
    // useLayoutEffect runs after render, so it's safe to notify here
    const wasSeeded = primeLocale(detectedLocale, preloadRef.current)
    if (wasSeeded) {
      setLoading(false)
    }
  }, [detectedLocale, seeded])

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      // Use the URL locale if available, as it's the source of truth after navigation.
      // This prevents races where the locale state is stale after a remount.
      const urlLocale =
        typeof window !== "undefined" ? getLocaleFromUrl(window.location.pathname) : null
      const targetLocale = urlLocale || locale

      setLoading((prev) => prev)
      await setI18nLocale(targetLocale, { namespaces: preloadRef.current })
      if (!cancelled) {
        setLocaleState(getLocale())
        setLoading(false)
      }
    }

    boot()

    const unsubscribe = onLocaleChange((next) => {
      if (!cancelled) setLocaleState(next)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [locale])

  const handleLocaleChange = async (nextLocale) => {
    if (!nextLocale || nextLocale === locale) return nextLocale
    setLoading(true)
    const resolved = await setI18nLocale(nextLocale, {
      namespaces: preloadRef.current,
      // User intent: sync the URL prefix so navigation stays in step.
      syncPath: true,
    })
    setLocaleState(resolved)
    setLoading(false)
    return resolved
  }

  const value = useMemo(
    () => ({
      locale,
      loading,
      preloadNamespaces: preloadRef.current,
      t: (key, params, options) => baseT(key, params, { ...options, locale }),
      tn: (key, count, params, options) => baseTn(key, count, params, { ...options, locale }),
      setLocale: handleLocaleChange,
    }),
    [locale, loading],
  )

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return

    const { pathname, origin, search, hash } = window.location
    if (PATHNAME_LOCALE_EXCLUSIONS.some((prefix) => pathname.startsWith(prefix))) return

    const pathLocale = getLocaleFromUrl(pathname)
    const segments = pathname.split("/").filter(Boolean)
    if (pathLocale) segments.shift()
    const trailing = segments.length ? `/${segments.join("/")}` : "/"

    const hrefForLocale = (loc) => {
      const path = loc === DEFAULT_LOCALE ? trailing : `/${loc}${trailing === "/" ? "" : trailing}`
      return `${origin}${path}${search}${hash}`
    }

    document
      .querySelectorAll('link[rel="alternate"][data-hreflang]')
      .forEach((node) => node.remove())

    const locales = [...getSupportedLocales(), "x-default"]

    locales.forEach((loc) => {
      const link = document.createElement("link")
      link.setAttribute("rel", "alternate")
      link.setAttribute("data-hreflang", "true")
      link.setAttribute("hreflang", loc)
      link.setAttribute("href", loc === "x-default" ? hrefForLocale(DEFAULT_LOCALE) : hrefForLocale(loc))
      document.head.appendChild(link)
    })
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
