import { useContinents } from './data/useContinents'
import type { GeoPoint, GeoRegion } from '../models/geo-types'

// Pure helper: normalize two corner points into a GeoRegion with
// southWest (min lat/lon) and northEast (max lat/lon).
export function normalizeRegionBounds(p1: GeoPoint, p2: GeoPoint): GeoRegion {
  const south = Math.min(p1.lat_decimal, p2.lat_decimal)
  const north = Math.max(p1.lat_decimal, p2.lat_decimal)
  const west = Math.min(p1.lon_decimal, p2.lon_decimal)
  const east = Math.max(p1.lon_decimal, p2.lon_decimal)

  return {
    southWest: { lat_decimal: south, lon_decimal: west },
    northEast: { lat_decimal: north, lon_decimal: east },
  }
}

export function useContinentSearch() {
  return useContinents()
}
