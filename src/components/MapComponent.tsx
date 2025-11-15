import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  useEffect(() => {
    if (!mapRef.current) return

    // Debugging / safety: if a Leaflet map instance was already attached to this
    // DOM node (for example due to StrictMode double-mounts or an unexpected
    // remount), avoid creating a second map. We store the map instance on the
    // DOM node so we can detect and clean it up reliably.
    const host = mapRef.current as unknown as {
      __leafletMap?: L.Map
      __leafletMapBounds?: {
        southWest: L.LatLng
        northEast: L.LatLng
        center: L.LatLng
        zoom: number
      }
    }
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

    // initialize bounds and attach to host for easy debugging from devtools
    const updateBounds = () => {
      try {
        const b = map.getBounds()
        boundsRef.current = b
        // store a simple serializable bounds object on the host DOM node
        host.__leafletMapBounds = {
          southWest: b.getSouthWest(),
          northEast: b.getNorthEast(),
          center: map.getCenter(),
          zoom: map.getZoom(),
        }
        // Helpful debug output
        console.debug('MapComponent: bounds updated', host.__leafletMapBounds)
      } catch (e) {
        console.debug('MapComponent: failed to read bounds', e)
      }
    }

    // run once to capture initial bounds
    updateBounds()

    // update bounds whenever the map finishes moving/zooming
    map.on('moveend', updateBounds)

    return () => {
      try {
        console.debug('MapComponent: removing leaflet map')
        // remove listener first
        map.off('moveend', updateBounds)
        map.remove()
      } finally {
        // clear the marker on the DOM node so a future mount can recreate
        // the map cleanly
        if (host) {
          delete host.__leafletMap
          delete host.__leafletMapBounds
        }
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
