import { useCallback, useEffect, useRef, useState } from 'react'

// Temp/example: a small reusable pattern showing recommended practices for data hooks
// - returns data + loading + error
// - exposes stable action functions (load/refresh) via useCallback
// - supports autoLoad option and cancellation via AbortController
// Place in src/app/temp so it's isolated and non-invasive.

export type UseResourceResult<T> = {
  data: T[]
  loading: boolean
  error: Error | null
  load: (signal?: AbortSignal) => Promise<T[]>
  refresh: () => Promise<T[]>
}

export function useResource<T>(url: string, options?: { autoLoad?: boolean }): UseResourceResult<T> {
  const { autoLoad = true } = options ?? {}
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // keep a ref to the latest AbortController so we can cancel in-flight requests
  const controllerRef = useRef<AbortController | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    const controller = new AbortController()
    controllerRef.current = controller
    try {
      const resp = await fetch(url, { signal: signal ?? controller.signal })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
      const json = (await resp.json()) as T[]
      setData(json)
      return json
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        // request was aborted; keep previous data but do not mark as an app error
        return data
      }
      setError(err as Error)
      return []
    } finally {
      setLoading(false)
    }
  }, [url])

  const refresh = useCallback(() => {
    // cancel any in-flight request, then load again
    controllerRef.current?.abort()
    return load()
  }, [load])

  useEffect(() => {
    if (!autoLoad) return
    // auto-run on mount; we intentionally do not include `load` in deps if
    // you prefer the exact mount-only semantics; here `load` is stable
    // because it's memoized with useCallback.
    let mounted = true
    ;(async () => {
      // keep a local controller so the auto-load can be cancelled on unmount
      const c = new AbortController()
      controllerRef.current = c
      try {
        await load(c.signal)
      } catch (err) {
        if (mounted) {
          // load already sets error
        }
      }
    })()
    return () => {
      mounted = false
      controllerRef.current?.abort()
    }
  }, [autoLoad, load])

  return { data, loading, error, load, refresh }
}
