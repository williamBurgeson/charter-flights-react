import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import type { SuspenseResource } from '../utils/suspense-resource'

export default function AppRouter({suspenseResource}: {suspenseResource: SuspenseResource}) {

  suspenseResource.read() // will suspend if not ready yet

	return (
		<BrowserRouter>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
		</BrowserRouter>
	)
}
