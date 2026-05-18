import { useMemo } from "react"
import {
  convertTonicAccidental,
  getHarmonicField,
  type AccidentalType,
  type HarmonicMode,
} from "@/lib/harmonic-field"

type HarmonicFieldProps = {
  note: string
  mode: HarmonicMode
  accidental: AccidentalType
}

export function HarmonicField({ note, mode, accidental }: HarmonicFieldProps) {
  const tonic = useMemo(() => {
    return convertTonicAccidental(note, accidental)
  }, [accidental, note])

  const harmonicField = useMemo(
    () => getHarmonicField(tonic, mode, accidental),
    [mode, tonic, accidental]
  )

  const graphNodes = useMemo(() => {
    const total = harmonicField.chords.length

    return harmonicField.chords.map((item, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
      const radius = 38

      return {
        ...item,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
      }
    })
  }, [harmonicField.chords])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-4">
      <section>
        <div className="mb-3 flex items-center gap-8">
          <h2 className="text-lg font-semibold">
            {mode === "minor" ? `${harmonicField.tonic}m` : harmonicField.tonic}
          </h2>
          <p className="text-xs text-muted-foreground">
            {harmonicField.chords.map((item) => item.chord).join(" • ")}
          </p>
        </div>
        <div className="relative mx-auto mt-8 aspect-square w-full max-w-88">
          <div className="absolute inset-[12%] rounded-full border border-dashed border-border/60" />

          {graphNodes.map((node) => {
            const isTonic = node.degree === 1

            return (
              <div
                key={node.degree}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  className={`relative flex size-16 items-center justify-center rounded-full border shadow-sm ${
                    isTonic
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/95"
                  }`}
                >
                  <span
                    className={`absolute inset-x-0 top-1.5 text-center font-mono text-[9px] ${
                      isTonic
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {node.degree}º
                  </span>
                  <strong className="text-base leading-none">
                    {node.chord}
                  </strong>
                  <span
                    className={`absolute inset-x-0 bottom-1.5 text-center font-mono text-[9px] ${
                      isTonic
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {node.roman}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
