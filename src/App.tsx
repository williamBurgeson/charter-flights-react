import { Suspense, useEffect, useMemo, useState } from 'react'
import './App.css'

import { LoadingComponent } from './components/loading-component.tsx'
import DemoDrawer from './components/demo-drawer'
import { BrowserRouter } from 'react-router-dom'

import useFlightSeeder from './hooks/useFlightSeeder.ts'
import { makeSuspenseResource, type SuspenseResource } from './utils/suspense-resource.ts'
import AppRouter from './components/app-router.tsx'

function App() {

  const flightSeederResource = useMemo(() => makeSuspenseResource<void>() as SuspenseResource, [])
  const [registered, setRegistered] = useState(false)
  const { triggerSeed } = useFlightSeeder()

  useEffect(() => {
    let mounted = true
    const p = triggerSeed()
    if (p && typeof (p as Promise<void>).then === 'function') {
      flightSeederResource.begin(p as Promise<void>)
      ;(p as Promise<void>).finally(() => {
        if (mounted) setRegistered(true)
      })
    } else {
      flightSeederResource.markReady()
      setRegistered(true)
    }
    return () => { mounted = false }
  }, [triggerSeed, flightSeederResource])
  if (!registered) return <LoadingComponent />

  return (
    <>
    <BrowserRouter>
      <DemoDrawer />

      <header>Global Connections</header>

      <main className="content">
        <Suspense fallback={<LoadingComponent />}>
          <AppRouter suspenseResource={flightSeederResource} />
        </Suspense>
      </main>
    </BrowserRouter>
    </>
  )
}

export default App
