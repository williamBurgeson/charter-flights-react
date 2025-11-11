import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useContinents } from './hooks/data/useContinents'
import useFlightSeeder from './hooks/useFlightSeeder'
import type { Continent } from './models/continent.model'
import { useFlights } from './hooks/data/useFlights'

function App() {
  const [count, setCount] = useState(0)

  const { getAll: getAllContinents } = useContinents();
  const { getAll: getAllFlights } = useFlights();

  const [continents, setContinents] = useState<Continent[] | null>(null);
  const [flightCount, setFlightCount] = useState(0);


  const { triggerSeed } = useFlightSeeder()

  useEffect(() => {
    // fire once on mount; triggerSeed is a minimal skeleton you can extend
    // we call triggerSeed without passing a create function per your request
    triggerSeed()
      .then((flightsOutput) => {
        console.log('Flights output:', flightsOutput);
        getAllFlights().then((flights) => {
          console.log(`Seed complete, ${flights.length} flights loaded:`, flights);
          setFlightCount(flights.length);
        })
      })
      .catch((err) => console.error('seed failed', err))
  }, [triggerSeed, getAllFlights]);

  useEffect(() => {
    async function fetchContinents() {
      try {
        const data = await getAllContinents();
        setContinents(data);
      } catch (error) {
        console.error('Failed to fetch continents:', error);
      }
    }
    fetchContinents();
  }, [getAllContinents]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      We have {flightCount} flights seeded. { flightCount > 0 && '🎉 🎉'} 
      {continents && (
        <ul>
          {continents.map((continent) => (
            <li key={continent.code}>
              {continent.name} ({continent.code})
            </li>
          ))}
        </ul>
      )}      
    </>
  )
}

export default App
