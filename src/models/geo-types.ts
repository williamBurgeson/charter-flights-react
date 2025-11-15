export interface GeoPoint {
  lat_decimal: number;
  lon_decimal: number;
}

export interface GeoRegion {
  southWest: GeoPoint
  northEast: GeoPoint
}
