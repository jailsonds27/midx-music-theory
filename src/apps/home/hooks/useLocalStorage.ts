import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const queryClient = useQueryClient()
  const queryKey = ["localStorage", key] as const

  const { data } = useQuery({
    queryKey,
    queryFn: () => getFromStorage<T>(key, fallback),
    initialData: () => getFromStorage<T>(key, fallback),
    staleTime: Infinity,
  })

  const { mutate } = useMutation({
    mutationFn: async (updater: T | ((prev: T) => T)) => {
      const prev = getFromStorage<T>(key, fallback)
      const next = updater instanceof Function ? updater(prev) : updater
      setToStorage(key, next)
      return next
    },
    onMutate: async (updater) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<T>(queryKey)
      queryClient.setQueryData<T>(queryKey, (old) => {
        const prev = old ?? fallback
        return updater instanceof Function ? updater(prev) : updater
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      mutate(updater)
    },
    [mutate]
  )

  return [data ?? fallback, setValue] as const
}
