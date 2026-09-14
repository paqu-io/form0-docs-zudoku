import { stripLocalePrefix } from "./localize-navigation.js"

const CALCULATION_CATEGORIES = new Map([
  ["if", "Logical"],
  ["and", "Logical"],
  ["or", "Logical"],
  ["count", "Logical"],
  ["counta", "Logical"],
  ["countblank", "Logical"],
  ["array", "Logical"],
  ["abs", "Math"],
  ["ceiling", "Math"],
  ["cos", "Math"],
  ["sin", "Math"],
  ["round", "Math"],
  ["upper", "String"],
  ["choicevalue", "Choice"],
  ["choicelabel", "Choice"],
  ["choicevalues", "Choice"],
  ["choicelabels", "Choice"],
  ["hasother", "Choice"],
  ["other", "Choice"],
  ["form", "Schema"],
  ["datanames", "Schema"],
  ["setresult", "Control"],
  ["eval", "Control"],
])

const GENERAL_CONNECTOR_PAGES = new Set([
  "connectors/overview",
  "connectors/choose",
  "connectors/direct-integration",
  "connectors/security",
  "connectors/troubleshooting",
])

const normalizePath = (pathname) => stripLocalePrefix(pathname || "").replace(/^\/+|\/+$/g, "")

export function badgesForPath(pathname) {
  const path = normalizePath(pathname)

  if (path.startsWith("getting-started/")) return ["CLI"]

  if (path.startsWith("cli/")) {
    return path.startsWith("cli/reform/") ? ["CLI", "reform"] : ["CLI"]
  }

  if (path === "starter-apps/overview") return ["Starter apps"]
  if (path.startsWith("starter-apps/react-vite/")) return ["React", "Vite"]
  if (path.startsWith("starter-apps/react-native-expo/")) return ["React Native", "Expo"]

  if (path.startsWith("core/schema/")) return ["Engine", "Schema"]
  if (path.startsWith("core/fields/")) return ["Engine", "Fields"]
  if (
    path === "core/builtins/index" ||
    path === "core/builtins/calculations-expressions-overview" ||
    path === "core/builtins/events-overview"
  ) {
    return ["Engine", "Builtins"]
  }
  if (path.startsWith("core/builtins/calculations-expressions/")) {
    const slug = path.split("/").at(-1)
    return ["Engine", CALCULATION_CATEGORIES.get(slug) || "Builtins"]
  }
  if (path.startsWith("core/builtins/events/")) return ["Engine", "Events"]
  if (path.startsWith("core/")) return ["Engine"]

  if (path === "bindings/overview") return ["Bindings"]
  if (path.startsWith("bindings/react-native/")) return ["React Native"]
  if (path.startsWith("bindings/react/")) return ["React"]

  if (GENERAL_CONNECTOR_PAGES.has(path)) return ["Connectors"]
  if (path.startsWith("connectors/postgresql/")) return ["Connectors", "PostgreSQL"]
  if (path.startsWith("connectors/sqlite/")) return ["Connectors", "SQLite"]

  return []
}
