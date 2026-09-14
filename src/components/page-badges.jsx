import { Badge } from "zudoku/ui/Badge"
import { useLocation } from "zudoku/router"

import { badgesForPath } from "../navigation/page-badges.js"

export function PageBadges() {
  const { pathname } = useLocation()
  const badges = badgesForPath(pathname)

  if (badges.length === 0) return null

  return (
    <div className="mb-5 flex flex-wrap gap-2" aria-label="Documentation scope">
      {badges.map((label, index) => (
        <Badge key={label} variant={index === 0 ? "default" : "secondary"}>
          {label}
        </Badge>
      ))}
    </div>
  )
}
