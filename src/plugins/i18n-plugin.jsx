import { useEffect } from "react"
import { useInRouterContext, useLocation } from "zudoku/router"
import { I18nProvider } from "../components/i18n-provider.jsx"
import { useSyncLocalePath, useUrlLocale } from "../hooks/use-locale-path.js"
import {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACES,
  getLocale,
  getLocaleFromUrl,
  setLocale,
} from "../utils/i18n.js"
import { CookieConsentManager } from "../components/cookie-consent-manager.jsx"

function syncLocaleFromPath(pathname, namespaces) {
  const urlLocale = getLocaleFromUrl(pathname) || DEFAULT_LOCALE
  if (urlLocale !== getLocale()) {
    void setLocale(urlLocale, { namespaces })
  }
}

function RouterLocaleSync({ namespaces }) {
  const location = useLocation()

  useEffect(() => {
    syncLocaleFromPath(location.pathname, namespaces)
  }, [location.pathname, namespaces])

  return null
}

export function createI18nPlugin(options = {}) {
  const preloadNamespaces = options.preloadNamespaces || DEFAULT_NAMESPACES

  const RoutedWrapper = ({ children }) => {
    const initialLocale = useUrlLocale()
    const syncPathToLocale = useSyncLocalePath()

    return (
      <I18nProvider
        preload={preloadNamespaces}
        initialLocale={initialLocale}
        onPathSync={syncPathToLocale}
      >
        <RouterLocaleSync namespaces={preloadNamespaces} />
        <CookieConsentManager />
        {children}
      </I18nProvider>
    )
  }

  const Wrapper = ({ children }) => {
    const inRouter = useInRouterContext()

    if (inRouter) {
      return <RoutedWrapper>{children}</RoutedWrapper>
    }

    return (
      <I18nProvider preload={preloadNamespaces}>
        <CookieConsentManager />
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
        if (typeof window === "undefined") return
        syncLocaleFromPath(to.pathname, preloadNamespaces)
      },
    },
  }
}
