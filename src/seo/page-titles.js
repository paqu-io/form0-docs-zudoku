import pageTitles from "./page-title-index.json" with { type: "json" }

function normalizePathname(pathname) {
  const clean = (pathname || "/").split("?")[0].split("#")[0].replace(/\/+$/, "")
  return clean || "/"
}

export function resolvePageTitle(pathname) {
  const slug = normalizePathname(pathname).replace(/^\//, "")
  return slug ? pageTitles[slug] : undefined
}
