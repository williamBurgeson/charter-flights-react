import { useCallback } from 'react'
import LeafletMapHostComponent, { type MapClickPayload } from '../LeafletMapHostComponent'
import type { GeoPoint } from '../../models/geo-types'

export type PositionSelectPayload = {
  positionSelected: GeoPoint | null
  zoomLevel?: number | null
  selectedAt: string // ISO timestamp
}

export default function PositionSelectorMapComponent({ 
  selectedCenter,
  selectedZoom,
  onPositionSelected,
  onZoomChanged
}: { 
  selectedCenter?: GeoPoint | null,
  selectedZoom?: number | null,
  onPositionSelected?: (p: PositionSelectPayload) => void,
  onZoomChanged?: (p: { zoom: number }) => void
} = {}) {

  // Called when the Leaflet host reports a map click. Notify parent via
  // `onPositionSelected` if provided. The event is optional for consumers.
  const handleMapClick = useCallback((p: MapClickPayload) => {
    try {
      console.log('PositionSelectorMapComponent: map click received', p)
      try {
        if (typeof onPositionSelected === 'function') {
          onPositionSelected({ positionSelected: { lat_decimal: p.lat, lon_decimal: p.lon }, selectedAt: new Date().toISOString() })
        }
      } catch (pf) {
        console.error('PositionSelectorMapComponent: onPositionSelected handler threw', pf)
      }
    } catch (e) {
      console.error('PositionSelectorMapComponent: error handling map click', e)
    }
  }, [onPositionSelected])

  const handleZoomChanged = useCallback((p: { zoom: number }) => {  
    try {
      if (typeof onZoomChanged === 'function') {
        onZoomChanged(p)
      }
    } catch (e) {
      console.error('PositionSelectorMapComponent: error handling zoom changed', e)
    }
  }, [onZoomChanged])

  return (
    <div className="position-selector-map-component">
      <LeafletMapHostComponent 
        centerGeoPoint={selectedCenter} 
        zoom={selectedZoom} 
        onMapClick={handleMapClick} 
        onZoomChanged={handleZoomChanged} />
    </div>
  )
}
