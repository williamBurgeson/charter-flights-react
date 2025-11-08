import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useContinents } from './hooks/data/useContinents'

function App() {
  const [count, setCount] = useState(0)

  const { getAll: getAllContinents, loading, error } = useContinents();

  const continents = getAllContinents();
  console.log(continents, loading, error);
  
  const loadingFragment = loading ? <div>Loading...</div> : '';
  const errorFragment = error ? <div>Error: {error.message}</div> : '';

  // useEffect(() => {
  //   async function fetchContinents() {
  //     try {
  //       const response = await fetch('/continents.json');
  //       const data = await response.json();
  //       console.log(data);
  //     } catch (error) {
  //       console.error('Failed to fetch continents:', error);
  //     }
  //   }
  //   fetchContinents();
  // }, []);

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
      {loadingFragment}
      {errorFragment}
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
