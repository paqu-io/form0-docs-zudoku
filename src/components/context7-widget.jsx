import { useEffect } from "react"

import { appendContext7WidgetScript } from "../integrations/context7-widget.js"

export function Context7Widget() {
  useEffect(() => {
    appendContext7WidgetScript(document)
  }, [])

  return null
}
