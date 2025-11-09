import { useCallback } from "react";
import { useAirports } from "./data/useAirports";
import { useTerritories } from "./data/useTerritories";

// --- Types ---
export type DistanceUnit = "km" | "miles" | "nautical-miles";
export type MatchReason = "within-radius" | "nearest-N" | "continent-match";

export interface Airport {
  code: string;
  name: string;
  lat_decimal: number;
  lon_decimal: number;
  country: string;
  continent?: string;
}

export type ContinentCode = string;

export interface AirportDistanceSearchOptions {
  centerLat: number;
  centerLon: number;
  maxResults?: number;
  radius?: number;
  units?: DistanceUnit;
  airportCodes?: string[];
  countryCodes?: string[];
  continentCodes?: ContinentCode[];
}

export interface AirportWithDistanceSearchInfo {
  airport: Airport;
  distance: number;
  units: DistanceUnit;
  matchReason: MatchReason;
}

// --- Conversion constants ---
const KM_PER_MILE = 1.60934;
const KM_PER_NAUTICAL_MILE = 1.852;

// --- Pure utility functions (stateless, reusable, testable) ---
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

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

function calculateDistance(a1: Airport, a2: Airport): number {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(a1.lat_decimal);
  const lat2 = toRadians(a2.lat_decimal);
  const dLat = toRadians(a2.lat_decimal - a1.lat_decimal);
  const dLon = toRadians(a2.lon_decimal - a1.lon_decimal);

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
  if (continentCodes?.includes(airport.continent || "")) return "continent-match";
  return "nearest-N";
}

// --- Main hook ---
export function useDistanceCalculator() {
  // ✅ Bring in your data access hooks
  const airportsService = useAirports();
  const territoriesService = useTerritories();

  // Internal helper that depends on those hooks
  const getFilteredAirports = useCallback(async (
    airportCodes?: string[],
    countryCodes?: string[],
    continentCodes?: ContinentCode[]
  ): Promise<Airport[]> => {

    // Resolve countries
    const [countriesFromContinents, countriesFromCodes] = await Promise.all([
      continentCodes?.length ? territoriesService.filterByContinentCodeValues(continentCodes) : [],
      countryCodes?.length ? territoriesService.filterByCodeValues(countryCodes) : []
    ]);

    const combinedCountries = [
      ...countriesFromContinents.filter(
        c => !countriesFromCodes.some(cc => cc.code === c.code)
      ),
      ...countriesFromCodes
    ];


    // Retrieve airports
    const [airportsFromCountries, airportsFromCodes] = await Promise.all([
      combinedCountries.length
        ? airportsService.filterByCountryValues(combinedCountries.map(c => c.code))
        : [],
      airportCodes?.length
        ? airportsService.filterByCodeValues(airportCodes)
        : []
    ]);

    const combinedAirports = [
      ...airportsFromCountries.filter(a => !airportsFromCodes.some(ac => ac.code === a.code)),
      ...airportsFromCodes
    ];

    return combinedAirports;
  }, [airportsService, territoriesService]);

  // Public method: find airports near a given location
  const findNearbyAirports = useCallback(async (
    options: AirportDistanceSearchOptions
  ): Promise<AirportWithDistanceSearchInfo[]> => {

    const {
      centerLat, centerLon,
      maxResults, radius,
      units = "km",
      airportCodes, countryCodes, continentCodes
    } = options;

    validateCoordinates(centerLat, centerLon);

    const candidateAirports =
      !airportCodes?.length && !countryCodes?.length && !continentCodes?.length
        ? await airportsService.getAll()
        : await getFilteredAirports(airportCodes, countryCodes, continentCodes);

    const results = candidateAirports.map(a => {
      const distKm = calculateDistance(
        { lat_decimal: centerLat, lon_decimal: centerLon } as Airport,
        a
      );
      return {
        airport: a,
        distance: convertFromKilometers(distKm, units),
        units,
        matchReason: determineMatchReason(a, airportCodes, countryCodes, continentCodes)
      };
    });

    // Optional filtering and sorting
    let filtered = results;
    if (radius !== undefined) {
      const radiusKm = convertToKilometers(radius, units);
      filtered = results
        .filter(r => convertToKilometers(r.distance, units) <= radiusKm)
        .map(r => ({ ...r, matchReason: "within-radius" }));
    }

    filtered.sort((a, b) => a.distance - b.distance);
    return maxResults ? filtered.slice(0, maxResults) : filtered;

  }, [airportsService, getFilteredAirports]);

  // Public API
  return { calculateDistance, findNearbyAirports };
}
