import { useState, useCallback, useEffect } from 'react'
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator'
import type { AirportDistanceSearchOptions, AirportWithDistanceSearchInfoResults, SortByInfoFieldsType } from '../../hooks/useDistanceCalculator'
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
  sortByInfoFields?: SortByInfoFieldsType
  pageIndex?: number
  pageSize?: number
  auto?: boolean
}

export default function NearestAirportsTableComponent(props: Props) {
  const {
    currentPosition,
    radius,
    maxResults,
    units = 'km',
    useCurrentLocationIfAvailable = true,
    airportCodes,
    countryCodes,
    continentCodes,
    sortByInfoFields = { distance: 'asc' },
    pageIndex = 0,
    pageSize = 10 } = props;
  const { findNearbyAirports } = useDistanceCalculator()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading_, setLoading] = useState(false)
  const [results, setResults] = useState<AirportWithDistanceSearchInfoResults | null>(null)
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
        sortByInfoFields,
        pageIndex,
        pageSize,
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
  }, [currentPosition?.lat_decimal, currentPosition?.lon_decimal, radius, maxResults, units, useCurrentLocationIfAvailable, airportCodes, countryCodes, continentCodes, sortByInfoFields, pageIndex, pageSize, findNearbyAirports])

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  return (
    <div className="nearest-airports">

      {error && <div className="nearest-airports-error">{error}</div>}

      {results === null ? (
        <div className="nearest-airports-empty">No results — click "Find Nearby Airports" to search.</div>
      ) : results.airportInfoItems.length === 0 ? (
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
            {results.airportInfoItems.map((r) => (
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
