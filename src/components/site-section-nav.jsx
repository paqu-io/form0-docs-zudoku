import { Link, useLocation } from "zudoku/router"
import { t } from "../utils/i18n.js"
import { useUrlLocale } from "../hooks/use-locale-path.js"
import { getSectionIdFromPath, sectionHref, SITE_SECTIONS } from "../navigation/site-sections.js"

export function SiteSectionLinks({ variant = "desktop", onNavigate } = {}) {
  const locale = useUrlLocale()
  const { pathname } = useLocation()
  const activeId = getSectionIdFromPath(pathname)

  if (variant === "mobile") {
    return (
      <nav className="flex flex-col gap-1.5">
        {SITE_SECTIONS.map((section) => {
          const isActive = section.id === activeId
          return (
            <Link
              key={section.id}
              to={sectionHref(section, locale)}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent/60 hover:text-foreground ${
                isActive ? "text-foreground" : "text-foreground/80"
              }`}
            >
              <span
                className={`relative inline-block ${
                  isActive
                    ? "after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-primary"
                    : ""
                }`}
              >
                {t(section.labelKey, {}, { locale })}
              </span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="text-sm">
      <ul className="flex flex-row items-center gap-8">
        {SITE_SECTIONS.map((section) => {
          const isActive = section.id === activeId
          return (
            <li key={section.id}>
              <Link
                to={sectionHref(section, locale)}
                className={`flex items-center gap-2 py-3.5 font-medium -mb-px relative ${
                  isActive
                    ? "text-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-foreground/75 hover:text-foreground"
                }`}
              >
                {t(section.labelKey, {}, { locale })}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function DesktopSectionTabs() {
  return (
    <div className="flex items-center px-8 h-[50px] text-sm">
      <SiteSectionLinks />
    </div>
  )
}

export function TopNavHeightFix() {
  return <style>{`@media (min-width: 1024px) { :root { --top-nav-height: 50px; } }`}</style>
}
