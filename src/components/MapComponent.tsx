import { useState } from 'react'
import LeafletMapHostComponent, { type MapBoundsPayload } from './LeafletMapHostComponent'
import './MapComponent.css'
import { useContinentSearch } from '../hooks/useContinentSearch'
import type { Continent } from '../models/continent.model'
import type { GeoRegion } from '../models/geo-types'

export default function MapComponent() {
  const { findContinentsIntersectingRegion } = useContinentSearch()

  const [continentsInView, setContinentsInView] = useState<Continent[] | null>(null)

  const handleMapUpdated = async (b: MapBoundsPayload) => {
    console.debug('MapComponent: bounds changed', b)
    const region: GeoRegion = { southWest: b.southWest, northEast: b.northEast }
    try {
      const list = await findContinentsIntersectingRegion(region)
      setContinentsInView(list)
      console.debug('MapComponent: continents in view', list)
    } catch (e) {
      console.debug('MapComponent: failed to get continents for bounds', e)
    }
  }

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
      <LeafletMapHostComponent mapUpdatedEvent={handleMapUpdated} />
      <div className="map-continents-debug" aria-live="polite">
        {continentsInView && (
          <div>
            <strong>Continents in view:</strong> {continentsInView.length}
            <ul>
              {continentsInView.map((c) => (
                <li key={c.code}>{c.name} ({c.code})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
