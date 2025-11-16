import { useState, useRef, useCallback, useMemo } from 'react'
import LeafletMapHostComponent, { type MapBoundsPayload, type MarkerSelectPayload } from './LeafletMapHostComponent'
import './MapComponent.css'
import { useContinentSearch } from '../hooks/useContinentSearch'
import type { Continent } from '../models/continent.model'
import type { GeoRegion } from '../models/geo-types'
import { useAirportSearch } from '../hooks/useAirportSearch'
import { useAirports } from '../hooks/data/useAirports'
import type { Airport } from '../models/airport.model'
import type { AirportSearchParams } from '../hooks/useAirportSearch'
import type { ContinentCode } from '../models/continent.model'

export default function MapComponent() {
  const { findContinentsIntersectingRegion } = useContinentSearch()

  const [continentsInView, setContinentsInView] = useState<Continent[] | null>(null)
  const [airportsInView, setAirportsInView] = useState<Airport[]>([])
  const centerRef = useRef<{ lat_decimal: number; lon_decimal: number } | null>(null)
  const { searchAirports } = useAirportSearch()

  // Track last selection as React state — this is core behavior of the
  // MapComponent and consumers may rely on it. Using state makes the
  // selection explicit and observable.
  const [lastSelectedAirport, setLastSelectedAirport] = useState<Airport | null>(null)
  // Simple in-memory cache for airport lookups by id (code). This avoids
  // repeated fetches to the accessor and keeps the selected-airport lookup
  // fast.
  const airportCacheRef = useRef<Map<string, Airport | null>>(new Map())
  const { getByCode: getAirportByCode } = useAirports()

  const handleMapUpdated = useCallback(async (b: MapBoundsPayload) => {
    console.log('MapComponent: bounds changed', b)
    const region: GeoRegion = { southWest: b.southWest, northEast: b.northEast }
    try {
      const list = await findContinentsIntersectingRegion(region)
      setContinentsInView(list)
      // Clear selection when the map view changes — but only if the
      // previously-selected airport is no longer visible. If the user pans
      // slightly such that the airport remains in view, keep the selection.
      try {
        const prev = lastSelectedAirport
        if (prev) {
          const inBounds = isInBounds({ southWest: b.southWest, northEast: b.northEast }, prev.lat_decimal, prev.lon_decimal)
          if (!inBounds) setLastSelectedAirport(null)
        }
      } catch {
        // ignore any unexpected shape errors and clear selection to be safe
        setLastSelectedAirport(null)
      }
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
  }, [findContinentsIntersectingRegion, searchAirports, lastSelectedAirport])

  // Convert domain airports -> marker data for the Leaflet host
  const markers = useMemo(() => {
    return airportsInView.map(a => ({ id: a.code, lat: a.lat_decimal, lon: a.lon_decimal, title: a.name, popupHtml: `<strong>${a.name}</strong><br/>${a.code}` }))
  }, [airportsInView])

  // Helper to determine whether a lat/lon lies within a GeoRegion. Handles
  // the antimeridian case where southWest.lon > northEast.lon.
  const isInBounds = (region: GeoRegion, lat: number, lon: number) => {
    const sw = region.southWest
    const ne = region.northEast
    const latIn = lat >= sw.lat_decimal && lat <= ne.lat_decimal
    let lonIn = false
    if (sw.lon_decimal <= ne.lon_decimal) {
      // normal case
      lonIn = lon >= sw.lon_decimal && lon <= ne.lon_decimal
    } else {
      // bounds cross the antimeridian (e.g., sw.lon=170, ne.lon=-170)
      lonIn = lon >= sw.lon_decimal || lon <= ne.lon_decimal
    }
    return latIn && lonIn
  }

  // Prefer keeping control flow out of the state setter. Use a ref for the
  // comparison (fast, synchronous) then update state for UI. This keeps the
  // decision logic testable and separate from state application.
  const handleMarkerSelect = useCallback(async (p: MarkerSelectPayload) => {
    try {
      // Synchronous check against state to avoid stale-closure pitfalls
      if (lastSelectedAirport && lastSelectedAirport.code === p.id) {
        console.log('MapComponent: marker select ignored (same as last)', p.id)
        return
      }

      // Check local cache first
      let found = airportCacheRef.current.get(p.id)
      if (found === undefined) {
        // Not cached — fetch from accessor (may hit the JSON backend once)
        try {
          found = await getAirportByCode(p.id)
        } catch (fetchErr) {
          console.warn('MapComponent: getAirportByCode failed for', p.id, fetchErr)
          found = null
        }
        airportCacheRef.current.set(p.id, found)
      }

      // Update state so consumers can respond to the selection
      setLastSelectedAirport(found)
      console.log('MapComponent: marker selected', p.id, found)
      // TODO: trigger any further actions (detail panel, fetch extra data, etc.)
    } catch (e) {
      console.error('MapComponent: error handling marker select', e)
    }
  }, [getAirportByCode, lastSelectedAirport])

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
  <LeafletMapHostComponent mapUpdatedEvent={handleMapUpdated} markers={markers} onMarkerSelect={handleMarkerSelect} />
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
