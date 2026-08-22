import { useCallback } from "react"
import { useLocation, useNavigate } from "zudoku/router"
import { DEFAULT_LOCALE, getLocaleFromUrl, getLocalizedPathname } from "../utils/i18n.js"

export function useUrlLocale() {
  const { pathname } = useLocation()
  return getLocaleFromUrl(pathname) || DEFAULT_LOCALE
}

export function useSyncLocalePath() {
  const location = useLocation()
  const navigate = useNavigate()

  return useCallback(
    (locale) => {
      const nextPath = getLocalizedPathname(location.pathname, locale)
      const nextUrl = `${nextPath}${location.search}${location.hash}`
      const currentUrl = `${location.pathname}${location.search}${location.hash}`
      if (nextUrl !== currentUrl) {
        navigate(nextUrl, { replace: true })
      }
    },
    [location.hash, location.pathname, location.search, navigate],
  )
}
