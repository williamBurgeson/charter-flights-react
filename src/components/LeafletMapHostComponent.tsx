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
    console.log('LeafletMapHostComponent: renderMarkers start; incoming markers length', markers?.length ?? 0)
    layer.clearLayers()

    if (markers && markers.length) {
      console.log('LeafletMapHostComponent: rendering markers count', markers.length)
      // Use an HTML-based DivIcon marker so we don't rely on SVG/Canvas renderers or external images
      const created: L.Marker[] = (markers as MarkerData[]).map((m) => {
        const iconHtml = `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#d00;box-shadow:0 0 6px rgba(255,85,85,0.9);"></span>`
        const icon = L.divIcon({ html: iconHtml, className: 'leaflet-custom-divicon', iconSize: [12, 12] })
        const mk = L.marker([m.lat, m.lon], { icon })
        if (m.popupHtml) mk.bindPopup(m.popupHtml)
        if (m.title) mk.bindTooltip(m.title)
        return mk
      })
      const subgroup = L.layerGroup(created as unknown as L.Layer[])
      layer.addLayer(subgroup)

      // If markers did not get attached to the map for some reason, force add them and log state
      try {
        created.forEach((cm, idx) => {
          try {
            const mAny = cm as unknown as { _map?: L.Map; _icon?: HTMLElement; addTo?: (m: L.Map) => L.Marker }
            if (!mAny._map) {
              try {
                // Looks like this is the bit that does the work!
                if (typeof mAny.addTo === 'function') {
                  mAny.addTo(map)

                }
              } catch (fae) {
                console.error(`LeafletMapHostComponent: forced addTo failed for marker[${idx}]`, fae)
              }
            }

          } catch (inner) {
            console.error('LeafletMapHostComponent: per-marker attach check failed', inner)
          }
        })
      } catch (e) {
        console.error('LeafletMapHostComponent: error during markers attachment', e)
      }


    } else {
      console.log('LeafletMapHostComponent: no markers to render')
    }
    // Expose the current markers count on the DOM node so we can inspect lifecycle from DevTools
    try {
      if (mapRef.current) {
        (mapRef.current as HTMLElement).dataset.markersCount = String(markers?.length ?? 0)
      }
    } catch {
      // ignore
    }
    console.log('LeafletMapHostComponent: renderMarkers end')
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
