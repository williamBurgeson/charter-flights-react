import React, { useState, useCallback } from 'react'
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator'
import type { AirportWithDistanceSearchInfo, AirportDistanceSearchOptions } from '../../hooks/useDistanceCalculator'
import './NearestAirportsTableComponent.css'
import type { ContinentCode } from '../../models/continent.model'
import type { GeoPoint } from '../../models/geo-types'

type Props = {
  currentPosition?: GeoPoint | null
  radius?: number
  maxResults?: number
  units?: 'km' | 'miles' | 'nautical-miles'
  useCurrentLocationIfAvailable?: boolean
  airportCodes?: string[]
  countryCodes?: string[]
  continentCodes?: ContinentCode[]
  auto?: boolean
}

export default function NearestAirportsTableComponent({
  currentPosition,
  radius = 10000,
  maxResults = 10,
  units = 'km',
  useCurrentLocationIfAvailable = true,
  airportCodes,
  countryCodes,
  continentCodes,
  auto = false,
}: Props) {
  const { findNearbyAirports } = useDistanceCalculator()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AirportWithDistanceSearchInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const opts: AirportDistanceSearchOptions = {
        centerLat: currentPosition?.lat_decimal,
        centerLon: currentPosition?.lon_decimal,
        radius,
        maxResults,
        units,
        useCurrentLocationIfAvailable,
        airportCodes,
        countryCodes,
        continentCodes,
        
      }
      const r = await findNearbyAirports(opts)
      setResults(r)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('NearestAirportsTableComponent: error loading nearby airports', e)
      setError(String(e ?? 'Unknown error'))
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [currentPosition?.lat_decimal, currentPosition?.lon_decimal, radius, maxResults, units, useCurrentLocationIfAvailable, airportCodes, countryCodes, continentCodes, findNearbyAirports])

  React.useEffect(() => {
    load()
  }, [auto, load])

  return (
    <div className="nearest-airports">

      {error && <div className="nearest-airports-error">{error}</div>}

      {results === null ? (
        <div className="nearest-airports-empty">No results — click "Find Nearby Airports" to search.</div>
      ) : results.length === 0 ? (
        <div className="nearest-airports-empty">No nearby airports found.</div>
      ) : (
        <table className="nearest-airports-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Country</th>
              <th>Distance ({units})</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.airport.code}>
                <td>{r.airport.code}</td>
                <td>{r.airport.name}</td>
                <td>{r.airport.country}</td>
                <td>{Number(r.distance).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
