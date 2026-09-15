import assert from "node:assert/strict"
import test from "node:test"

import {
  appendContext7WidgetScript,
  CONTEXT7_WIDGET_CONFIG,
} from "../src/integrations/context7-widget.js"

function createDocument(existingScript = null) {
  const appended = []
  const script = { async: false, dataset: {} }

  return {
    appended,
    script,
    document: {
      body: { appendChild: (element) => appended.push(element) },
      createElement: (tagName) => {
        assert.equal(tagName, "script")
        return script
      },
      querySelector: () => existingScript,
    },
  }
}

test("loads the form0 Context7 widget asynchronously with the branded configuration", () => {
  const { document, appended, script } = createDocument()

  assert.equal(appendContext7WidgetScript(document), script)
  assert.deepEqual(appended, [script])
  assert.equal(script.async, true)
  assert.equal(script.src, CONTEXT7_WIDGET_CONFIG.src)
  assert.deepEqual(script.dataset, {
    library: "/paqu-io/form0-docs-zudoku",
    color: "#e24414",
    position: "bottom-right",
    placeholder: "Ask about form0...",
    welcomeMessage:
      "Ask about form0 documentation. Questions are processed by Context7; don't include personal or confidential information.",
  })
})

test("does not load another Context7 widget script when one already exists", () => {
  const existingScript = {}
  const { document, appended } = createDocument(existingScript)

  assert.equal(appendContext7WidgetScript(document), null)
  assert.deepEqual(appended, [])
})
