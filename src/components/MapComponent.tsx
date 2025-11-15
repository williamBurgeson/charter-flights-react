import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  type Host = {
    __leafletMap?: L.Map
    __leafletMapBounds?: {
      southWest: L.LatLng
      northEast: L.LatLng
      center: L.LatLng
      zoom: number
    }
  }

  // Initialize the Leaflet map and return a cleanup function.
  const initMap = useCallback((host: Host) => {
    console.debug('MapComponent: creating leaflet map')
    const el = mapRef.current!
    const map = L.map(el, {
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

    host.__leafletMap = map

    const updateBounds = () => {
      try {
        const b = map.getBounds()
        boundsRef.current = b
        host.__leafletMapBounds = {
          southWest: b.getSouthWest(),
          northEast: b.getNorthEast(),
          center: map.getCenter(),
          zoom: map.getZoom(),
        }
        console.debug('MapComponent: bounds updated', host.__leafletMapBounds)
      } catch (e) {
        console.debug('MapComponent: failed to read bounds', e)
      }
    }

    updateBounds()
    map.on('moveend', updateBounds)

    return () => {
      try {
        console.debug('MapComponent: removing leaflet map')
        map.off('moveend', updateBounds)
        map.remove()
      } finally {
        if (host) {
          delete host.__leafletMap
          delete host.__leafletMapBounds
        }
      }
    }
  }, [])
  useEffect(() => {
    if (!mapRef.current) return

    // Debugging / safety: prevent double-init on same host node
    const host = mapRef.current as unknown as Host
    if (host.__leafletMap) {
      console.debug('MapComponent: existing leaflet map found on host — skipping init')
      return
    }

    const cleanup = initMap(host)
    return cleanup
  }, [initMap])

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
      <div className="map-container" ref={mapRef} aria-label="world map" />
    </div>
  )
}
