import { DEFAULT_LOCALE, getLocaleFromUrl, t } from "../utils/i18n.js"
import { resolvePageTitle } from "../seo/page-titles.js"
import { OG_SITE_NAME } from "../seo/site-titles.js"

function ogTitleForPath(pathname) {
  const locale = getLocaleFromUrl(pathname) || DEFAULT_LOCALE
  const pageTitle = resolvePageTitle(pathname)
  return pageTitle
    ? t("common.seo.titleTemplate", { page: pageTitle }, { locale })
    : t("common.seo.defaultTitle", {}, { locale })
}

export function createDocsSeoPlugin() {
  return {
    getHead: ({ location }) => {
      const ogTitle = ogTitleForPath(location.pathname)
      return (
        <>
          <meta property="og:site_name" content={OG_SITE_NAME} />
          <meta property="og:title" content={ogTitle} />
          <meta name="twitter:title" content={ogTitle} />
        </>
      )
    },
  }
}
