import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import MapPage from '../pages/MapPage'
import NotFoundPage from '../pages/NotFoundPage'
import type { SuspenseResource } from '../utils/suspense-resource'

export default function AppRouter({ suspenseResource }: { suspenseResource: SuspenseResource }) {
	// suspend the router until seeding completes
	suspenseResource.read()

	return (
		<Routes>
			<Route index element={<HomePage />} />
      <Route path="/map" element={<MapPage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
