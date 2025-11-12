import { useEffect, useState } from 'react'
import './App.css'
import useFlightSeeder from './hooks/useFlightSeeder'
import { useFlightSearch } from './hooks/useFlightSearch.ts'
import type { Flight } from './models/flight.model'
import { useFlights } from './hooks/data/useFlights.ts'

function App() {
  const [flightsToDisplay, setFlightsToDisplay] = useState<Flight[]>([])

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
    </main>
    </>
  )
}

export default App
