import { useEffect, useCallback } from 'react'
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
  const applyQueryParams = (q: FlightQueryWithSupplied): FlightSearchParams => {

    

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
    // run only once on mount (Page_Load is stable via useCallback)
  }, [Page_Load])
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
