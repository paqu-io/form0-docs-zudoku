const get = (object, path) => path.split(".").reduce((current, part) => current?.[part], object)

const pathToMessageKey = (path) =>
  path
    .replace(/^\/+/, "")
    .replace(/\.[^/.]+$/, "")
    .replace(/\/+/g, ".")

const labelToNavKey = (label) =>
  label
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("")

export function createNavigationLabelResolver(bundlesByNamespace, defaultLocale) {
  const getBundle = (namespace, locale) =>
    bundlesByNamespace[namespace]?.[locale] || bundlesByNamespace[namespace]?.[defaultLocale] || {}

  return ({ file, label, locale }) => {
    const commonLabel = get(getBundle("common", locale), `nav.${labelToNavKey(label)}`)
    if (commonLabel) return commonLabel

    if (file) {
      const messageKey = `${pathToMessageKey(file)}.title`
      for (const namespace of ["docs", "api"]) {
        const title = get(getBundle(namespace, locale), messageKey)
        if (title) return title
      }
    }

    return label
  }
}
