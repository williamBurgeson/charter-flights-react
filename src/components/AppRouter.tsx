import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import MapPage from '../pages/MapPage'
import NotFoundPage from '../pages/NotFoundPage'
import AirportSearchPage from '../pages/AirportSearchPage'
import FlightSearchPage from '../pages/FlightSearchPage'
import type { SuspenseResource } from '../utils/suspense-resource'
import { EmptyPage } from '../pages/EmptyPage'

export default function AppRouter({ suspenseResource }: { suspenseResource: SuspenseResource }) {
  // suspend the router until seeding completes
  suspenseResource.read()

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/airports" element={<AirportSearchPage />} />
  <Route path="/flight-search" element={<FlightSearchPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/empty" element={<EmptyPage />} />
    </Routes>
  )
}
