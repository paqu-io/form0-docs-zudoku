import React from "react"
import { ChevronDown, Globe } from "lucide-react"
import { Button } from "zudoku/components"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "zudoku/ui/DropdownMenu.js"
import { useI18n } from "./i18n-provider.jsx"

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
]

export function LanguageSelector({
  size = "sm",
  locale: localeProp,
  onChange,
  showLabel = false,
}) {
  const ctx = useI18n()
  const locale = localeProp ?? ctx.locale
  const setLocale = onChange ?? ctx.setLocale

  const handleLanguageChange = (language) => {
    if (!language || language === locale) return
    setLocale(language)
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track("language-change", { locale: language, location: "header" })
    }
  }

  const currentLanguageLabel = LANGUAGES.find((lang) => lang.value === locale)?.label

  const labelClassName = showLabel ? "inline" : "hidden sm:inline"

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className="gap-1 px-2 py-1 text-sm font-medium leading-none"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span className={labelClassName}>{currentLanguageLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LANGUAGES.map((language) => (
          <DropdownMenuCheckboxItem
            key={language.value}
            checked={locale === language.value}
            onCheckedChange={() => handleLanguageChange(language.value)}
            className="pl-3 pr-8 [&>span]:left-auto [&>span]:right-2"
          >
            {language.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
