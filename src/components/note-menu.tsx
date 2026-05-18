import { useEffect, useMemo, useRef } from "react"
import {
  AVAILABLE_TONICS_BY_ACCIDENTAL,
  convertTonicAccidental,
} from "@/lib/harmonic-field"
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"

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
      isDragging: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    }
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging || !scrollRef.current) return
    scrollRef.current.scrollLeft =
      dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.isDragging = false
    scrollRef.current?.releasePointerCapture(e.pointerId)
  }

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

      <div
        ref={scrollRef}
        className="no-scrollbar flex cursor-grab items-center gap-3 overflow-x-auto active:cursor-grabbing"
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
              onClick={() => void setQueryState({ note: n })}
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
    </div>
  )
}
