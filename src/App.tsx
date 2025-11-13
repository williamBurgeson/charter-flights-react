import { Suspense, useEffect, useMemo, useState } from 'react'
import './App.css'

import { LoadingComponent } from './components/loading-component.tsx'
import LeftDrawer from './components/left-drawer.tsx'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { BrowserRouter } from 'react-router-dom'

import useFlightSeeder from './hooks/useFlightSeeder.ts'
import { makeSuspenseResource, type SuspenseResource } from './utils/suspense-resource.ts'
import AppRouter from './components/app-router.tsx'

function App() {

  const flightSeederResource = useMemo(() => makeSuspenseResource<void>() as SuspenseResource, [])
  
  const { triggerSeed } = useFlightSeeder()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  useEffect(() => {
    const p = triggerSeed()
    if (p && typeof (p as Promise<void>).then === 'function') {
      flightSeederResource.begin(p as Promise<void>)
      // resource settles the suspense consumers; no local state required
    } else {
      flightSeederResource.markReady()
    }
  }, [triggerSeed, flightSeederResource])

  return (
    <>
    <BrowserRouter>
      <LeftDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
        {/* show hamburger on mobile only */}
        {!isDesktop && (
          <IconButton aria-label="open menu" onClick={() => setDrawerOpen(true)} sx={{ position: 'absolute', left: 8 }} color="inherit">
            <MenuIcon />
          </IconButton>
        )}
        <div>Global Connections</div>
      </header>

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
