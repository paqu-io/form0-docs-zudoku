import React from "react"
import { useEffect } from "react"
import { useInRouterContext, useLocation } from "react-router"
import { I18nProvider } from "../components/i18n-provider.jsx"
import {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACES,
  getLocale,
  getLocaleFromUrl,
  setLocale,
} from "../utils/i18n.js"

function LocaleSync({ namespaces }) {
  // During SSR prerender there's no router; skip syncing.
  if (import.meta.env.SSR) return null

  const inRouter = useInRouterContext()
  if (!inRouter) return null

  const location = useLocation()

  useEffect(() => {
    const urlLocale = getLocaleFromUrl(location.pathname)
    const active = getLocale()

    if (urlLocale && urlLocale !== active) {
      void setLocale(urlLocale, { namespaces })
      return
    }

    if (!urlLocale && active !== DEFAULT_LOCALE) {
      void setLocale(active, { namespaces })
    }
  }, [location.pathname, namespaces])

  return null
}

export function createI18nPlugin(options = {}) {
  const preloadNamespaces = options.preloadNamespaces || DEFAULT_NAMESPACES

  const Wrapper = ({ children }) => {
    const inRouter = useInRouterContext()
    const location = inRouter ? useLocation() : null
    const initialLocale =
      (location && getLocaleFromUrl(location.pathname)) || DEFAULT_LOCALE

    return (
      <I18nProvider preload={preloadNamespaces} initialLocale={initialLocale}>
        {inRouter && <LocaleSync namespaces={preloadNamespaces} />}
        {children}
      </I18nProvider>
    )
  }

  return {
    getMdxComponents: () => ({
      wrapper: Wrapper,
    }),
    events: {
      location: ({ to }) => {
        // Only handle location events on the client to avoid SSR/hydration issues.
        if (typeof window === "undefined") return

        const urlLocale = getLocaleFromUrl(to.pathname)
        const active = getLocale()

        if (urlLocale && urlLocale !== active) {
          void setLocale(urlLocale, { namespaces: preloadNamespaces })
          return
        }

        if (!urlLocale && active !== DEFAULT_LOCALE) {
          void setLocale(active, { namespaces: preloadNamespaces })
        }
      },
    },
  }
}
