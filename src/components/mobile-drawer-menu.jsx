import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"
import { Separator } from "zudoku/ui/Separator.js"
import { t } from "../utils/i18n.js"
import { useUrlLocale } from "../hooks/use-locale-path.js"
import { DrawerPreferences } from "./drawer-preferences.jsx"
import { SiteSectionLinks } from "./site-section-nav.jsx"

const SLOT_ATTR = "data-docs-drawer-slot"
const CLOSE_ATTR = "data-docs-drawer-close"

function findHeaderDrawer() {
  const drawer = [...document.querySelectorAll("[data-vaul-drawer]")].find((node) =>
    String(node.className).includes("w-[340px]"),
  )
  if (drawer && !drawer.hasAttribute("data-docs-header-drawer")) {
    drawer.setAttribute("data-docs-header-drawer", "")
  }
  return drawer
}

function findDrawerMounts() {
  const drawer = findHeaderDrawer()
  if (!drawer) return { menu: null, close: null }

  const scroller = drawer.querySelector(".overflow-y-auto")
  const list = scroller?.querySelector("ul")
  if (!scroller || !list) return { menu: null, close: null }

  let menu = scroller.querySelector(`[${SLOT_ATTR}]`)
  if (!menu) {
    menu = document.createElement("div")
    menu.setAttribute(SLOT_ATTR, "")
    menu.className = "px-5"
    scroller.insertBefore(menu, list)
  }

  let close = drawer.querySelector(`[${CLOSE_ATTR}]`)
  if (!close) {
    close = document.createElement("div")
    close.setAttribute(CLOSE_ATTR, "")
    drawer.appendChild(close)
  }
  close.className = "absolute top-4 right-4 z-50 pointer-events-auto"

  return { menu, close }
}

function closeHeaderDrawer() {
  document.querySelector("[data-vaul-overlay]")?.click()
}

function DrawerCloseButton() {
  const locale = useUrlLocale()

  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={closeHeaderDrawer}
      className="pointer-events-auto flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100"
      aria-label={t("common.drawer.close", {}, { locale })}
    >
      <XIcon className="size-4" />
      <span className="sr-only">{t("common.drawer.close", {}, { locale })}</span>
    </button>
  )
}

export function MobileDrawerMenu() {
  const [mounts, setMounts] = useState({ menu: null, close: null })

  useEffect(() => {
    const sync = () => setMounts(findDrawerMounts())
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {mounts.close ? createPortal(<DrawerCloseButton />, mounts.close) : null}
      {mounts.menu
        ? createPortal(
            <div className="flex flex-col pt-12 pb-6">
              <SiteSectionLinks variant="mobile" onNavigate={closeHeaderDrawer} />
              <Separator className="my-5" />
              <DrawerPreferences />
            </div>,
            mounts.menu,
          )
        : null}
    </>
  )
}
