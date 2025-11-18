import React, { useState, useCallback } from 'react'
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator'
import type { AirportWithDistanceSearchInfo, AirportDistanceSearchOptions } from '../../hooks/useDistanceCalculator'
import './NearestAirportsTableComponent.css'

type Props = {
  radius?: number
  maxResults?: number
  units?: 'km' | 'miles' | 'nautical-miles'
  useCurrentLocationIfAvailable?: boolean
  airportCodes?: string[]
  countryCodes?: string[]
  continentCodes?: string[]
  auto?: boolean
}

export default function NearestAirportsTableComponent({
  radius = 50,
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
  }, [radius, maxResults, units, useCurrentLocationIfAvailable, airportCodes, countryCodes, continentCodes, findNearbyAirports])

  React.useEffect(() => {
    if (auto) load()
  }, [auto, load])

  return (
    <div className="nearest-airports">
      <div className="nearest-airports-header">
        <button onClick={load} disabled={loading} className="nearest-airports-btn">
          {loading ? 'Locating…' : 'Find Nearby Airports'}
        </button>
      </div>

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
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.airport.code}>
                <td>{r.airport.code}</td>
                <td>{r.airport.name}</td>
                <td>{r.airport.country}</td>
                <td>{Number(r.distance).toFixed(1)}</td>
                <td>{r.matchReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
