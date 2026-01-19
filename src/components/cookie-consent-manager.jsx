import { useEffect, useRef } from "react"
import * as cookieConsent from "vanilla-cookieconsent"

import { useI18n } from "./i18n-provider.jsx"
import {
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
} from "../utils/umami-config.js"
import en from "../locales/en/cookie-consent.json"
import es from "../locales/es/cookie-consent.json"
import fr from "../locales/fr/cookie-consent.json"
import it from "../locales/it/cookie-consent.json"

import "vanilla-cookieconsent/dist/cookieconsent.css"

const { run, setLanguage } = cookieConsent.default ?? cookieConsent

const guiOptions = {
  consentModal: {
    layout: "box",
    position: "bottom right",
    equalWeightButtons: true,
    flipButtons: false,
  },
  preferencesModal: {
    layout: "box",
    position: null,
    equalWeightButtons: true,
    flipButtons: false,
  },
}

const categories = {
  necessary: {
    enabled: true,
    readOnly: true,
  },
  analytics: {
    enabled: false,
    autoClear: {
      cookies: [
        { name: /^_ga/, path: "/" },
        { name: "_gid", path: "/" },
        { name: /^_gcl_/, path: "/" },
        { name: /^umami/, path: "/", domain: ".form0.dev" },
      ],
    },
  },
  // marketing: { enabled: false },
}

const activeCategories = Object.keys(categories)

function pruneTranslations(rawTranslations) {
  return Object.fromEntries(
    Object.entries(rawTranslations).map(([locale, value]) => {
      const copy = JSON.parse(JSON.stringify(value))
      if (copy?.preferencesModal?.sections) {
        copy.preferencesModal.sections = copy.preferencesModal.sections.filter(
          (section) =>
            !section.linkedCategory || activeCategories.includes(section.linkedCategory),
        )
      }
      return [locale, copy]
    }),
  )
}

const translations = pruneTranslations({ en, es, fr, it })

function ensureUmamiScriptTag() {
  if (typeof document === "undefined" || !UMAMI_WEBSITE_ID) return

  const selector = 'script[data-category="analytics"][data-service="Umami"]'
  if (document.querySelector(selector)) return

  const script = document.createElement("script")
  script.type = "text/plain"
  script.dataset.category = "analytics"
  script.dataset.service = "Umami"
  script.dataset.src = UMAMI_SCRIPT_SRC
  script.dataset.websiteId = UMAMI_WEBSITE_ID
  if (UMAMI_DOMAINS) {
    script.dataset.domains = UMAMI_DOMAINS
  }

  document.head.appendChild(script)
}

function syncDarkModeClass() {
  if (typeof document === "undefined") return () => {}
  const root = document.documentElement

  const update = () => {
    root.classList.toggle("cc--darkmode", root.classList.contains("dark"))
  }

  update()

  const observer = new MutationObserver(update)
  observer.observe(root, { attributes: true, attributeFilter: ["class"] })

  return () => observer.disconnect()
}

function buildConfig(locale) {
  return {
    revision: 1,
    cookie: {
      domain: ".form0.dev",
      expiresAfterDays: 182,
    },
    guiOptions,
    categories,
    disablePageInteraction: true,
    language: {
      default: locale,
      autoDetect: "browser",
      translations,
    },
    manageScriptTags: true,
    onModalReady: ({ modal }) => {
      modal.querySelector(".cm__btn--close")?.remove()
    },
  }
}

export function CookieConsentManager() {
  const { locale } = useI18n()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const cleanup = syncDarkModeClass()

    ensureUmamiScriptTag()
    run(buildConfig(locale))
    initializedRef.current = true

    return cleanup
  }, []) // run only once

  useEffect(() => {
    if (!initializedRef.current) return
    setLanguage(locale, true).catch(() => {
      // setLanguage is safe to ignore if the banner has not mounted yet
    })
  }, [locale])

  return null
}
