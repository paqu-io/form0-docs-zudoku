import { useEffect, useState, useCallback } from "react"
import { LanguageSelector } from "./dropdown-radio-group-language.jsx"
import { getLocale, onLocaleChange, setLocale as setGlobalLocale } from "../utils/i18n.js"

// Header slot uses the global i18n store directly to avoid nested providers and sync issues.
export function LanguageSlot({ showLabel = false } = {}) {
  const [locale, setLocaleState] = useState(getLocale())

  useEffect(() => {
    return onLocaleChange((next) => setLocaleState(next))
  }, [])

  const handleChange = useCallback(async (nextLocale) => {
    await setGlobalLocale(nextLocale, { syncPath: true })
    setLocaleState(nextLocale)
  }, [])

  return <LanguageSelector locale={locale} onChange={handleChange} showLabel={showLabel} />
}
