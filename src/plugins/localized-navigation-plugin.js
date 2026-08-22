import { navigationDefinition } from "../navigation/navigation-definition.js"
import { localizeNavigation } from "../navigation/localize-navigation.js"
import { createNavigationLabelResolver } from "../navigation/navigation-labels.js"
import { getSectionIdFromCategory, getSectionIdFromPath } from "../navigation/site-sections.js"
import { DEFAULT_LOCALE, getLocaleFromUrl } from "../utils/i18n.js"

const namespaceModules = import.meta.glob("../locales/*/*.json", { eager: true })

const bundlesByNamespace = Object.entries(namespaceModules).reduce((acc, [path, mod]) => {
  const match = path.match(/..\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return acc
  const [, locale, namespace] = match
  if (!acc[namespace]) acc[namespace] = {}
  acc[namespace][locale] = mod.default || mod
  return acc
}, {})

const resolveLabel = createNavigationLabelResolver(bundlesByNamespace, DEFAULT_LOCALE)

export function createLocalizedNavigationPlugin() {
  return {
    getRoutes: () => [],
    getNavigation: async (path) => {
      const locale = getLocaleFromUrl(path) || DEFAULT_LOCALE
      const localized = localizeNavigation(navigationDefinition, locale, resolveLabel)
      const sectionId = getSectionIdFromPath(path)
      const section = localized.find((item) => getSectionIdFromCategory(item) === sectionId)
      return section?.type === "category" ? section.items : localized
    },
  }
}
