import { useEffect, useCallback, useState } from 'react'
import useFlightQueryParams from '../../hooks/useFlightQueryParams'
import type { Flight } from '../../models/flight.model'
import { useFlightSearch, type FlightSearchParams } from '../../hooks/useFlightSearch'
import type { FlightQuery } from '../../hooks/useFlightQueryParams'
import './FlightSearchResultsComponent.css'
import FlightItemDisplayComponent from './FlightItemDisplayComponent'

export default function FlightSearchResultsComponent() {
  // read the query (includes explicitlySuppliedValues) so we can inspect it
  const { getQuery } = useFlightQueryParams()

  // Keep a ref to the last-seen query so we can compare current vs incoming
  // const lastQueryRef = useRef<FlightQuery | null>(null)
  // Keep a timestamp of when we last recorded the query snapshot. This lets
  // us expire old snapshots (see timeout logic below).
  // const lastQueryAtRef = useRef<number | null>(null)
  const { searchFlights } = useFlightSearch()
  
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null)
  const [flightsToDisplay, setFlightsToDisplay] = useState<Flight[]>([])

  const applyQueryParams = useCallback((snapshot: FlightQuery): FlightSearchParams => {
    if (snapshot.pageSize === undefined) {
      snapshot.pageSize = 6
    }
    if (snapshot.page === undefined) {
      snapshot.page = 1
    }
    if (snapshot.departFrom === 'now') {
      snapshot.departFrom = new Date().toISOString()
    }
    const params: FlightSearchParams = {}
    params.pageIndex = snapshot.page - 1
    params.pageSize = snapshot.pageSize
    params.departureDateFrom = new Date(snapshot.departFrom!)

    return params
  }, [])

  // Page_Load: run initialization side-effects once on mount
  const Page_Load = useCallback(() => {
    const doPage_Load = async() => {
      const snapshot = getQuery()
      const fsParams = applyQueryParams(snapshot as FlightQuery)

      setSearchParams(fsParams)
      const results = await searchFlights(fsParams)
      setFlightsToDisplay(() => results)
    }
    doPage_Load()
  }, [getQuery, applyQueryParams, searchFlights])

  useEffect(() => {
    Page_Load()
  }, [Page_Load])

  return (
    <div className={`flight-search-results`}>
      {flightsToDisplay.map((flight, index) => {
        return (
          <FlightItemDisplayComponent key={index} flight={flight} />
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
