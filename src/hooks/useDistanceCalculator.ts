import { useCallback } from "react";

import type { Airport } from "../models/airport.model";
import type { ContinentCode } from "../models/continent.model";
import type { GeoPoint } from "../models/geo-types";
import { useAirportSearch, type AirportSearchParams } from "./useAirportSearch";

// --- Types ---
export type DistanceUnit = "km" | "miles" | "nautical-miles";
export type MatchReason = "within-radius" | "nearest-N" | "continent-match";

export interface AirportDistanceSearchOptions extends AirportSearchParams {
  centerLat?: number;
  centerLon?: number;
  maxResults?: number;
  radius?: number;
  units?: DistanceUnit;
  useCurrentLocationIfAvailable: boolean;
  sortByInfoFields?: Partial<Record<keyof InfoExceptAirport, "asc" | "desc">>;
}

export interface AirportWithDistanceSearchInfo {
  airport: Airport;
  distance: number;
  units: DistanceUnit;
  matchReason: MatchReason;
}

export interface AirportWithDistanceSearchInfoResults {
  airportInfoItems: AirportWithDistanceSearchInfo[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;  
}

type InfoExceptAirport = Omit<AirportWithDistanceSearchInfo, 'airport'>;

// --- Conversion constants ---
const KM_PER_MILE = 1.60934;
const KM_PER_NAUTICAL_MILE = 1.852;

// --- Pure utility functions (stateless, reusable, testable) ---
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Validates latitude and longitude values - allow longitudes from -200 to 200
// to accommodate territories near the dateline
function validateCoordinates(lat: number, lon: number): void {
  if (lat < -90 || lat > 90) throw new Error(`Invalid latitude: ${lat}`);
  if (lon < -200 || lon > 200) throw new Error(`Invalid longitude: ${lon}`);
}

function convertToKilometers(distance: number, fromUnit: DistanceUnit): number {
  switch (fromUnit) {
    case "miles": return distance * KM_PER_MILE;
    case "nautical-miles": return distance * KM_PER_NAUTICAL_MILE;
    default: return distance;
  }
}

function convertFromKilometers(distance: number, toUnit: DistanceUnit): number {
  switch (toUnit) {
    case "miles": return distance / KM_PER_MILE;
    case "nautical-miles": return distance / KM_PER_NAUTICAL_MILE;
    default: return distance;
  }
}

function applySorting(
  candidateResults: AirportWithDistanceSearchInfo[],
  options: AirportDistanceSearchOptions
): AirportWithDistanceSearchInfo[] {
  const sortByInfoFields = options.sortByInfoFields;
  if (!sortByInfoFields || Object.keys(sortByInfoFields).length === 0) {
    return candidateResults;
  }
  return [...candidateResults].sort((a, b) => {
    for (const key of Object.keys(sortByInfoFields) as (keyof InfoExceptAirport)[]) {
      if (a[key] < b[key]) {
        return sortByInfoFields[key] === "asc" ? -1 : 1;
      } else if (a[key] > b[key]) {
        return sortByInfoFields[key] === "asc" ? 1 : -1;
      }
    }
    return 0;
  });
}

function applyPaging(
  items: AirportWithDistanceSearchInfo[],
  options: AirportDistanceSearchOptions): AirportWithDistanceSearchInfo[] {
    let pagedItems = items;
  if (options.itemsFromBeginning !== undefined) {
    pagedItems = pagedItems.slice(0, options.itemsFromBeginning);
  }
  if (options.itemsFromEnd !== undefined) {
    const itemsFromEnd = options.itemsFromEnd;
    pagedItems = pagedItems.slice(0 - itemsFromEnd);
  }
  if (options.pageIndex !== undefined && options.pageSize !== undefined) {
  const start = options.pageIndex * options.pageSize;
  pagedItems = pagedItems.slice(start, start + options.pageSize);
  }
  return pagedItems;
}

// Get current location using Geolocation API
async function getCurrrentLocation(options?: { timeoutMs?: number; maximumAgeMs?: number }): Promise<GeoPoint | null> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return null

  // If Permissions API is available, bail out quickly on explicit deny
  try {
    if ('permissions' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = await (navigator as any).permissions.query({ name: 'geolocation' })
      if (status?.state === 'denied') return null
    }
  } catch {
    // ignore permission errors and continue to attempt a snapshot
  }

  const timeout = options?.timeoutMs ?? 10000
  const maximumAge = options?.maximumAgeMs ?? 0

  return new Promise<GeoPoint | null>((resolve) => {
    let timedOut = false
    const timer = window.setTimeout(() => {
      timedOut = true
      resolve(null)
    }, timeout)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (timer) clearTimeout(timer)
        if (timedOut) return resolve(null)
        resolve({ lat_decimal: pos.coords.latitude, lon_decimal: pos.coords.longitude })
      },
      () => {
        if (timer) clearTimeout(timer)
        if (timedOut) return resolve(null)
        resolve(null)
      },
      { enableHighAccuracy: false, timeout, maximumAge }
    )
  })
}

// Haversine formula
function calculateDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(p1.lat_decimal);
  const lat2 = toRadians(p2.lat_decimal);
  const dLat = toRadians(p2.lat_decimal - p1.lat_decimal);
  const dLon = toRadians(p2.lon_decimal - p1.lon_decimal);

  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function determineMatchReason(
  airport: Airport,
  airportCodes?: string[],
  countryCodes?: string[],
  continentCodes?: ContinentCode[]
): MatchReason {
  if (airportCodes?.includes(airport.code)) return "nearest-N";
  if (countryCodes?.includes(airport.country)) return "nearest-N";
  if (airport.continent && continentCodes?.includes(airport.continent as ContinentCode)) return "continent-match";
  return "nearest-N";
}

// --- Main hook ---
export function useDistanceCalculator() {
  const { searchAirports } = useAirportSearch();

  // Public method: find airports near a given location
  // Returns null if location could not be determined; either because
  // lat/lon were not provided or geolocation could not determine location
  const findNearbyAirports = useCallback(async (
    options: AirportDistanceSearchOptions
  ): Promise<AirportWithDistanceSearchInfoResults | null> => {

    //just some pre-cleaning
    options ??= { useCurrentLocationIfAvailable: false };
    options.applyFiltersBeforeDistanceCalculations = false;

    const {
      maxResults, radius,
      units = "km",
      airportCodes, countryCodes, continentCodes
    } = options;

    if (options.useCurrentLocationIfAvailable && (options.centerLat === undefined || options.centerLon === undefined)) {  
      const location = await getCurrrentLocation({ timeoutMs: 5000, maximumAgeMs: 10 * 60 * 1000 });
      if (location) {
        options.centerLat = location.lat_decimal;
        options.centerLon = location.lon_decimal;
      }
    }

    if (options.centerLat === undefined || options.centerLon === undefined) {
      return null;
    } 

    const { centerLat, centerLon } = options;

    validateCoordinates(centerLat, centerLon);

    const airportSearchResults = await searchAirports(options);

    const candidateAirports = airportSearchResults.airports;

    let candidateResults = candidateAirports.map(airport => {
      const distKm = calculateDistance(
        { lat_decimal: centerLat, lon_decimal: centerLon },
        airport
      );
      return {
        airport,
        distance: convertFromKilometers(distKm, units),
        units,
        matchReason: determineMatchReason(airport, airportCodes, countryCodes, continentCodes)
      };
    });

    // Optional filtering and sorting
    // let filtered = candidateResults;
    if (radius !== undefined) {
      const radiusKm = convertToKilometers(radius, units);
      candidateResults = candidateResults
        .filter(r => convertToKilometers(r.distance, units) <= radiusKm)
        .map(r => ({ ...r, matchReason: "within-radius" }));
    }

    candidateResults = applySorting(candidateResults, options);

    candidateResults = applyPaging(candidateResults, options);

    candidateResults = maxResults ? candidateResults.slice(0, maxResults) : candidateResults;

    return { airportInfoItems: candidateResults,
      totalCount: candidateResults.length,
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? candidateResults.length,
    };

  }, [searchAirports]);

  // Public API
  return { getCurrrentLocation, calculateDistance, findNearbyAirports };
}
