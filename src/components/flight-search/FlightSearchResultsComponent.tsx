import { useEffect, useCallback, useState } from 'react'
import useFlightQueryParams from '../../hooks/useFlightQueryParams'
import { useFlightSearch, type FlightSearchParams, type FlightSearchResult } from '../../hooks/useFlightSearch'
import type { FlightQuery } from '../../hooks/useFlightQueryParams'
import './FlightSearchResultsComponent.css'
import FlightItemDisplayComponent from './FlightItemDisplayComponent'
import FlightResultsFooterComponent from './FlightResultsFooterComponent'

export default function FlightSearchResultsComponent() {
  const { getQuery } = useFlightQueryParams()

  const { searchFlights } = useFlightSearch()
  
  const [flightsToDisplay, setFlightsToDisplay] = useState<FlightSearchResult | null>(null)
  const [activeSearchParams, setActiveSearchParams] = useState<FlightSearchParams | null>(null)

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
      setActiveSearchParams(fsParams)
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
      {flightsToDisplay?.flights.map((flight, index) => {
        return (
          <FlightItemDisplayComponent key={index} flight={flight} />
        )
      })}
      <FlightResultsFooterComponent searchResults={flightsToDisplay} searchParams={activeSearchParams} />
    </div>
  )
}
