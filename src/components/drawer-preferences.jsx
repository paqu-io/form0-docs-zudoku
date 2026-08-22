import { LanguageSlot } from "./language-slot.jsx"
import { ThemeToggle } from "./theme-toggle.jsx"
import { t } from "../utils/i18n.js"
import { useUrlLocale } from "../hooks/use-locale-path.js"

export function DrawerPreferences() {
  const locale = useUrlLocale()

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/60 p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground/70">
          {t("common.language.label", {}, { locale })}
        </span>
        <LanguageSlot showLabel trackingLocation="drawer" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground/70">
          {t("common.theme.label", {}, { locale })}
        </span>
        <ThemeToggle />
      </div>
    </div>
  )
}
