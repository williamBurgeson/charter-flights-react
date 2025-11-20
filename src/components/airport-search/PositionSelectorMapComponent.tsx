import { useState, useRef, useCallback, useMemo } from 'react'
import LeafletMapHostComponent, { type MapBoundsPayload } from '../LeafletMapHostComponent'
import type { GeoPoint } from '../../models/geo-types'

export type PositionSelectPayload = {
  positionSelected: GeoPoint | null
  selectedAt: string // ISO timestamp
}

export default function PositionSelectorMapComponent({ onPositionSelected }: { onPositionSelected?: (p: PositionSelectPayload) => void } = {}) {

  const centerRef = useRef<{ lat_decimal: number; lon_decimal: number } | null>(null)

  const handleMapUpdated = useCallback(async (b: MapBoundsPayload) => {
    console.log('PositionSelectorMapComponent: bounds changed', b)
    try {
      // Store center for caller debugging / current position usage
      centerRef.current = b.center
    } catch (e) {
      console.error('PositionSelectorMapComponent: failed to get continents for bounds', e)
    }
  }, [])

  return (
    <div className="position-selector-map-component">
      <LeafletMapHostComponent mapUpdatedEvent={handleMapUpdated} />
    </div>
  )
}
