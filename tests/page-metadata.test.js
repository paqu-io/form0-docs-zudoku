import assert from "node:assert/strict"
import test from "node:test"

import {
  allPageMetadata,
  canonicalUrl,
  resolvePageMetadata,
  sitemapExcludedPaths,
} from "../src/seo/page-metadata.js"

test("all substantive translations are published and indexable", () => {
  const pages = allPageMetadata()
  const placeholders = pages.filter((page) => page.status === "untranslated")
  const temporary = pages.filter((page) => page.status === "temporary")

  assert.equal(placeholders.length, 0)
  assert.equal(temporary.length, 4)
  assert.ok(temporary.every((page) => !page.indexable))
  assert.equal(pages.filter((page) => page.indexable).length, 452)
  assert.ok(pages.filter((page) => page.indexable).every((page) => page.description))
  assert.deepEqual(
    new Set(sitemapExcludedPaths()),
    new Set(pages.filter((page) => !page.indexable).map((page) => page.pathname)),
  )
})

test("hreflang candidates contain all published translations", () => {
  const quickstart = resolvePageMetadata("/getting-started/quickstart/")
  const overview = resolvePageMetadata("/core/overview")

  assert.deepEqual(
    quickstart.alternates.map(({ locale }) => locale),
    ["en", "es", "fr", "it"],
  )
  assert.deepEqual(
    overview.alternates.map(({ locale }) => locale),
    ["en", "es", "fr", "it"],
  )
})

test("canonical URLs normalize trailing slashes", () => {
  assert.equal(
    canonicalUrl("/getting-started/quickstart/"),
    "https://docs.form0.dev/getting-started/quickstart",
  )
})
