import { useEffect, useState } from "react"
import { useFlightSearch, type FlightSearchResult, type FlightSearchParams } from "../hooks/useFlightSearch"
import FlightItemDisplayComponent from "../components/flight-search/FlightItemDisplayComponent"
import FlightResultsFooterComponent from "../components/flight-search/FlightResultsFooterComponent"

function HomePage() {
  const [flightSearchResults, setFlightSearchResults] = useState<FlightSearchResult | null>(null)
  const [homeSearchParams, setHomeSearchParams] = useState<FlightSearchParams | null>(null)
  const { searchFlights } = useFlightSearch()

  useEffect(() => {
    const invokeFlightSearch = async () => {
      const params: FlightSearchParams = { departureDateFrom: new Date(), pageIndex: 0, pageSize: 8 }
      setHomeSearchParams(params)
      const results = await searchFlights(params)
      setFlightSearchResults(results)
    }
    invokeFlightSearch()
  }, [searchFlights])

  return (
    <div className="table-box">
      <div className="table-header">
        {flightSearchResults === null ? (
          <div>Loading flight search results...</div>
        ) : !flightSearchResults.flights || flightSearchResults.flights.length === 0 ? (
          <div>No flights found matching the search criteria.</div>
        ) : (
          <>
            {flightSearchResults.flights.map((flight, index) => (
              <FlightItemDisplayComponent flight={flight} key={index} />
            ))}
            <FlightResultsFooterComponent searchResults={flightSearchResults} searchParams={homeSearchParams} />
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage