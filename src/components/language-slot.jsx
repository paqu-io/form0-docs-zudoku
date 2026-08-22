import { useCallback } from "react"
import { LanguageSelector } from "./dropdown-radio-group-language.jsx"
import { useSyncLocalePath, useUrlLocale } from "../hooks/use-locale-path.js"
import { setLocale as setGlobalLocale } from "../utils/i18n.js"

export function LanguageSlot({ showLabel = false } = {}) {
  const locale = useUrlLocale()
  const syncPath = useSyncLocalePath()

  const handleChange = useCallback(
    async (nextLocale) => {
      if (!nextLocale || nextLocale === locale) return
      await setGlobalLocale(nextLocale)
      syncPath(nextLocale)
    },
    [locale, syncPath],
  )

  return <LanguageSelector locale={locale} onChange={handleChange} showLabel={showLabel} />
}
