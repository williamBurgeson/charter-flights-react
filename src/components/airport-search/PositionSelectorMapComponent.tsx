import { useCallback } from 'react'
import LeafletMapHostComponent, { type MapClickPayload } from '../LeafletMapHostComponent'
import type { GeoPoint } from '../../models/geo-types'

export type PositionSelectPayload = {
  positionSelected: GeoPoint | null
  selectedAt: string // ISO timestamp
}

export default function PositionSelectorMapComponent({ 
  selectedCenter,
  onPositionSelected 
}: { 
  selectedCenter?: GeoPoint | null,
  onPositionSelected?: (p: PositionSelectPayload) => void 
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

  return (
    <div className="position-selector-map-component">
      <LeafletMapHostComponent centerGeoPoint={selectedCenter} onMapClick={handleMapClick} />
    </div>
  )
}
