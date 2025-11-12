import { useEffect, useState } from 'react'
import './App.css'
import useFlightSeeder from './hooks/useFlightSeeder'
import { useFlightSearch } from './hooks/useFlightSearch.ts'
import type { Flight } from './models/flight.model'

function App() {
  const [flightsToDisplay, setFlightsToDisplay] = useState<Flight[]>([])

  const { triggerSeed } = useFlightSeeder()
  const { searchFlights } = useFlightSearch()

  useEffect(() => {
    // fire once on mount; triggerSeed is a minimal skeleton you can extend
    // we call triggerSeed without passing a create function per your request
    triggerSeed()
      .then(async (flightsOutput) => {
        console.log('Flights seeded:', flightsOutput?.length);

        const flights = await searchFlights({ departureDateFrom: new Date(), itemsFromBeginning: 10 });
        setFlightsToDisplay(flights);
        })
      .catch((err) => console.error('seed failed', err))
          }, [searchFlights, triggerSeed]);

  return (
    <>
    <header>Global Connections</header>

    <main className="content">
      <div className="table-box">
        {flightsToDisplay.map((flight, index) => (
          <div key={index} className="table-row">
            <div className="code">{flight.origin}</div>
            <div className="date">{flight.departureTime.toISOString().split('T')[0]}</div>
            <div className="code">{flight.destination}</div>
          </div>
        ))}
        <div className="table-row">
          <div className="code">LHR</div><div className="date">2025-11-03</div><div className="code">JFK</div>
        </div>
        <div className="table-row">
          <div className="code">CDG</div><div className="date">2025-11-04</div><div className="code">NRT</div>
        </div>
        <div className="table-row">
          <div className="code">SFO</div><div className="date">2025-11-05</div><div className="code">DXB</div>
        </div>
        <div className="table-row">
          <div className="code">SIN</div><div className="date">2025-11-06</div><div className="code">SYD</div>
        </div>
        <div className="table-row">
          <div className="code">YYZ</div><div className="date">2025-11-07</div><div className="code">ORD</div>
        </div>

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
