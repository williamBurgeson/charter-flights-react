import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// MarkerCluster plugin + styles (import after Leaflet)
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

import './LeafletMapHostComponent.css'

import type { GeoPoint } from '../models/geo-types'
export type MarkerData = { id: string; lat: number; lon: number; title?: string; popupHtml?: string }
// Payload sent to parent when a marker is selected/clicked. 
export type MarkerSelectPayload = {
  id: string
  lat: number
  lon: number
  title?: string
  popupHtml?: string
}
export type MapBoundsPayload = { southWest: GeoPoint; northEast: GeoPoint; center: GeoPoint; zoom: number }
export type MapBoundsCallback = (b: MapBoundsPayload) => void

export type MapClickPayload = { lat: number; lon: number }
export type MapClickCallback = (p: MapClickPayload) => void

export type ZoomChangedPayload = { zoom: number }
export type ZoomChangedCallback = (p: ZoomChangedPayload) => void


export default function LeafletMapHostComponent({
  centerGeoPoint = null,
  zoom = null,
  mapUpdatedEvent,
  markers,
  onMarkerSelect,
  onMapClick,
  onZoomChanged
}: {
  centerGeoPoint?: GeoPoint | null
  zoom?: number | null
  mapUpdatedEvent?: MapBoundsCallback
  markers?: MarkerData[]
  onMarkerSelect?: (p: MarkerSelectPayload) => void
  onMapClick?: MapClickCallback
  onZoomChanged?: ZoomChangedCallback
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<MarkerData[] | undefined>(undefined)
  markersRef.current = markers

  // Helper to (re)render markers onto the map. Extracted so we can call it
  // both after map initialization and when the `markers` prop changes.
  // Skeleton handler for marker clicks. Logs lat/lon and marker metadata.
  const onMarkerClick = useCallback((m: MarkerData, marker?: L.Marker) => {
    try {
      console.log('LeafletMapHostComponent: marker clicked', {
        id: m.id,
        title: m.title,
        lat: m.lat,
        lon: m.lon,
        markerInstance: marker,
      })
      // Forward the selection to the parent if requested
      try {
        if (typeof onMarkerSelect === 'function') {
          onMarkerSelect({ id: m.id, lat: m.lat, lon: m.lon, title: m.title, popupHtml: m.popupHtml })
        }
      } catch (pf) {
        console.error('LeafletMapHostComponent: onMarkerSelect handler threw', pf)
      }
      // If the MarkerData `id` contains an airport code, this is a good
      // place to extract and use it. For now we just log it.
    } catch (e) {
      console.error('LeafletMapHostComponent: error in onMarkerClick', e)
    }
  }, [onMarkerSelect])

  // Skeleton handler for clicks on the map (not markers).
  // Logs clicked coordinates and forwards the payload to the optional
  // `onMapClick` prop so a parent can handle map click events.
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    try {
      const lat = e.latlng.lat
      const lon = e.latlng.lng
      console.log('LeafletMapHostComponent: map clicked', { lat, lon, originalEvent: e })
      try {
        if (typeof onMapClick === 'function') {
          onMapClick({ lat, lon })
        }
      } catch (pf) {
        console.error('LeafletMapHostComponent: onMapClick handler threw', pf)
      }
    } catch (err) {
      console.error('LeafletMapHostComponent: error in handleMapClick', err)
    }
  }, [onMapClick])

  // Skeleton handler for zoom changes initiated by user interaction
  // inside the map (zoom control, pinch, scroll). Currently just logs
  // the new zoom level; this can be extended later to forward the value
  // to a parent via a prop or callback.
  const handleZoomEnd = useCallback((e: L.LeafletEvent) => {
    try {
      const mapInstance = (e && (e.target as unknown as L.Map)) || null
      const currentZoom = mapInstance ? mapInstance.getZoom() : undefined
      if (typeof currentZoom === 'number' && typeof onZoomChanged === 'function') {
        onZoomChanged({ zoom: currentZoom })
      }
      console.log('LeafletMapHostComponent: zoom ended, currentZoom=', currentZoom)
    } catch (err) {
      console.error('LeafletMapHostComponent: error in handleZoomEnd', err)
    }
  }, [onZoomChanged])

  const renderMarkers = useCallback((map: L.Map, markers?: MarkerData[]) => {
    if (!map) return

    // Ensure we have a layer group to manage markers
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup()
      markersLayerRef.current.addTo(map)
    }

    // const layer = markersLayerRef.current!
    // Clear existing markers
    console.log('LeafletMapHostComponent: renderMarkers start; incoming markers length', markers?.length ?? 0)
    // layer.clearLayers()

    if (markers && markers.length) {
      console.log('LeafletMapHostComponent: rendering markers count', markers.length)
      const clusterGroup = L.markerClusterGroup()
      markers.forEach(m => {
        const mk = L.marker([m.lat, m.lon], { icon: new L.Icon.Default() })
        if (m.popupHtml) mk.bindPopup(m.popupHtml)
        if (m.title) mk.bindTooltip(m.title)

        mk.on('click', () => onMarkerClick(m, mk))
        clusterGroup.addLayer(mk)
      })

      map.addLayer(clusterGroup)

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
  }, [onMarkerClick])

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
    // register the simple map click handler
    map.on('click', handleMapClick)
    // register zoom-end handler so we can observe programmatic/user zoom changes
    map.on('zoomend', handleZoomEnd)

    return () => {
      try {
        map.off('moveend', updateBounds)
        map.off('click', handleMapClick)
        map.off('zoomend', handleZoomEnd)
        map.remove()
      } finally {
        if (host) {
          delete host.__leafletMap
          delete host.__leafletMapBounds
        }
      }
    }
  }, [centerGeoPoint, zoom, mapUpdatedEvent, renderMarkers, handleMapClick, handleZoomEnd])

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
  }, [markers, renderMarkers])

  return <div className="leaflet-map-container" ref={mapRef} aria-label="world map" />
}
