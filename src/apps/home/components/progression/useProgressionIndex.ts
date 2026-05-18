import { useState, useMemo } from "react"
import { useQueryState, parseAsString } from "nuqs"
import {
  convertTonicAccidental,
  getHarmonicField,
  type AccidentalType,
  type HarmonicMode,
  type HarmonicChord,
} from "@/lib/harmonic-field"
import { PROGRESSIONS } from "./progression-data"
import { useFavorites } from "@/apps/home/hooks/useFavorites"

export const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"]

export const DEGREE_LABELS = [
  { degree: 1, roman: "I", label: "Tônica" },
  { degree: 2, roman: "II", label: "Super" },
  { degree: 3, roman: "III", label: "Mediante" },
  { degree: 4, roman: "IV", label: "Subdom." },
  { degree: 5, roman: "V", label: "Domin." },
  { degree: 6, roman: "VI", label: "Submed." },
  { degree: 7, roman: "VII", label: "Sensível" },
]

function romanToDegrees(roman: string): number[] {
  return roman
    .split("-")
    .map((r) => ROMAN_NUMERALS.indexOf(r) + 1)
    .filter((d) => d > 0)
}

function degreesToRoman(degrees: number[]) {
  return degrees.map((d) => ROMAN_NUMERALS[d - 1]).join("-")
}

type ProgressionProps = {
  note: string
  mode: HarmonicMode
  accidental: AccidentalType
}

export function useProgressionIndex({
  note,
  mode,
  accidental,
}: ProgressionProps) {
  const [progressionParam, setProgressionParam] = useQueryState(
    "progression",
    parseAsString.withDefault(PROGRESSIONS[0].name)
  )

  const resolved = useMemo(() => {
    const idx = PROGRESSIONS.findIndex((p) => p.name === progressionParam)
    if (idx >= 0) {
      return { index: idx, custom: null as number[] | null }
    }
    const degrees = romanToDegrees(progressionParam)
    if (degrees.length > 0) {
      return { index: -1 as const, custom: degrees }
    }
    return { index: 0, custom: null as number[] | null }
  }, [progressionParam])

  const selectedProgression = resolved.index
  const customDegrees = resolved.custom ?? []

  const [draftDegrees, setDraftDegrees] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [presetsModalOpen, setPresetsModalOpen] = useState(false)
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()

  const tonic = useMemo(() => {
    return convertTonicAccidental(note, accidental)
  }, [note, accidental])

  const harmonic = useMemo(() => {
    return getHarmonicField(tonic, mode, accidental)
  }, [tonic, mode, accidental])

  const selectedProgData =
    selectedProgression >= 0 ? PROGRESSIONS[selectedProgression] : null

  const progressionNodes: HarmonicChord[] = selectedProgData
    ? selectedProgData.degrees.map((degree) => {
        const chord = harmonic.chords[degree - 1]
        return (
          chord ?? { degree, chord: "?", roman: "?", quality: "maj" as const }
        )
      })
    : []

  const customProgNodes: HarmonicChord[] = customDegrees.map((degree) => {
    const chord = harmonic.chords[degree - 1]
    return chord ?? { degree, chord: "?", roman: "?", quality: "maj" as const }
  })

  const isCustomSelected =
    selectedProgression === -1 && customDegrees.length > 0

  const displayName = isCustomSelected
    ? degreesToRoman(customDegrees)
    : (selectedProgData?.name ?? "")

  const displayUsedIn = isCustomSelected
    ? "Progressão customizada"
    : (selectedProgData?.usedIn ?? "")

  const degreesToChords = (degrees: number[]) => {
    return degrees.map((d) => harmonic.chords[d - 1]?.chord ?? "?").join(" • ")
  }

  const selectPreset = (idx: number) => {
    void setProgressionParam(PROGRESSIONS[idx].name)
    setDraftDegrees([])
    setModalOpen(false)
    setPresetsModalOpen(false)
  }

  const confirmCustom = () => {
    if (draftDegrees.length > 0) {
      void setProgressionParam(degreesToRoman(draftDegrees))
      setDraftDegrees([])
      setModalOpen(false)
    }
  }

  const handleToggleDegree = (degree: number) => {
    setDraftDegrees((prev) => [...prev, degree])
  }

  const handleUndo = () => {
    setDraftDegrees((prev) => prev.slice(0, -1))
  }

  const openCustomModal = () => {
    if (isCustomSelected) {
      setDraftDegrees(customDegrees)
    }
    setModalOpen(true)
  }

  const onCustomModalChange = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setDraftDegrees([])
    }
  }

  const selectFavorite = (name: string) => {
    void setProgressionParam(name)
  }

  return {
    // State
    harmonic,
    mode,
    draftDegrees,
    modalOpen,
    presetsModalOpen,
    favorites,
    selectedProgression,
    isCustomSelected,
    displayName,
    displayUsedIn,
    progressionNodes,
    customProgNodes,

    // Actions
    toggleFavorite,
    isFavorite,
    selectPreset,
    confirmCustom,
    handleToggleDegree,
    handleUndo,
    openCustomModal,
    onCustomModalChange,
    setPresetsModalOpen,
    selectFavorite,
    degreesToChords,
    romanToDegrees,
  }
}
