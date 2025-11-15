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

// Split a GeoRegion if it crosses the antimeridian (longitude wrap at ±180).
// If the region does not wrap, returns an array containing the original region.
// If it wraps (west > east), returns two regions: [west..180] and [-180..east].
export function splitGeoRegionAtAntimeridian(region: GeoRegion): GeoRegion[] {
  // normalize longitudes to [-180, 180) to handle Leaflet-style longitudes
  const normLon = (lon: number) => {
    let l = ((lon + 180) % 360)
    if (l < 0) l += 360
    return l - 180
  }

  const west = normLon(region.southWest.lon_decimal)
  const east = normLon(region.northEast.lon_decimal)

  if (west <= east) {
    // return region with original latitudes and normalized longitudes
    return [{
      southWest: { lat_decimal: region.southWest.lat_decimal, lon_decimal: west },
      northEast: { lat_decimal: region.northEast.lat_decimal, lon_decimal: east },
    }]
  }

  const south = region.southWest.lat_decimal
  const north = region.northEast.lat_decimal

  const left: GeoRegion = {
    southWest: { lat_decimal: south, lon_decimal: west },
    northEast: { lat_decimal: north, lon_decimal: 180 },
  }

  const right: GeoRegion = {
    southWest: { lat_decimal: south, lon_decimal: -180 },
    northEast: { lat_decimal: north, lon_decimal: east },
  }

  return [left, right]
}

export function useContinentSearch() {
  return useContinents()
}
