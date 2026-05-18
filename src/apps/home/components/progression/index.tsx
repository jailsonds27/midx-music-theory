import { useState, useMemo, useCallback, useSyncExternalStore } from "react"
import { useQueryState, parseAsString } from "nuqs"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  convertTonicAccidental,
  getHarmonicField,
  type AccidentalType,
  type HarmonicMode,
} from "@/lib/harmonic-field"
import { Plus, X, Undo2, Star, ArrowLeftRight } from "lucide-react"

const FAVORITES_KEY = "midx:favorite-progressions"

type FavoriteProgression = {
  name: string
  usedIn: string
}

function readFavoritesFromStorage(): FavoriteProgression[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? (JSON.parse(raw) as FavoriteProgression[]) : []
  } catch {
    return []
  }
}

let favoritesCache = readFavoritesFromStorage()

function getFavoritesSnapshot() {
  return favoritesCache
}

function setFavorites(favs: FavoriteProgression[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  favoritesCache = favs
  window.dispatchEvent(new Event("favorites-changed"))
}

const emptyFavorites: FavoriteProgression[] = []

function useFavorites() {
  const subscribe = useCallback((cb: () => void) => {
    const onStorage = () => {
      favoritesCache = readFavoritesFromStorage()
      cb()
    }
    window.addEventListener("favorites-changed", cb)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("favorites-changed", cb)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    () => emptyFavorites
  )

  const toggle = useCallback((name: string, usedIn: string) => {
    const current = getFavoritesSnapshot()
    const exists = current.some((f) => f.name === name)
    if (exists) {
      setFavorites(current.filter((f) => f.name !== name))
    } else {
      setFavorites([...current, { name, usedIn }])
    }
  }, [])

  const isFavorite = useCallback(
    (name: string) => favorites.some((f) => f.name === name),
    [favorites]
  )

  return { favorites, toggle, isFavorite }
}

type ProgressionProps = {
  note: string
  mode: HarmonicMode
  accidental: AccidentalType
}

type ProgressionData = {
  degrees: number[]
  name: string
  usedIn: string
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"]

const DEGREE_LABELS = [
  { degree: 1, roman: "I", label: "Tônica" },
  { degree: 2, roman: "II", label: "Super" },
  { degree: 3, roman: "III", label: "Mediante" },
  { degree: 4, roman: "IV", label: "Subdom." },
  { degree: 5, roman: "V", label: "Domin." },
  { degree: 6, roman: "VI", label: "Submed." },
  { degree: 7, roman: "VII", label: "Sensível" },
]

const PROGRESSIONS: ProgressionData[] = [
  {
    degrees: [1, 5, 6, 4],
    name: "I-V-VI-IV",
    usedIn: "Forró, Sertanejo (Tom Brasil)",
  },
  {
    degrees: [1, 4, 5, 1],
    name: "I-IV-V-I",
    usedIn: "Samba, Forró, Gospel (Clássico)",
  },
  {
    degrees: [1, 6, 4, 5],
    name: "I-VI-IV-V",
    usedIn: "Bossa Nova, MPB, Gospel Soul",
  },
  {
    degrees: [2, 5, 1, 1],
    name: "II-V-I-I",
    usedIn: "Jazz, Samba Jazz",
  },
  {
    degrees: [1, 3, 6, 4],
    name: "I-III-VI-IV",
    usedIn: "Axé, Funk Carioca",
  },
  {
    degrees: [1, 4, 1, 5],
    name: "I-IV-I-V",
    usedIn: "Sertanejo, Country",
  },
  {
    degrees: [6, 4, 1, 5],
    name: "VI-IV-I-V",
    usedIn: "Balada, Tropicália, Gospel",
  },
  {
    degrees: [1, 2, 6, 4],
    name: "I-II-VI-IV",
    usedIn: "Pop, Samba Contemporâneo",
  },
  {
    degrees: [1, 5, 4, 1],
    name: "I-V-IV-I",
    usedIn: "Forró Universitário, Funk",
  },
  {
    degrees: [3, 6, 2, 5],
    name: "III-VI-II-V",
    usedIn: "Choro, Jazz Brasileiro",
  },
  {
    degrees: [4, 5, 1, 1],
    name: "IV-V-I-I",
    usedIn: "Gospel, Evangélico (Power)",
  },
  {
    degrees: [1, 5, 1, 5],
    name: "I-V-I-V",
    usedIn: "Gospel Soul, Funk Gospel",
  },
]

function romanToDegrees(roman: string): number[] {
  return roman
    .split("-")
    .map((r) => ROMAN_NUMERALS.indexOf(r) + 1)
    .filter((d) => d > 0)
}

export function Progression({ note, mode, accidental }: ProgressionProps) {
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

  const tonic = useMemo(() => {
    return convertTonicAccidental(note, accidental)
  }, [note, accidental])

  const harmonic = useMemo(() => {
    return getHarmonicField(tonic, mode, accidental)
  }, [tonic, mode, accidental])

  const selectedProgData =
    selectedProgression >= 0 ? PROGRESSIONS[selectedProgression] : null
  const progressionNodes = selectedProgData
    ? selectedProgData.degrees.map((degree) => {
        const chord = harmonic.chords[degree - 1]
        return (
          chord ?? { degree, chord: "?", roman: "?", quality: "maj" as const }
        )
      })
    : []

  const degreesToRoman = (degrees: number[]) => {
    return degrees.map((d) => ROMAN_NUMERALS[d - 1]).join("-")
  }

  const degreesToChords = (degrees: number[]) => {
    return degrees.map((d) => harmonic.chords[d - 1]?.chord ?? "?").join(" • ")
  }

  const handleToggleDegree = (degree: number) => {
    setDraftDegrees((prev) => {
      return [...prev, degree]
    })
  }

  const handleConfirmCustom = () => {
    confirmCustom()
  }

  const customProgNodes = customDegrees.map((degree) => {
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

  return (
    <div className="mt-2 space-y-2">
      {/* PROGRESSÃO ATUAL - dark card */}
      <section className="relative rounded-2xl bg-foreground px-5 py-4 text-background">
        <p className="mb-1 text-[10px] font-semibold tracking-widest text-background/50 uppercase">
          Progressão Atual
        </p>
        <h2 className="text-2xl font-black tracking-tight">{displayName}</h2>
        <p className="mt-0.5 text-xs text-background/60">{displayUsedIn}</p>
        <button
          type="button"
          onClick={() => toggleFavorite(displayName, displayUsedIn)}
          className="absolute top-1/2 right-4 -translate-y-1/2 transition hover:scale-110"
          aria-label="Favoritar progressão"
        >
          <Star
            className={`size-5 ${
              isFavorite(displayName)
                ? "fill-background text-background"
                : "text-background/50"
            }`}
          />
        </button>
      </section>

      {/* Botões lado a lado */}
      <div className="my-2 flex gap-3">
        <Button
          onClick={() => setPresetsModalOpen(true)}
          variant="outline"
          className="flex-1 rounded-full py-4 text-xs font-semibold tracking-wide uppercase"
        >
          <ArrowLeftRight className="mr-1 size-4" />
          Trocar Progressão
        </Button>
        <Button
          onClick={() => {
            if (isCustomSelected) {
              setDraftDegrees(customDegrees)
            }
            setModalOpen(true)
          }}
          variant="outline"
          className="flex-1 rounded-full py-4 text-xs font-semibold tracking-wide uppercase"
        >
          <Plus className="mr-1 size-4" />
          Customizar
        </Button>
      </div>

      {/* Harmonic field info */}
      <div className="flex items-center gap-8">
        <h2 className="text-lg font-semibold">
          {mode === "minor" ? `${harmonic.tonic}m` : harmonic.tonic}
        </h2>
        <p className="text-xs text-muted-foreground">
          {harmonic.chords.map((item) => item.chord).join(" • ")}
        </p>
      </div>

      {/* Chord circles */}
      <section className="my-8 flex flex-wrap gap-5">
        {(isCustomSelected ? customProgNodes : progressionNodes).map(
          (node, idx) => {
            const isTonic = node.degree === 1

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
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
          }
        )}
      </section>

      {/* FAVORITOS */}
      <section>
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Favoritos
        </h3>
        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div
                key={fav.name}
                className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 transition hover:border-foreground/20"
              >
                <button
                  type="button"
                  onClick={() => void setProgressionParam(fav.name)}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-bold">{fav.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {degreesToChords(romanToDegrees(fav.name))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fav.usedIn}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(fav.name, fav.usedIn)}
                  className="shrink-0 p-1 transition hover:scale-110"
                  aria-label="Remover favorito"
                >
                  <Star className="size-4 fill-foreground text-foreground" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma progressão favoritada
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Clique na estrela da progressão selecionada para favoritar
            </p>
          </div>
        )}
      </section>

      {/* Drawer Outras Populares */}
      <Drawer open={presetsModalOpen} onOpenChange={setPresetsModalOpen}>
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
                <div className="text-xs text-muted-foreground">
                  {prog.usedIn}
                </div>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Drawer Customizada */}
      <Drawer
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setDraftDegrees([])
          }
        }}
      >
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
              onClick={handleConfirmCustom}
              disabled={draftDegrees.length === 0}
              className="flex-1 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setDraftDegrees((prev) => prev.slice(0, -1))}
              disabled={draftDegrees.length === 0}
              className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              <Undo2 className="size-4" />
              Desfazer
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
