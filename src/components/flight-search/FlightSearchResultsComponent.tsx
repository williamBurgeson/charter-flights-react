import { useEffect, useCallback, useRef, useState } from 'react'
import useFlightQueryParams from '../../hooks/useFlightQueryParams'
import type { Flight } from '../../models/flight.model'
import { useFlightSearch, type FlightSearchParams } from '../../hooks/useFlightSearch'
import type { FlightQuery } from '../../hooks/useFlightQueryParams'
import './FlightSearchResultsComponent.css'

type Props = {
  flights?: Flight[]
  onSelect?: (flight: Flight) => void
  className?: string
}

export default function FlightSearchResultsComponent({ flights = [], onSelect, className = '' }: Props) {
  // read the query (includes explicitlySuppliedValues) so we can inspect it
  const { getQuery } = useFlightQueryParams()

  // Keep a ref to the last-seen query so we can compare current vs incoming
  const lastQueryRef = useRef<FlightQuery | null>(null)
  // Keep a timestamp of when we last recorded the query snapshot. This lets
  // us expire old snapshots (see timeout logic below).
  const lastQueryAtRef = useRef<number | null>(null)
  const { searchFlights } = useFlightSearch()
  
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null)
  const [flightsToDisplay, setFlightsToDisplay] = useState<Flight[]>([])

  // timeout in minutes after which a previous snapshot is considered stale
  const TIMEOUT_MINUTES = 10
  const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000

  // Convert query (which includes explicitlySuppliedValues) into FlightSearchParams
  const applyQueryParams = useCallback((snapshot: FlightQuery): FlightSearchParams => {

    const prev = lastQueryRef.current as FlightQuery | null
    let isPaginationOnlyChange = false
    const now = Date.now()

    

    if (prev && lastQueryAtRef.current) {
      const age = now - lastQueryAtRef.current
      if (age <= TIMEOUT_MS) {
        // recent enough — allow comparator to decide
        isPaginationOnlyChange = checkIsPaginationOnlyChange(prev, snapshot)
      } else {
        // expired: treat as a new query (do not preserve snapshot)
        console.debug('FlightSearchResultsComponent — previous query snapshot expired (ms):', age)
        isPaginationOnlyChange = false
      }
      console.debug('FlightSearchResultsComponent — isPaginationOnlyChange:', isPaginationOnlyChange)
    }

    const snapshotToSave = { ...snapshot, explicitlySuppliedValues: { ...snapshot.explicitlySuppliedValues } }

    if (isPaginationOnlyChange) { 
      snapshotToSave.departFrom = 
        snapshot.departFrom = prev!.departFrom
    }

    // update last seen snapshot and timestamp
    lastQueryRef.current = snapshotToSave
    lastQueryAtRef.current = now

    // right we've got those comparisons and saving of state out of the way, proceed to build params

    // at this moment we only care about page/pageSize for pagination
    // we will enhance the params when building out full search support

    const params: FlightSearchParams = {}

    if (snapshot.pageSize === undefined) {
      snapshot.pageSize = 8
    }
    if (snapshot.page === undefined) {
      snapshot.page = 1
    }

    params.pageIndex = snapshot.page - 1
    params.pageSize = snapshot.pageSize
    params.departureDateFrom = new Date(snapshot.departFrom!)

    return params
  }, [TIMEOUT_MS])

  /**
   * Determine whether a transition from `prev` -> `next` should be
   * considered a "pagination-only" change. Per rules:
   * - compare all fields EXCEPT: 'departFrom', 'page', 'tab', 'explicitlySuppliedValues'
   * - return true only when either:
   *    a) the only change is the page number, OR
   *    b) the only change is departFrom transitioning from a concrete value -> blank
   */
  const checkIsPaginationOnlyChange = (prev: FlightQuery, next: FlightQuery): boolean => {
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
    const doPqge_Load = async() => {
      const snapshot = getQuery()
      const fsParams = applyQueryParams(snapshot as FlightQuery)

      setSearchParams(fsParams)
      const results = await searchFlights(fsParams)
      setFlightsToDisplay(() => results)
    }
    doPqge_Load()
  }, [getQuery, applyQueryParams, searchFlights])

  useEffect(() => {
    Page_Load()
    // compare incoming query to last seen and log whether it's pagination-only
    // run only once on mount (Page_Load is stable via useCallback)
  }, [Page_Load, TIMEOUT_MS])

  // if (!flights || flights.length === 0) {
  //   return <div className={`flight-search-results ${className}`}>No flights</div>
  // }

  // Quick helper to shorten verbose airport names in the UI.
  // Rules applied:
  // - Replace the whole-word "International" anywhere (case-insensitive) with "Intl."
  // - Truncate any single word longer than 15 characters to first 15 chars + '.'
  const shortenAirportName = (name: string) => {
    if (!name) return name
    // Replace International anywhere
    const replaced = name.replace(/\bInternational\b/gi, 'Intl.')
    // Truncate overly long words
    const words = replaced.split(/(\s+)/) // keep whitespace tokens so we preserve original spacing
    return words
      .map((w) => {
        // leave whitespace unchanged
        if (/^\s+$/.test(w)) return w
        // if word length > 15, truncate
        if (w.length > 15) return w.slice(0, 15) + '.'
        return w
      })
      .join('')
  }

  // Simple date formatter: DD/MM/YYYY HH:mm (24-hour)
  const formatDateShort = (d: Date) => {
    if (!d) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear())
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return (
    <div className={`flight-search-results ${className}`}>
      {flightsToDisplay.map((flight, index) => {
        return (
          <div key={index} className="table-row">
            <div className="airport">
              <div className="airport-code">{flight.originAirportCode}</div>
              <div className="airport-name">{shortenAirportName(flight.originAirportName)}</div>
            </div>
            <div className="date">{formatDateShort(flight.departureTime)}</div>
            <div className="airport dest">
              <div className="airport-code">{flight.destinationAirportCode}</div>
              <div className="airport-name">{shortenAirportName(flight.destinationAirportName)}</div>
            </div>
          </div>
        )
      })}
      <div className="pagination">
        <span className="arrow">&laquo;</span>
        Displaying 1–10 of 75
        <span className="arrow">&raquo;</span>
      </div>
    </div>
  )
}
