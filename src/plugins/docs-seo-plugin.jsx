import { DEFAULT_LOCALE, getLocaleFromUrl, t } from "../utils/i18n.js"
import {
  canonicalUrl,
  LLMS_URL,
  OG_LOCALES,
  PROJECT_ORIGIN,
  resolvePageMetadata,
  socialImageUrl,
} from "../seo/page-metadata.js"
import { OG_SITE_NAME } from "../seo/site-titles.js"

function ogTitleForPath(pathname, page) {
  const locale = getLocaleFromUrl(pathname) || DEFAULT_LOCALE
  return page?.title
    ? t("common.seo.titleTemplate", { page: page.title }, { locale })
    : t("common.seo.defaultTitle", {}, { locale })
}

function articleJsonLd(page, url) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: page.title,
    description: page.description,
    url,
    mainEntityOfPage: url,
    inLanguage: page.locale,
    isPartOf: { "@id": `${PROJECT_ORIGIN}/#website` },
    about: { "@id": `${PROJECT_ORIGIN}/#software` },
    author: { "@id": `${PROJECT_ORIGIN}/#publisher` },
    publisher: { "@id": `${PROJECT_ORIGIN}/#publisher` },
  }
}

export function createDocsSeoPlugin() {
  return {
    getHead: ({ location }) => {
      const page = resolvePageMetadata(location.pathname)
      const ogTitle = ogTitleForPath(location.pathname, page)
      const locale = page?.locale || getLocaleFromUrl(location.pathname) || DEFAULT_LOCALE
      const url = canonicalUrl(location.pathname)
      const image = socialImageUrl(locale)
      const alternates = page?.alternates || []
      const hasTranslations = alternates.length > 1

      return (
        <>
          <meta name="robots" content={page?.indexable ? "index, follow" : "noindex, follow"} />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content={OG_SITE_NAME} />
          <meta property="og:title" content={ogTitle} />
          {page?.description && <meta property="og:description" content={page.description} />}
          <meta property="og:url" content={url} />
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={`${OG_SITE_NAME} documentation`} />
          <meta property="og:locale" content={OG_LOCALES[locale] || OG_LOCALES.en} />
          {hasTranslations &&
            alternates
              .filter((alternate) => alternate.locale !== locale)
              .map((alternate) => (
                <meta
                  key={`og-${alternate.locale}`}
                  property="og:locale:alternate"
                  content={OG_LOCALES[alternate.locale]}
                />
              ))}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogTitle} />
          {page?.description && <meta name="twitter:description" content={page.description} />}
          <meta name="twitter:image" content={image} />
          <meta name="twitter:image:alt" content={`${OG_SITE_NAME} documentation`} />
          <link rel="describedby" href={LLMS_URL} />
          {hasTranslations &&
            alternates.map((alternate) => (
              <link
                key={alternate.locale}
                rel="alternate"
                hrefLang={alternate.locale}
                href={canonicalUrl(alternate.pathname)}
              />
            ))}
          {hasTranslations && (
            <link
              rel="alternate"
              hrefLang="x-default"
              href={canonicalUrl(
                alternates.find((alternate) => alternate.locale === DEFAULT_LOCALE)?.pathname ||
                  page.pathname,
              )}
            />
          )}
          {page?.indexable && page.title && page.description && (
            <script type="application/ld+json">
              {JSON.stringify(articleJsonLd(page, url)).replace(/</g, "\\u003c")}
            </script>
          )}
        </>
      )
    },
  }
}
