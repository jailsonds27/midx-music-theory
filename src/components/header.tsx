import { Moon, Music2, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function Header() {
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-2">
        <Music2 className="size-6" />
        <h1 className="flex gap-3 text-lg font-bold">
          MIDX
          <span className="font-normal text-muted-foreground">
            Teoria musical
          </span>
        </h1>
      </div>
      <button onClick={toggleTheme}>
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
    </header>
  )
}
