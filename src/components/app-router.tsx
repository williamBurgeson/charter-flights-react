import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import type { SuspenseResource } from '../utils/suspense-resource'

export default function AppRouter({ suspenseResource }: { suspenseResource: SuspenseResource }) {
	// suspend the router until seeding completes
	suspenseResource.read()

	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
