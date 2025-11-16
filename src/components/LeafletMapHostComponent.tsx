import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Ensure default Leaflet marker icons are set when bundlers don't copy image assets
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
import type { GeoPoint } from '../models/geo-types'
type MarkerData = { id: string; lat: number; lon: number; title?: string; popupHtml?: string }
export type MapBoundsPayload = { southWest: GeoPoint; northEast: GeoPoint; center: GeoPoint; zoom: number }
export type MapBoundsCallback = (b: MapBoundsPayload) => void
import './MapComponent.css'


export default function LeafletMapHostComponent({
  centerGeoPoint = null,
  zoom = null,
  mapUpdatedEvent,
  markers,
}: {
  centerGeoPoint?: GeoPoint | null
  zoom?: number | null
  mapUpdatedEvent?: MapBoundsCallback
  markers?: MarkerData[]
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<MarkerData[] | undefined>(undefined)
  markersRef.current = markers

  // Helper to (re)render markers onto the map. Extracted so we can call it
  // both after map initialization and when the `markers` prop changes.
  const renderMarkers = (map: L.Map, markers?: MarkerData[]) => {
    if (!map) return

    // Ensure we have a layer group to manage markers
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup()
      markersLayerRef.current.addTo(map)
    }

    const layer = markersLayerRef.current!
    // Clear existing markers
    layer.clearLayers()

    if (markers && markers.length) {
      console.log('LeafletMapHostComponent: rendering markers count', markers.length)
      const created: L.Marker[] = (markers as MarkerData[]).map((m) => {
        const mk = L.marker([m.lat, m.lon])
        if (m.popupHtml) mk.bindPopup(m.popupHtml)
        if (m.title) mk.bindTooltip(m.title)
        return mk
      })
      layer.addLayer(L.layerGroup(created))
    } else {
      console.log('LeafletMapHostComponent: no markers to render')
    }
  }

  useEffect(() => {
    if (!mapRef.current) return

    type Host = { __leafletMap?: L.Map; __leafletMapBounds?: unknown }
    const host = mapRef.current as unknown as Host
    if (host.__leafletMap) {
      // already initialized
      return
    }

    const map = L.map(mapRef.current, {
      center: centerGeoPoint ? [centerGeoPoint.lat_decimal, centerGeoPoint.lon_decimal] : [20, 0],
      zoom: typeof zoom === 'number' ? zoom : 2,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    host.__leafletMap = map

    // If markers were provided before the map initialized, render them now using the ref
    try {
      renderMarkers(map, markersRef.current)
    } catch {
      // swallow - rendering markers is best-effort
    }

    const updateBounds = () => {
      try {
        const b = map.getBounds()
        boundsRef.current = b
        const payload = {
          southWest: { lat_decimal: b.getSouthWest().lat, lon_decimal: b.getSouthWest().lng },
          northEast: { lat_decimal: b.getNorthEast().lat, lon_decimal: b.getNorthEast().lng },
          center: { lat_decimal: map.getCenter().lat, lon_decimal: map.getCenter().lng },
          zoom: map.getZoom(),
        }
        host.__leafletMapBounds = payload
  console.log('LeafletMapHostComponent: map bounds updated', payload)
        if (mapUpdatedEvent) mapUpdatedEvent(payload)
      } catch {
        // swallow
      }
    }

    updateBounds()
    map.on('moveend', updateBounds)

    return () => {
      try {
        map.off('moveend', updateBounds)
        map.remove()
      } finally {
        if (host) {
          delete host.__leafletMap
          delete host.__leafletMapBounds
        }
      }
    }
  }, [centerGeoPoint, zoom, mapUpdatedEvent])

  // Update markers when the markers prop changes
  useEffect(() => {
    if (!mapRef.current) return
    const host = mapRef.current as unknown as { __leafletMap?: L.Map }
    const map = host.__leafletMap
    if (!map) return

    renderMarkers(map, markers)

    return () => {
      // we keep layer for reuse; it will be cleared on next update
    }
  }, [markers])

  return <div className="map-container" ref={mapRef} aria-label="world map" />
}
