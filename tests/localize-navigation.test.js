import assert from "node:assert/strict"
import test from "node:test"

import { navigationDefinition } from "../src/navigation/navigation-definition.js"
import { createNavigationLabelResolver } from "../src/navigation/navigation-labels.js"
import { localizeNavigation, localizePath } from "../src/navigation/localize-navigation.js"

const collect = (items, type) =>
  items.flatMap((item) => [
    ...(item.type === type ? [item] : []),
    ...(item.items ? collect(item.items, type) : []),
  ])

test("English document paths remain unprefixed", () => {
  const navigation = localizeNavigation(navigationDefinition, "en")

  for (const item of collect(navigation, "doc")) {
    assert.doesNotMatch(item.file, /^(?:en|es|fr|it)\//)
    assert.match(item.path, /^\/(?!en\/|es\/|fr\/|it\/)/)
  }
})

for (const locale of ["es", "fr", "it"]) {
  test(`${locale} document paths receive exactly one locale prefix`, () => {
    const navigation = localizeNavigation(navigationDefinition, locale)

    for (const item of collect(navigation, "doc")) {
      assert.match(item.file, new RegExp(`^${locale}/(?!${locale}/)`))
      assert.match(item.path, new RegExp(`^/${locale}/(?!${locale}/)`))
    }
  })
}

test("repeated and mixed localization calls cannot accumulate prefixes", () => {
  const french = localizeNavigation(navigationDefinition, "fr")
  const frenchAgain = localizeNavigation(french, "fr")
  const spanish = localizeNavigation(frenchAgain, "es")

  for (const item of collect(frenchAgain, "doc")) {
    assert.match(item.file, /^fr\/(?!fr\/)/)
    assert.doesNotMatch(item.file, /^(?:es|it)\//)
  }

  for (const item of collect(spanish, "doc")) {
    assert.match(item.file, /^es\/(?!es\/)/)
    assert.doesNotMatch(item.file, /^(?:fr|it)\//)
  }
})

test("external links remain untouched", () => {
  const navigation = localizeNavigation(navigationDefinition, "fr")
  const links = collect(navigation, "link")
  const externalLink = links.find(({ to }) => to === "https://zudoku.dev/docs/")

  assert.ok(externalLink)
  assert.equal(externalLink.to, "https://zudoku.dev/docs/")
  assert.equal(localizePath("mailto:hello@form0.dev", "fr"), "mailto:hello@form0.dev")
})

test("internal navigation links receive the locale prefix", () => {
  const navigation = localizeNavigation(navigationDefinition, "fr")
  const internalLink = collect(navigation, "link").find(
    ({ label }) => label === "Connector management",
  )

  assert.ok(internalLink)
  assert.equal(internalLink.to, "/fr/cli/connector-management")
})

test("documentation categories retain their order and hydration-safe icons", () => {
  const [documentation] = navigationDefinition

  assert.deepEqual(
    documentation.items.map(({ label, icon }) => [label, icon]),
    [
      ["Getting Started", "nav-sparkles"],
      ["CLI", "nav-terminal"],
      ["Starter apps", "nav-layout-template"],
      ["Core", "nav-cpu"],
      ["Bindings", "nav-blocks"],
      ["Connectors", "nav-plug"],
      ["Useful Links", "nav-link"],
    ],
  )
})

test("binding and connector technologies retain their navigation icons", () => {
  const [documentation] = navigationDefinition
  const starterApps = documentation.items.find(({ label }) => label === "Starter apps")
  const bindings = documentation.items.find(({ label }) => label === "Bindings")
  const connectors = documentation.items.find(({ label }) => label === "Connectors")

  assert.deepEqual(
    starterApps.items
      .filter(({ type }) => type === "category")
      .map(({ label, icon }) => [label, icon]),
    [["React + Vite", "nav-react"]],
  )

  assert.deepEqual(
    bindings.items
      .filter(({ type }) => type === "category")
      .map(({ label, icon }) => [label, icon]),
    [
      ["React", "nav-react"],
      ["React Native", "nav-react-native"],
    ],
  )
  assert.deepEqual(
    connectors.items
      .filter(({ label }) => ["PostgreSQL", "SQLite"].includes(label))
      .map(({ label, icon }) => [label, icon]),
    [
      ["PostgreSQL", "nav-postgresql"],
      ["SQLite", "nav-sqlite"],
    ],
  )
})

test("translation resolution has deterministic locale and English fallbacks", () => {
  const resolveLabel = createNavigationLabelResolver(
    {
      common: {
        en: { nav: { quickstart: "English quickstart" } },
        fr: { nav: { quickstart: "Démarrage rapide" } },
      },
      docs: {
        en: { core: { overview: { title: "English overview" } } },
      },
    },
    "en",
  )

  assert.equal(resolveLabel({ label: "Quickstart", locale: "fr" }), "Démarrage rapide")
  assert.equal(resolveLabel({ label: "Quickstart", locale: "it" }), "English quickstart")
  assert.equal(
    resolveLabel({ file: "core/overview", label: "Original", locale: "fr" }),
    "English overview",
  )
  assert.equal(resolveLabel({ label: "Untranslated", locale: "fr" }), "Untranslated")
})

test("the immutable source definition is never mutated", () => {
  const before = JSON.stringify(navigationDefinition)

  localizeNavigation(navigationDefinition, "fr", ({ label }) => `fr:${label}`)
  localizeNavigation(navigationDefinition, "es", ({ label }) => `es:${label}`)

  assert.equal(JSON.stringify(navigationDefinition), before)
  assert.ok(Object.isFrozen(navigationDefinition))
  assert.ok(Object.isFrozen(navigationDefinition[0].items))
})
