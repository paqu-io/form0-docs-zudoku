import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"
import test from "node:test"
import matter from "gray-matter"
import { createSchema, createYoga } from "graphql-yoga"

const require = createRequire(import.meta.url)

test("frontmatter retains YAML parsing and serialization after dependency fixes", () => {
  const source = `---
title: Record evaluation
description: |
  Validate closed rows.
  Preserve accepted values.
tags: [core, repeatable]
enabled: true
---
## Preparation
`
  const parsed = matter(source)
  assert.deepEqual(parsed.data, {
    title: "Record evaluation",
    description: "Validate closed rows.\nPreserve accepted values.\n",
    tags: ["core", "repeatable"],
    enabled: true,
  })
  assert.deepEqual(matter(matter.stringify(parsed.content, parsed.data)).data, parsed.data)
})

test("js-yaml's legacy CLI remains compatible with patched argparse", () => {
  const matterRequire = createRequire(require.resolve("gray-matter"))
  const cli = matterRequire.resolve("js-yaml/bin/js-yaml.js")
  const result = spawnSync(process.execPath, [cli], {
    input: "title: Record evaluation\nrows: [0, 1]\n",
    encoding: "utf8",
  })
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { title: "Record evaluation", rows: [0, 1] })
})

test("Zudoku's GraphQL dependencies still execute a query through Yoga", async () => {
  const yoga = createYoga({
    logging: false,
    graphiql: false,
    schema: createSchema({
      typeDefs: "type Query { documentation(locale: String!): String! }",
      resolvers: { Query: { documentation: (_, { locale }) => `docs:${locale}` } },
    }),
  })
  const response = await yoga.fetch("http://docs.invalid/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: "query Docs($locale: String!) { documentation(locale: $locale) }",
      variables: { locale: "fr" },
    }),
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { data: { documentation: "docs:fr" } })
})
