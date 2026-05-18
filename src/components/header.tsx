import { Music2 } from "lucide-react"

export function Header() {
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
    </header>
  )
}
