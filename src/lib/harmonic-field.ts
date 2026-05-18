export type HarmonicMode = "major" | "minor"
export type AccidentalType = "sharp" | "flat"

export type HarmonicChord = {
  degree: number
  roman: string
  quality: "maj" | "min" | "dim"
  chord: string
}

export type HarmonicField = {
  tonic: string
  mode: HarmonicMode
  scale: string[]
  chords: HarmonicChord[]
}

const CHROMATIC_SCALE_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const

const CHROMATIC_SCALE_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const

const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
}

const MAJOR_PATTERN = [2, 2, 1, 2, 2, 2, 1]
const MINOR_PATTERN = [2, 1, 2, 2, 1, 2, 2]

const TRIADS_BY_MODE: Record<HarmonicMode, Array<"maj" | "min" | "dim">> = {
  major: ["maj", "min", "min", "maj", "maj", "min", "dim"],
  minor: ["min", "dim", "maj", "min", "min", "maj", "maj"],
}

const ROMAN_BY_MODE: Record<HarmonicMode, string[]> = {
  major: ["I", "II", "III", "IV", "V", "VI", "VII°"],
  minor: ["I", "II°", "III", "IV", "V", "VI", "VII"],
}

export const AVAILABLE_TONICS_BY_ACCIDENTAL: Record<AccidentalType, string[]> =
  {
    sharp: [...CHROMATIC_SCALE_SHARP],
    flat: [...CHROMATIC_SCALE_FLAT],
  }

export const AVAILABLE_TONICS = AVAILABLE_TONICS_BY_ACCIDENTAL.sharp

function normalizeTonic(tonic: string): string {
  return FLAT_TO_SHARP[tonic] ?? tonic
}

function getScaleByAccidental(accidental: AccidentalType) {
  return accidental === "flat" ? CHROMATIC_SCALE_FLAT : CHROMATIC_SCALE_SHARP
}

function getChromaticIndex(tonic: string): number {
  const normalizedTonic = normalizeTonic(tonic)

  return CHROMATIC_SCALE_SHARP.indexOf(
    normalizedTonic as (typeof CHROMATIC_SCALE_SHARP)[number]
  )
}

function noteByAccidental(index: number, accidental: AccidentalType): string {
  const scale = getScaleByAccidental(accidental)
  return scale[index]
}

export function convertTonicAccidental(
  tonic: string,
  accidental: AccidentalType
): string {
  const index = getChromaticIndex(tonic)

  if (index === -1) {
    throw new Error(`Tônica inválida: ${tonic}`)
  }

  return noteByAccidental(index, accidental)
}

function getScaleNotes(
  tonic: string,
  mode: HarmonicMode,
  accidental: AccidentalType
): string[] {
  const rootIndex = getChromaticIndex(tonic)

  if (rootIndex === -1) {
    throw new Error(`Tônica inválida: ${tonic}`)
  }

  const pattern = mode === "major" ? MAJOR_PATTERN : MINOR_PATTERN
  const notes: string[] = [noteByAccidental(rootIndex, accidental)]

  let currentIndex = rootIndex
  for (let i = 0; i < 6; i += 1) {
    currentIndex = (currentIndex + pattern[i]) % CHROMATIC_SCALE_SHARP.length
    notes.push(noteByAccidental(currentIndex, accidental))
  }

  return notes
}

function formatChord(note: string, quality: "maj" | "min" | "dim"): string {
  if (quality === "maj") {
    return note
  }

  if (quality === "min") {
    return `${note}m`
  }

  return `${note}°`
}

export function getHarmonicField(
  tonic: string,
  mode: HarmonicMode,
  accidental: AccidentalType = "sharp"
): HarmonicField {
  const scale = getScaleNotes(tonic, mode, accidental)
  const qualities = TRIADS_BY_MODE[mode]
  const romans = ROMAN_BY_MODE[mode]

  const chords = scale.map((note, index) => {
    const quality = qualities[index]

    return {
      degree: index + 1,
      roman: romans[index],
      quality,
      chord: formatChord(note, quality),
    }
  })

  return {
    tonic: scale[0],
    mode,
    scale,
    chords,
  }
}
