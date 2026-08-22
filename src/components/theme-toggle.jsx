import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "zudoku/hooks"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      className="flex rounded-full border p-0.5 gap-0.5 group"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="rounded-full p-0.5 border border-transparent">
        <SunIcon size={16} />
      </div>
      <div className="rounded-full p-0.5 border border-transparent">
        <MoonIcon size={16} />
      </div>
    </button>
  )
}
