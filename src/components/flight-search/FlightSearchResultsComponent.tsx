import { useEffect, useCallback, useRef } from 'react'
import useFlightQueryParams from '../../hooks/useFlightQueryParams'
import type { Flight } from '../../models/flight.model'
import type { FlightSearchParams } from '../../hooks/useFlightSearch'
import type { FlightQueryWithSupplied } from '../../hooks/useFlightQueryParams'
import './FlightSearchResultsComponent.css'

type Props = {
  flights?: Flight[]
  onSelect?: (flight: Flight) => void
  className?: string
}

export default function FlightSearchResultsComponent({ flights = [], onSelect, className = '' }: Props) {
  // read the query (includes explicitlySuppliedValues) so we can inspect it
  const { query } = useFlightQueryParams()

  // Convert query (which includes explicitlySuppliedValues) into FlightSearchParams
  const applyQueryParams = (snapshot: FlightQueryWithSupplied): FlightSearchParams => {

    // default to page 1, perPage 8
    snapshot.page = snapshot.page ?? 1
    snapshot.perPage = snapshot.perPage ?? 8




    // const parseDate = (s?: string) => {
    //   if (!s) return undefined
    //   const d = new Date(s)
    //   return Number.isNaN(d.getTime()) ? undefined : d
    // }
    // const makeAirportParams = (val?: string) => {
    //   if (!val) return undefined
    //   const codes = val.split(',').map((c) => c.trim()).filter(Boolean)
    //   if (!codes.length) return undefined
    //   return { airportCodes: codes }
    // }
    const params: FlightSearchParams = {}
    // if (snapshot.origin) params.airportFromSearchParams = makeAirportParams(snapshot.origin)
    // if (snapshot.dest) params.airportToSearchParams = makeAirportParams(snapshot.dest)
    // if (snapshot.departFrom) params.departureDateFrom = parseDate(snapshot.departFrom)
    // if (snapshot.departTo) params.departureDateTo = parseDate(snapshot.departTo)
    // if (snapshot.returnFrom) params.arrivalDateFrom = parseDate(snapshot.returnFrom)
    // if (snapshot.returnTo) params.arrivalDateTo = parseDate(snapshot.returnTo)
    // const perPage = snapshot.perPage ? Number(snapshot.perPage) : undefined
    // if (perPage && Number.isFinite(perPage) && perPage > 0) {
    //   params.itemsFromBeginning = perPage
    // }
    return params
  }

  // Keep a ref to the last-seen query so we can compare current vs incoming
  const lastQueryRef = useRef<FlightQueryWithSupplied | null>(null)

  /**
   * Determine whether a transition from `prev` -> `next` should be
   * considered a "pagination-only" change. Per rules:
   * - compare all fields EXCEPT: 'departFrom', 'page', 'tab', 'explicitlySuppliedValues'
   * - return true only when either:
   *    a) the only change is the page number, OR
   *    b) the only change is departFrom transitioning from a concrete value -> blank
   */
  const checkIsPaginationOnlyChange = (prev: FlightQueryWithSupplied, next: FlightQueryWithSupplied): boolean => {
    const excluded = new Set(['departFrom', 'page', 'tab', 'explicitlySuppliedValues'])

    // collect all keys present on either object
    const keys = new Set<string>([...Object.keys(prev), ...Object.keys(next)])

    // check for any differences on non-excluded keys
    for (const k of keys) {
      if (excluded.has(k)) continue
      const a = (prev as Record<string, unknown>)[k]
      const b = (next as Record<string, unknown>)[k]
      const na = a == null ? '' : String(a)
      const nb = b == null ? '' : String(b)
      if (na !== nb) return false
    }

    // now check allowed changes
    const prevPage = prev.page ?? undefined
    const nextPage = next.page ?? undefined
    const pageChanged = (prevPage ?? 0) !== (nextPage ?? 0)

    const prevDepart = prev.departFrom ?? ''
    const nextDepart = next.departFrom ?? ''
    const departRemoved = prevDepart !== '' && nextDepart === ''

    // allowed: only page changed
    if (pageChanged && !departRemoved) return true
    // allowed: only departFrom concrete -> blank
    if (departRemoved && !pageChanged) return true

    return false
  }

  // Page_Load: run initialization side-effects once on mount
  const Page_Load = useCallback(() => {
    // small hook point for initialization (analytics, focus, debug)
    const snapshot = query
    const explicit = query.explicitlySuppliedValues
    const fsParams = applyQueryParams(snapshot as FlightQueryWithSupplied)
    console.debug('FlightSearchResultsComponent Page_Load — query snapshot:', snapshot)
    console.debug('FlightSearchResultsComponent Page_Load — explicitlySuppliedValues:', explicit)
    console.debug('FlightSearchResultsComponent Page_Load — derived FlightSearchParams:', fsParams)
  }, [query])

  useEffect(() => {
    Page_Load()
    // compare incoming query to last seen and log whether it's pagination-only
    const prev = lastQueryRef.current
    let isPaginationOnlyChange = false
    if (prev) {
      isPaginationOnlyChange = checkIsPaginationOnlyChange(prev, query as FlightQueryWithSupplied)
      console.debug('FlightSearchResultsComponent — isPaginationOnlyChange:', isPaginationOnlyChange)
    }
    // update last seen
    lastQueryRef.current = query as FlightQueryWithSupplied
    // run only once on mount (Page_Load is stable via useCallback)
  }, [Page_Load, query])
  if (!flights || flights.length === 0) {
    return <div className={`flight-search-results ${className}`}>No flights</div>
  }

  return (
    <div className={`flight-search-results ${className}`}>
      <ul>
        {flights.map((f) => (
          <li key={String(((f as unknown) as Record<string, unknown>).id ?? f.code)} className="flight-search-result-item" onClick={() => onSelect?.(f)}>
            <div className="flight-row-left">
              <div className="flight-code">{f.code}</div>
              <div className="flight-name">{f.name}</div>
            </div>
            <div className="flight-row-right">
              <div className="flight-route">{f.originAirportCode} → {f.destinationAirportCode}</div>
              <div className="flight-times">{new Date(f.departureTime).toLocaleString()} — {new Date(f.arrivalTime).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
