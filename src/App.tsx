import { useEffect, useState } from 'react'
import './App.css'
import useFlightSeeder from './hooks/useFlightSeeder'
import { useFlightSearch } from './hooks/useFlightSearch.ts'
import type { Flight } from './models/flight.model'
import { useFlights } from './hooks/data/useFlights.ts'

function App() {
  const [flightsToDisplay, setFlightsToDisplay] = useState<Flight[]>([])

  const { triggerSeed } = useFlightSeeder()
  const { getAll : getAllFlights } = useFlights()
  const { searchFlights } = useFlightSearch()

  useEffect(() => {
    // fire once on mount; triggerSeed is a minimal skeleton you can extend
    // we call triggerSeed without passing a create function per your request
    triggerSeed()
      .then(async (flightsOutput) => {
        console.log('Flights seeded:', flightsOutput?.length);
        const allFlights = await getAllFlights();
        console.log('Total flights in system:', allFlights.length);
        console.log('searching for next flights');
        const flights = await searchFlights({ departureDateFrom: new Date(), itemsFromBeginning: 10 });
        console.log('Flights found:', flights.length);
        setFlightsToDisplay(flights);
        })
      .catch((err) => console.error('seed failed', err))
          }, [searchFlights, triggerSeed, getAllFlights]);

  return (
    <>
    <header>Global Connections</header>

    <main className="content">
      <div className="table-box">
        {flightsToDisplay.map((flight, index) => {
          const originLabel = `${flight.originAirportName} (${flight.originAirportCode})`
          const destLabel = `${flight.destinationAirportName} (${flight.destinationAirportCode})`
          return (
            <div key={index} className="table-row">
              <div className="code">{originLabel}</div>
              <div className="date">{flight.departureTime.toUTCString()}</div>
              <div className="code">{destLabel}</div>
            </div>
          )
        })}
        <div className="pagination">
          <span className="arrow">&laquo;</span>
          Displaying 1–10 of 75
          <span className="arrow">&raquo;</span>
        </div>
      </div>
    </main>
    </>
  )
}

export default App
