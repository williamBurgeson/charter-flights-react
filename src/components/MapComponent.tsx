import { useState, useRef, useCallback, useMemo } from 'react'
import LeafletMapHostComponent, { type MapBoundsPayload } from './LeafletMapHostComponent'
import './MapComponent.css'
import { useContinentSearch } from '../hooks/useContinentSearch'
import type { Continent } from '../models/continent.model'
import type { GeoRegion } from '../models/geo-types'
import { useAirportSearch } from '../hooks/useAirportSearch'
import type { Airport } from '../models/airport.model'
import type { AirportSearchParams } from '../hooks/useAirportSearch'
import type { ContinentCode } from '../models/continent.model'

export default function MapComponent() {
  const { findContinentsIntersectingRegion } = useContinentSearch()

  const [continentsInView, setContinentsInView] = useState<Continent[] | null>(null)
  const [airportsInView, setAirportsInView] = useState<Airport[]>([])
  const centerRef = useRef<{ lat_decimal: number; lon_decimal: number } | null>(null)
  const { searchAirports } = useAirportSearch()

  const handleMapUpdated = useCallback(async (b: MapBoundsPayload) => {
    console.log('MapComponent: bounds changed', b)
    const region: GeoRegion = { southWest: b.southWest, northEast: b.northEast }
    try {
      const list = await findContinentsIntersectingRegion(region)
      setContinentsInView(list)
      console.log('MapComponent: continents in view', list)

      // Store center for caller debugging / current position usage
      centerRef.current = b.center

      // Build airport search params using bounds and the continent codes to narrow the search
      const params: AirportSearchParams = {
        maxLatitude: b.northEast.lat_decimal,
        minLatitude: b.southWest.lat_decimal,
        maxLongitude: b.northEast.lon_decimal,
        minLongitude: b.southWest.lon_decimal,
      }

      if (list?.length) {
        params.continentCodes = list.map(c => c.code as ContinentCode)
      }

      // Execute airport search and store results in state so the map host can render markers
      const airports = await searchAirports(params)
      setAirportsInView(airports)
      console.log('MapComponent: airports found for current view', airports.length)
    } catch (e) {
      console.error('MapComponent: failed to get continents for bounds', e)
    }
  }, [findContinentsIntersectingRegion, searchAirports])

  // Convert domain airports -> marker data for the Leaflet host
  const markers = useMemo(() => {
    return airportsInView.map(a => ({ id: a.code, lat: a.lat_decimal, lon: a.lon_decimal, title: a.name, popupHtml: `<strong>${a.name}</strong><br/>${a.code}` }))
  }, [airportsInView])

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
  <LeafletMapHostComponent mapUpdatedEvent={handleMapUpdated} markers={markers} />
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
        <div className="map-airports-debug">
          <strong>Airports in view:</strong> {airportsInView ? airportsInView.length : 0}
          {airportsInView && airportsInView.length > 0 && (
            <ul>
              {airportsInView.slice(0,10).map(a => (
                <li key={a.code}>{a.name} ({a.code})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
