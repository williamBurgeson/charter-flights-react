import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // create the map once
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    return () => {
      map.remove()
    }
  }, [])

  return (
    <div className="table-box">
      <div className="map-page">
        <h2>World Map (Leaflet)</h2>
        <div className="map-container" ref={mapRef} aria-label="world map" />
      </div>
    </div>
  )
}
