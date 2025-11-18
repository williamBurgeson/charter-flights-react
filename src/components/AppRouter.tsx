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

  console.log('AppRouter rendering with base href:', location.href)

  return (
    <Routes>
      <Route path={`${location.href}`} index element={<HomePage />} />
      <Route path={`/map`} element={<MapPage />} />
      <Route path={`${location.href}airports`} element={<AirportSearchPage />} />
      <Route path={`${location.href}flight-search`} element={<FlightSearchPage />} />
      <Route path={`${location.href}empty`} element={<EmptyPage />} />
      <Route path="{`${location.href}*`}" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
