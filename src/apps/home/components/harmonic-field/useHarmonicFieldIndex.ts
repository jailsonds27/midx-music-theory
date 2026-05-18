import { useMemo } from "react"
import {
  convertTonicAccidental,
  getHarmonicField,
  type AccidentalType,
  type HarmonicMode,
} from "@/lib/harmonic-field"

type UseHarmonicFieldProps = {
  note: string
  mode: HarmonicMode
  accidental: AccidentalType
}

export function useHarmonicFieldIndex({
  note,
  mode,
  accidental,
}: UseHarmonicFieldProps) {
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

  return {
    harmonicField,
    graphNodes,
    mode,
  }
}
