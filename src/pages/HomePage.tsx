import { useEffect, useState } from "react"
import { useFlightSearch, type FlightSearchResult } from "../hooks/useFlightSearch"
import FlightItemDisplayComponent from "../components/flight-search/FlightItemDisplayComponent"
import FlightResultsFooterComponent from "../components/flight-search/FlightResultsFooterComponent"

function HomePage() {
  const [flightSearchResults, setFlightSearchResults] = useState<FlightSearchResult | null>(null)
  const { searchFlights } = useFlightSearch()

  useEffect(() => {
    const invokeFlightSearch = async () => {
      const results = await searchFlights({ departureDateFrom: new Date(), pageIndex: 0, pageSize: 8 })
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
            <FlightResultsFooterComponent searchResults={flightSearchResults} />
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage