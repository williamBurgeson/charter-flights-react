import { useCallback } from "react";
import type { ContinentCode } from "../models/continent.model";
import { useAirports } from "./data/useAirports";
import { useTerritories } from "./data/useTerritories";
import type { Airport } from "../models/airport.model";
import type { Territory } from "../models/territory.model";
import type { GeoRegion } from "../models/geo-types";

export interface HierarchicalAirportSearchParams {
  airportCodes?: string[];
  countryCodes?: string[];
  continentCodes?: ContinentCode[];
}

export interface LatLonBoundsAirportSearchParams {
  maxLatitude?: number;
  minLatitude?: number;
  maxLongitude?: number;
  minLongitude?: number;
}

export interface AirportSearchParams 
  extends HierarchicalAirportSearchParams, LatLonBoundsAirportSearchParams { }

function hierarchicalParamsAreEmpty(params: HierarchicalAirportSearchParams): boolean {
  return !params.airportCodes?.length && !params.countryCodes?.length && !params.continentCodes?.length;
}

function latLonBoundsParamsAreEmpty(params: LatLonBoundsAirportSearchParams): boolean {
  return (
    params.maxLatitude === undefined && params.minLatitude === undefined &&
    params.maxLongitude === undefined && params.minLongitude === undefined
  );
} 

function convertGeoRegionToLatLonBounds(geoRegion: GeoRegion): LatLonBoundsAirportSearchParams {
  return {
    maxLatitude: geoRegion.northEast.lat_decimal,
    minLatitude: geoRegion.southWest.lat_decimal,
    maxLongitude: geoRegion.northEast.lon_decimal,
    minLongitude: geoRegion.southWest.lon_decimal,
  };
}

export function useAirportSearch() {
  const { filterByCountryValues: filterAirportsByCountryValues, filterByCodeValues: filterAirportsByCodeValues, getAll: getAllAirports } = useAirports();
  
  const { filterByContinentCodeValues : filterCountriesByContinentCodeValues, filterByCodeValues: filterCountriesByCodeValues } = useTerritories();

  // IMPORTANT: the returned list object is null to allow caller to distinguish "no filtering" from "filtered to empty set"
  const getCandidateCountries = useCallback(async (params : HierarchicalAirportSearchParams): Promise<Territory[] | null> => {

    if (!params.continentCodes?.length && !params.countryCodes?.length) { 
      return null;
    }
    
    let candidateTerritories: Territory[] | null  = null;

        // Note that if both continentCodes and countryCodes are provided, we need to combine the results, and 
    // prefer countryCodes over continentCodes in case of overlap (as in the future the the data may be 
    // enhanced for countries specifically selected rather than all countries in a continent)
    if (params.continentCodes?.length) {
      const countriesFromContinents = await filterCountriesByContinentCodeValues(params.continentCodes);

      // If continentCodes and countryCodes are both provided, we need to dedupe by prioritizing country records
      // returned directly by code over those inferred from continent membership, as in the future the data may be
      // enhanced for countries specifically selected rather than all countries in a continent.
      if (params.countryCodes?.length) {

        const countriesFromCodes = await filterCountriesByCodeValues(params.countryCodes);
        candidateTerritories = [
          ...countriesFromContinents.filter(
            c => !countriesFromCodes.some(cc => cc.code === c.code)
          ),
          ...countriesFromCodes
        ];
      } else {
        candidateTerritories = countriesFromContinents;
      }
    } else if (params.countryCodes?.length) {
      candidateTerritories = await filterCountriesByCodeValues(params.countryCodes);
    }

    return candidateTerritories;
  }, [filterCountriesByContinentCodeValues, filterCountriesByCodeValues]);

  // IMPORTANT: the returned list object is null to allow caller to distinguish "no filtering" from "filtered to empty set"
  const filterAirportsByHierarchicalParams = useCallback(async (params: HierarchicalAirportSearchParams, candidateAirports: Airport[] | null = null) => {
    // If candidateAirports is provided, filter within that set; otherwise, fetch from data source
    if (hierarchicalParamsAreEmpty(params)) {
      return candidateAirports ?? await getAllAirports(); 
    }

    const candidateTerritories = await getCandidateCountries(params);

    if (candidateAirports !== null) {
      if (candidateTerritories !== null) {
        candidateAirports = candidateAirports.filter(a =>
          candidateTerritories.some(t => t.code === a.country)
        );
      }

      if (params.airportCodes?.length) {
        candidateAirports = candidateAirports.filter(a =>
          params.airportCodes!.includes(a.code)
        );

        return candidateAirports;
      }
    }

    if (candidateTerritories !== null) {
      candidateAirports = await filterAirportsByCountryValues(candidateTerritories.map(t => t.code));
    }

    if (params.airportCodes?.length) {
      const airportsFromCodes = await filterAirportsByCodeValues(params.airportCodes);

      if (candidateAirports === null) {
        candidateAirports = airportsFromCodes;
      } else {
        candidateAirports = [
          ...candidateAirports.filter(a => !airportsFromCodes.some(ac => ac.code === a.code)),
          ...airportsFromCodes
        ];
      }
    }

    return candidateAirports;
  }, [getCandidateCountries, filterAirportsByCountryValues, filterAirportsByCodeValues, getAllAirports]);

  const filterAirportsByLatLonBounds = useCallback(async (params: LatLonBoundsAirportSearchParams, candidateAirports: Airport[] | null = null) => {
    // If candidateAirports is provided, filter within that set; otherwise, fetch from data source
    if (latLonBoundsParamsAreEmpty(params)) {
      return candidateAirports; 
    }

    // The set up is suboptimal in that it would be better to do this sort of filtering at data source level,
    // or at the very least inside the repo class useAirports but this is the first instance of comparative 
    // filtering (i.e. filtering based on greater or less than rather a value match or membership of a list) 
    // so we implement here for now.
    if (candidateAirports === null) {
      candidateAirports = await getAllAirports();
    }

    if (params.maxLatitude !== undefined) {
      candidateAirports = candidateAirports.filter(a => a.lat_decimal <= params.maxLatitude!);
    }
    if (params.minLatitude !== undefined) {
      candidateAirports = candidateAirports.filter(a => a.lat_decimal >= params.minLatitude!);
    }
    if (params.maxLongitude !== undefined) {
      candidateAirports = candidateAirports.filter(a => a.lon_decimal <= params.maxLongitude!);
    }
    if (params.minLongitude !== undefined) {
      candidateAirports = candidateAirports.filter(a => a.lon_decimal >= params.minLongitude!);
    }
    return candidateAirports;
  }, [getAllAirports]);

  const searchAirports = useCallback(async (params: AirportSearchParams) => {
    if (hierarchicalParamsAreEmpty(params) && latLonBoundsParamsAreEmpty(params)) {
      // No filters provided, return all airports
      return await getAllAirports(); 
    }

    let candidateAirports: Airport[] | null = await filterAirportsByHierarchicalParams(params);

    candidateAirports = await filterAirportsByLatLonBounds(params, candidateAirports);

    return candidateAirports ?? [];
  }, [getAllAirports, filterAirportsByHierarchicalParams, filterAirportsByLatLonBounds]);
  return { searchAirports }
}
