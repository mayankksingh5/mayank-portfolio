import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'

type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string }

/**
 * Runs `loader` on mount (and whenever it changes) and tracks loading/error
 * state. Pass a stable loader (module function or useCallback).
 */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    loader().then(
      (data) => {
        if (!cancelled) setState({ status: 'success', data, error: null })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', data: null, error: getErrorMessage(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [loader, reloadKey])

  const reload = useCallback(() => {
    setState({ status: 'loading', data: null, error: null })
    setReloadKey((key) => key + 1)
  }, [])

  return { ...state, reload }
}
