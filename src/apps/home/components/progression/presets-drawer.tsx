import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { X } from "lucide-react"
import { PROGRESSIONS } from "./progression-data"

type PresetsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProgression: number
  isCustomSelected: boolean
  selectPreset: (idx: number) => void
  degreesToChords: (degrees: number[]) => string
}

export function PresetsDrawer({
  open,
  onOpenChange,
  selectedProgression,
  isCustomSelected,
  selectPreset,
  degreesToChords,
}: PresetsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle className="text-lg font-bold">
            Trocar Progressão
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="size-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {PROGRESSIONS.map((prog, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(idx)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedProgression === idx && !isCustomSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <div className="text-sm font-semibold">{prog.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                {degreesToChords(prog.degrees)}
              </div>
              <div className="text-xs text-muted-foreground">{prog.usedIn}</div>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
