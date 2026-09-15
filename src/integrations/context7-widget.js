export const CONTEXT7_WIDGET_CONFIG = Object.freeze({
  src: "https://context7.com/widget.js",
  library: "/paqu-io/form0-docs-zudoku",
  color: "#e24414",
  position: "bottom-right",
  placeholder: "Ask about form0...",
  welcomeMessage:
    "Ask about form0 documentation. Questions are processed by Context7; don't include personal or confidential information.",
})

export function appendContext7WidgetScript(document) {
  const { src, library, color, position, placeholder, welcomeMessage } = CONTEXT7_WIDGET_CONFIG
  const selector = `script[src="${src}"][data-library="${library}"]`
  if (!document?.body || document.querySelector(selector)) return null

  const script = document.createElement("script")
  script.async = true
  script.src = src
  script.dataset.library = library
  script.dataset.color = color
  script.dataset.position = position
  script.dataset.placeholder = placeholder
  script.dataset.welcomeMessage = welcomeMessage
  document.body.appendChild(script)
  return script
}
