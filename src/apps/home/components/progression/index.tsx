import { Button } from "@/components/ui/button"
import type { AccidentalType, HarmonicMode } from "@/lib/harmonic-field"
import { Plus, Star, ArrowLeftRight } from "lucide-react"
import { useProgressionIndex } from "./useProgressionIndex"
import { PresetsDrawer } from "./presets-drawer"
import { CustomDrawer } from "./custom-drawer"

type ProgressionProps = {
  note: string
  mode: HarmonicMode
  accidental: AccidentalType
}

export function Progression({ note, mode, accidental }: ProgressionProps) {
  const {
    harmonic,
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
  } = useProgressionIndex({ note, mode, accidental })

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
          onClick={openCustomModal}
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
                  onClick={() => selectFavorite(fav.name)}
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
      <PresetsDrawer
        open={presetsModalOpen}
        onOpenChange={setPresetsModalOpen}
        selectedProgression={selectedProgression}
        isCustomSelected={isCustomSelected}
        selectPreset={selectPreset}
        degreesToChords={degreesToChords}
      />

      {/* Drawer Customizada */}
      <CustomDrawer
        open={modalOpen}
        onOpenChange={onCustomModalChange}
        harmonic={harmonic}
        draftDegrees={draftDegrees}
        handleToggleDegree={handleToggleDegree}
        handleUndo={handleUndo}
        confirmCustom={confirmCustom}
      />
    </div>
  )
}
