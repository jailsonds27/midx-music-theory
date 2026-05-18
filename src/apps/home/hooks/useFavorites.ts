import { useCallback } from "react"
import { useLocalStorage } from "./useLocalStorage"

const FAVORITES_KEY = "midx:favorite-progressions"

export type FavoriteProgression = {
  name: string
  usedIn: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteProgression[]>(
    FAVORITES_KEY,
    []
  )

  const toggle = useCallback(
    (name: string, usedIn: string) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.name === name)
        if (exists) {
          return prev.filter((f) => f.name !== name)
        }
        return [...prev, { name, usedIn }]
      })
    },
    [setFavorites]
  )

  const isFavorite = useCallback(
    (name: string) => favorites.some((f) => f.name === name),
    [favorites]
  )

  return { favorites, toggle, isFavorite }
}
