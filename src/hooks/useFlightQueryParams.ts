import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type FlightQuery = {
  origin?: string
  dest?: string
  // support date ranges for departure and return
  departFrom?: string // ISO date YYYY-MM-DD
  departTo?: string // ISO date YYYY-MM-DD
  returnFrom?: string // ISO date YYYY-MM-DD
  returnTo?: string // ISO date YYYY-MM-DD
  page?: number
  pageSize?: number
  sort?: string
  tab?: 'criteria' | 'results'
  explicitlySuppliedValues: Record<string, string>
}


const toNumber = (v: string | null | undefined, fallback?: number) => {
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const parseParams = (sp: URLSearchParams): FlightQuery => {

  const explicitlySuppliedValues: Record<string, string> = {}
  for (const [k, v] of Array.from(sp.entries())) {
    explicitlySuppliedValues[k] = v
  }    

  const q: FlightQuery = { explicitlySuppliedValues : explicitlySuppliedValues }
  const origin = sp.get('origin')
  const dest = sp.get('dest')
  const departFrom = sp.get('departFrom')
  const departTo = sp.get('departTo')
  const returnFrom = sp.get('returnFrom')
  const returnTo = sp.get('returnTo')
  const page = toNumber(sp.get('page') ?? undefined)
  const pageSize = toNumber(sp.get('pageSize') ?? undefined)
  const sort = sp.get('sort') ?? undefined
  const tab = (sp.get('tab') as FlightQuery['tab']) ?? undefined

  if (origin) q.origin = origin
  if (dest) q.dest = dest
  if (departFrom) q.departFrom = departFrom
  if (departTo) q.departTo = departTo
  if (returnFrom) q.returnFrom = returnFrom
  if (returnTo) q.returnTo = returnTo
  if (page !== undefined) q.page = page
  if (pageSize !== undefined) q.pageSize = pageSize
  if (sort) q.sort = sort
  if (tab) q.tab = tab
  return q
}

const serialize = (q: FlightQuery): URLSearchParams => {
  const sp = new URLSearchParams()
  if (q.origin) sp.set('origin', q.origin)
  if (q.dest) sp.set('dest', q.dest)
  if (q.departFrom) sp.set('departFrom', q.departFrom)
  if (q.departTo) sp.set('departTo', q.departTo)
  if (q.returnFrom) sp.set('returnFrom', q.returnFrom)
  if (q.returnTo) sp.set('returnTo', q.returnTo)
  if (q.page !== undefined) sp.set('page', String(q.page))
  if (q.pageSize !== undefined) sp.set('pageSize', String(q.pageSize))
  if (q.sort) sp.set('sort', q.sort)
  if (q.tab) sp.set('tab', q.tab)
  return sp
}

export function useFlightQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const parsed = useMemo(() => parseParams(searchParams), [searchParams])

  const explicitlySuppliedValues = useMemo(() => {
    const obj: Record<string, string> = {}
    for (const [k, v] of Array.from(searchParams.entries())) {
      obj[k] = v
    }
    return obj
  }, [searchParams])

  const query: FlightQuery = useMemo(() => ({ ...parsed, explicitlySuppliedValues }), [parsed, explicitlySuppliedValues])

  const getQuery = useCallback(() => { return query }, [query])

  /**
   * Update query params by merging partial changes. By default this uses
   * replace (history.replaceState) to avoid creating a new history entry on
   * every small change; pass { replace: false } to push.
   */
  const setQuery = useCallback(
    (partial: Partial<FlightQuery>, opts: { replace?: boolean } = { replace: true }) => {
      const merged: FlightQuery = { ...query, ...partial }
      const sp = serialize(merged)
      setSearchParams(sp, { replace: !!opts.replace })
    },
    [query, setSearchParams]
  )

  const applyQuery = useCallback((partial: Partial<FlightQuery>) => setQuery(partial, { replace: false }), [setQuery])

  const resetQuery = useCallback(() => setSearchParams(new URLSearchParams(), { replace: false }), [setSearchParams])

  return { getQuery, setQuery, applyQuery, resetQuery }
}

export default useFlightQueryParams
