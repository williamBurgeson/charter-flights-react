import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeTemp from './pages/Home.temp'
import NotFoundTemp from './pages/NotFound.temp'

export default function AppRouterTemp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeTemp />} />
        <Route path="*" element={<NotFoundTemp />} />
      </Routes>
    </BrowserRouter>
  )
}
