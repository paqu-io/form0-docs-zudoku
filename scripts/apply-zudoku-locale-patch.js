#!/usr/bin/env node
// Re-apply locale-aware navigation behavior to zudoku after installs.
// Keeps the existing useCurrentNavigation hook working when routes use `/xx/` prefixes.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const target = join(
  process.cwd(),
  "node_modules",
  "zudoku",
  "dist",
  "lib",
  "components",
  "context",
  "ZudokuContext.js",
)

if (!existsSync(target)) {
  console.warn("[zudoku-patch] Target file not found, skipping:", target)
  process.exit(0)
}

const source = readFileSync(target, "utf8")

// Idempotency check — if our locale logic is already present, do nothing.
if (source.includes("stripLocale") && source.includes("hasLocalePrefix")) {
  console.log("[zudoku-patch] Locale navigation patch already applied")
  process.exit(0)
}

const navBlockOriginal = `    const { getPluginNavigation, navigation } = useZudoku();
    const location = useLocation();
    const navItem = traverseNavigation(navigation, (item, parentCategories) => {
        if (getItemPath(item) === location.pathname) {
            return parentCategories.at(0) ?? item;
        }
    });`

const navBlockPatched = `    const { getPluginNavigation, navigation } = useZudoku();
    const location = useLocation();
    const stripLocale = (path) => {
        const match = path.match(/^\\/([a-z]{2})(\\/|$)/i);
        if (!match)
            return path;
        const trimmed = path.slice(match[0].length - 1);
        return trimmed === "" ? "/" : trimmed;
    };
    const hasLocalePrefix = /^\\/[a-z]{2}(\\/|$)/i.test(location.pathname);
    const normalizedPath = stripLocale(location.pathname);
    const navItem = traverseNavigation(navigation, (item, parentCategories) => {
        if (getItemPath(item) === normalizedPath) {
            return parentCategories.at(0) ?? item;
        }
    });`

const returnBlockOriginal = `    return {
        navigation: [
            ...(navItem?.type === "category" ? navItem.items : []),
            ...data,
        ],
        topNavItem,
    };
};`

const returnBlockPatched = `    return {
        navigation: hasLocalePrefix
            ? data
            : [...(navItem?.type === "category" ? navItem.items : []), ...data],
        topNavItem,
    };
};`

let next = source.replace(navBlockOriginal, navBlockPatched)
next = next.replace(returnBlockOriginal, returnBlockPatched)

if (next === source) {
  console.error("[zudoku-patch] Failed to apply patch — patterns not found")
  process.exit(1)
}

writeFileSync(target, next, "utf8")
console.log("[zudoku-patch] Locale navigation patch applied")
