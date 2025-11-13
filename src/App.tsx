import { Suspense, useEffect } from 'react'
import './App.css'

import { LoadingComponent } from './components/loading-component.tsx'
import { FlightSeedHost } from './components/flight-seed-host.tsx'
import { beginPromise } from './utils/promise-suspense-support.ts'
import useFlightSeeder from './hooks/useFlightSeeder.ts'

function App() {

  const { triggerSeed } = useFlightSeeder()


useEffect(() => {
  const p = triggerSeed() // may be Promise or undefined
  if (p && typeof (p as Promise<unknown>).then === 'function') {
    beginPromise(p as Promise<unknown>)
    ;(p as Promise<unknown>).catch((e) => console.error('seed failed', e))
  } else {
    // already seeded synchronously: mark ready so read() doesn't hang
    // if your resource has markPromiseReady(), call it; otherwise:
    beginPromise(Promise.resolve(undefined))
  }
}, [triggerSeed])

  return (
    <>
    <header>Global Connections</header>

    <main className="content">
      <Suspense fallback={<LoadingComponent />}>
        <FlightSeedHost />
        <div>Done</div>
      </Suspense>
    </main>
    </>
  )
}

export default App
