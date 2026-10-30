import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("the downloadable case intake schema matches the guide", async () => {
  const guide = await readFile("pages/guides/case-intake-form.mdx", "utf8")
  const published = await readFile(
    "public/guides/assets/case-intake-form/case-intake.form0.json",
    "utf8",
  )

  const [, fence] = guide.match(/```json\n([\s\S]*?)\n\s*```/)
  const schema = fence.replace(/^ {3}/gm, "")

  assert.deepEqual(JSON.parse(published), JSON.parse(schema))
})
