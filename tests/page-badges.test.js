import assert from "node:assert/strict"
import test from "node:test"

import { badgesForPath } from "../src/navigation/page-badges.js"

test("badges describe each documentation surface", () => {
  assert.deepEqual(badgesForPath("/getting-started/quickstart"), ["CLI"])
  assert.deepEqual(badgesForPath("/fr/cli/reform/sync-forms"), ["CLI", "reform"])
  assert.deepEqual(badgesForPath("/cli/ai-authoring/overview"), ["CLI"])
  assert.deepEqual(badgesForPath("/it/cli/ai-authoring/providers-models"), ["CLI"])
  assert.deepEqual(badgesForPath("/starter-apps/react-vite/create-run"), ["React", "Vite"])
  assert.deepEqual(badgesForPath("/es/starter-apps/react-native-expo/create-run"), [
    "React Native",
    "Expo",
  ])
  assert.deepEqual(badgesForPath("/core/schema/form"), ["Engine", "Schema"])
  assert.deepEqual(badgesForPath("/it/core/fields/catalog"), ["Engine", "Fields"])
  assert.deepEqual(badgesForPath("/core/builtins/calculations-expressions/round"), [
    "Engine",
    "Math",
  ])
  assert.deepEqual(badgesForPath("/core/builtins/calculations-expressions/dateadd"), [
    "Engine",
    "Date",
  ])
  assert.deepEqual(badgesForPath("/core/builtins/events/on"), ["Engine", "Events"])
  assert.deepEqual(badgesForPath("/bindings/react/form-renderer"), ["React"])
  assert.deepEqual(badgesForPath("/bindings/react-native/form-renderer"), ["React Native"])
  assert.deepEqual(badgesForPath("/connectors/postgresql/setup"), ["Connectors", "PostgreSQL"])
  assert.deepEqual(badgesForPath("/es/connectors/sqlite/storage"), ["Connectors", "SQLite"])
})

test("guides show the stack they use", () => {
  assert.deepEqual(badgesForPath("/guides/case-intake-form"), ["React", "Vite"])
  assert.deepEqual(badgesForPath("/es/guides/case-intake-form"), ["React", "Vite"])
})

test("unknown routes have no badges", () => {
  assert.deepEqual(badgesForPath("/api"), [])
  assert.deepEqual(badgesForPath("/getting-started/how-form0-compares"), [])
  assert.deepEqual(badgesForPath("/it/getting-started/how-form0-compares"), [])
})
