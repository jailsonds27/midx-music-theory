import { HarmonicField } from "@/apps/home/components/harmonic-field"
import { BottomMenu } from "@/components/bottom-menu"
import { HOME_TABS } from "@/components/bottom-menu.constants"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  AVAILABLE_TONICS_BY_ACCIDENTAL,
  convertTonicAccidental,
} from "@/lib/harmonic-field"
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { useMemo } from "react"
import { Progression } from "../components/progression"
import { Header } from "@/components/header"

const MODES = ["major", "minor"] as const
const ACCIDENTALS = ["sharp", "flat"] as const

export default function HomePage() {
  const [{ tab, mode, accidental, note }, setQueryState] = useQueryStates({
    tab: parseAsStringLiteral(HOME_TABS).withDefault("progression"),
    mode: parseAsStringLiteral(MODES).withDefault("major"),
    accidental: parseAsStringLiteral(ACCIDENTALS).withDefault("sharp"),
    note: parseAsString.withDefault("C"),
  })

  const availableTonics = AVAILABLE_TONICS_BY_ACCIDENTAL[accidental]
  const currentNote = useMemo(() => {
    if (availableTonics.includes(note)) return note
    return convertTonicAccidental(note, accidental)
  }, [note, accidental, availableTonics])

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-24">
      <Header />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (!["progression", "harmonic"].includes(value)) {
            return
          }
          void setQueryState({ tab: value })
        }}
        className="w-full"
      >
        <TabsContent value="progression">
          <Progression note={currentNote} mode={mode} accidental={accidental} />
        </TabsContent>
        <TabsContent value="harmonic" className="mt-4">
          <HarmonicField
            note={currentNote}
            mode={mode}
            accidental={accidental}
          />
        </TabsContent>
      </Tabs>

      <BottomMenu />
    </main>
  )
}
