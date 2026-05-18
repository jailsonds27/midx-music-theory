import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { HarmonicField } from "@/lib/harmonic-field"
import { X, Undo2 } from "lucide-react"
import { DEGREE_LABELS, ROMAN_NUMERALS } from "./useProgressionIndex"

type CustomDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  harmonic: HarmonicField
  draftDegrees: number[]
  handleToggleDegree: (degree: number) => void
  handleUndo: () => void
  confirmCustom: () => void
}

export function CustomDrawer({
  open,
  onOpenChange,
  harmonic,
  draftDegrees,
  handleToggleDegree,
  handleUndo,
  confirmCustom,
}: CustomDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle className="text-lg font-bold">
            Customizar Progressão
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="size-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Subtitle */}
        <p className="px-5 text-center text-sm text-muted-foreground">
          Toque nos graus para montar sua sequência harmônica
        </p>

        {/* Degree buttons */}
        <div className="mt-4 px-5">
          <div className="flex flex-wrap justify-center gap-5">
            {DEGREE_LABELS.map(({ degree, roman, label }) => {
              const chord = harmonic.chords[degree - 1]
              const isTonic = degree === 1

              return (
                <button
                  key={degree}
                  type="button"
                  onClick={() => handleToggleDegree(degree)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`relative flex size-14 items-center justify-center rounded-full border transition hover:border-foreground/40 ${
                      isTonic
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    <span
                      className={`absolute top-1 text-[8px] ${
                        isTonic
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {roman}
                    </span>
                    <span className="mt-1 text-[11px] font-bold">
                      {chord?.chord ?? "?"}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-5 px-5">
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Preview da Progressão
          </p>
          <div className="flex min-h-12 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
            {draftDegrees.length > 0 ? (
              Array.from(
                { length: Math.ceil(draftDegrees.length / 6) },
                (_, rowIdx) => {
                  const row = draftDegrees.slice(rowIdx * 6, rowIdx * 6 + 6)
                  return (
                    <div key={rowIdx} className="flex items-center gap-2">
                      {row.map((d, i) => {
                        const chord = harmonic.chords[d - 1]
                        const isTonic = d === 1
                        return (
                          <div
                            key={i}
                            className={`relative flex size-10 items-center justify-center rounded-full border ${
                              isTonic
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 text-[7px] ${
                                isTonic
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {ROMAN_NUMERALS[d - 1]}
                            </span>
                            <span className="mt-1 text-[10px] font-bold">
                              {chord?.chord ?? "?"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              )
            ) : (
              <span className="text-sm text-muted-foreground">
                Selecione os graus acima
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3 px-5 pb-5">
          <button
            onClick={confirmCustom}
            disabled={draftDegrees.length === 0}
            className="flex-1 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={draftDegrees.length === 0}
            className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <Undo2 className="size-4" />
            Desfazer
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
