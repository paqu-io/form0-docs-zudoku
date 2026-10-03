import { showPreferences } from "vanilla-cookieconsent/dist/cookieconsent.esm.js"
import { DEFAULT_LOCALE } from "../i18n/constants.js"
import { t } from "../utils/i18n.js"
import { useUrlLocale } from "../hooks/use-locale-path.js"
import { BrandIcon, SOCIAL_LINKS } from "./brand-icons.jsx"

const FORM0_ORIGIN = "https://form0.dev"
const PAQU_IO_URL = "https://paqu.io"
const legalLinkClass = "text-xs text-muted-foreground/70 transition-colors hover:text-primary"
const dotClass = "text-xs text-muted-foreground/40"

// form0.dev and paqu.io share the locale-prefix scheme (`/es/privacy`).
function localizedHref(origin, path, locale) {
  if (locale === DEFAULT_LOCALE) return `${origin}${path}`
  return `${origin}/${locale}${path}`
}

export function SiteFooter() {
  const locale = useUrlLocale()
  const year = new Date().getFullYear()

  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-6 px-4 py-8 lg:px-8 sm:flex-row sm:justify-between">
        <div className="hidden sm:block sm:flex-1" />

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <a
              href={localizedHref(FORM0_ORIGIN, "/privacy", locale)}
              className={legalLinkClass}
              data-umami-event="nav-privacy"
              data-umami-event-location="footer"
            >
              {t("common.footer.privacy", {}, { locale })}
            </a>
            <span aria-hidden="true" className={dotClass}>
              ·
            </span>
            {/* One provider identity for paqu.io and the form0 sites, published on paqu.io. */}
            <a
              href={localizedHref(PAQU_IO_URL, "/legal-notice", locale)}
              className={legalLinkClass}
              data-umami-event="nav-legal-notice"
              data-umami-event-location="footer"
            >
              {t("common.footer.legalNotice", {}, { locale })}
            </a>
            <span aria-hidden="true" className={dotClass}>
              ·
            </span>
            <button type="button" onClick={() => showPreferences()} className={legalLinkClass}>
              {t("common.footer.manageCookies", {}, { locale })}
            </button>
          </div>

          <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-muted-foreground/70">
            <span>{t("common.footer.copyright", { year }, { locale })}</span>
            <span aria-hidden="true" className={dotClass}>
              ·
            </span>
            <span>
              {t("common.footer.madeBy", {}, { locale })}{" "}
              <a
                href={PAQU_IO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                paqu.io
              </a>
            </span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-5 sm:flex-1">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("common.footer.socialLabel", { network: social.label }, { locale })}
              title={social.label}
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
              data-umami-event="social-click"
              data-umami-event-network={social.id}
              data-umami-event-location="footer"
            >
              <BrandIcon id={social.id} className="size-5" labelled />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
