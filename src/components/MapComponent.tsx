import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!mapRef.current) return

    // Debugging / safety: if a Leaflet map instance was already attached to this
    // DOM node (for example due to StrictMode double-mounts or an unexpected
    // remount), avoid creating a second map. We store the map instance on the
    // DOM node so we can detect and clean it up reliably.
    const host = mapRef.current as unknown as { __leafletMap?: L.Map }
    if (host.__leafletMap) {
      // already initialized
      console.debug('MapComponent: existing leaflet map found on host — skipping init')
      return
    }

  // create the map once
  console.debug('MapComponent: creating leaflet map')
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

    // attach instance for later detection/cleanup
    host.__leafletMap = map

    return () => {
      try {
        console.debug('MapComponent: removing leaflet map')
        map.remove()
      } finally {
        // clear the marker on the DOM node so a future mount can recreate
        // the map cleanly
        if (host) delete host.__leafletMap
      }
    }
  }, [])

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
      <div className="map-container" ref={mapRef} aria-label="world map" />
    </div>
  )
}
