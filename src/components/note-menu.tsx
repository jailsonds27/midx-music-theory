import { useCallback, useEffect, useMemo, useRef } from "react"
import {
  AVAILABLE_TONICS_BY_ACCIDENTAL,
  convertTonicAccidental,
} from "@/lib/harmonic-field"
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { Minus, Plus } from "lucide-react"

const MODES = ["major", "minor"] as const
const CHROMATIC_TYPES = ["sharp", "flat"] as const

export function NoteMenu() {
  const [{ mode, accidental, note }, setQueryState] = useQueryStates({
    mode: parseAsStringLiteral(MODES).withDefault("major"),
    accidental: parseAsStringLiteral(CHROMATIC_TYPES).withDefault("sharp"),
    note: parseAsString.withDefault("C"),
  })

  const availableTonics = useMemo(
    () => AVAILABLE_TONICS_BY_ACCIDENTAL[accidental],
    [accidental]
  )

  const currentNote = useMemo(() => {
    if (availableTonics.includes(note)) return note
    return convertTonicAccidental(note, accidental)
  }, [note, accidental, availableTonics])

  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 })

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const el = container.querySelector<HTMLButtonElement>(
      `[data-note="${currentNote}"]`
    )

    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [currentNote])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    const el = scrollRef.current
    if (!el) return

    dragRef.current = {
      isDragging: false,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 5) {
      dragRef.current.isDragging = true
    }
    if (!dragRef.current.isDragging) return
    e.preventDefault()
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - dx
  }

  const onPointerUp = () => {
    dragRef.current.isDragging = false
  }

  const onNoteClick = (n: string) => {
    if (dragRef.current.isDragging) return
    void setQueryState({ note: n })
  }

  const goToPrev = useCallback(() => {
    const idx = availableTonics.indexOf(currentNote)
    const prevIdx = idx <= 0 ? availableTonics.length - 1 : idx - 1
    void setQueryState({ note: availableTonics[prevIdx] })
  }, [availableTonics, currentNote, setQueryState])

  const goToNext = useCallback(() => {
    const idx = availableTonics.indexOf(currentNote)
    const nextIdx = idx >= availableTonics.length - 1 ? 0 : idx + 1
    void setQueryState({ note: availableTonics[nextIdx] })
  }, [availableTonics, currentNote, setQueryState])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void setQueryState({ mode: "major" })}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "major"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            MAIOR
          </button>
          <button
            type="button"
            onClick={() => void setQueryState({ mode: "minor" })}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "minor"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            MENOR
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const converted = convertTonicAccidental(currentNote, "sharp")
              void setQueryState({ accidental: "sharp", note: converted })
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              accidental === "sharp"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            #
          </button>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            type="button"
            onClick={() => {
              const converted = convertTonicAccidental(currentNote, "flat")
              void setQueryState({ accidental: "flat", note: converted })
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              accidental === "flat"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            b
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goToPrev}
          className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-muted"
          aria-label="Nota anterior"
        >
          <Minus className="size-4" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex flex-1 cursor-grab items-center gap-3 overflow-x-auto active:cursor-grabbing"
          style={{ touchAction: "pan-x" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {availableTonics.map((n) => {
            const isSelected = n === currentNote
            const label = mode === "minor" ? `${n}m` : n

            return (
              <button
                key={n}
                data-note={n}
                type="button"
                onClick={() => onNoteClick(n)}
                className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "border border-border text-foreground"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={goToNext}
          className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-muted"
          aria-label="Próxima nota"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}
