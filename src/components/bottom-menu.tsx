import { ListMusic, Music } from "lucide-react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { HOME_TABS } from "./bottom-menu.constants"

const MENU_ITEMS = [
  {
    value: "progression" as const,
    label: "Progressões",
    icon: ListMusic,
  },
  {
    value: "music" as const,
    label: "Musicas",
    icon: Music,
  },
]

export function BottomMenu() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(HOME_TABS).withDefault("progression")
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-4 py-4">
        {MENU_ITEMS.map((item) => {
          const selected = tab === item.value
          const Icon = item.icon

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => void setTab(item.value)}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-medium transition ${
                selected
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
