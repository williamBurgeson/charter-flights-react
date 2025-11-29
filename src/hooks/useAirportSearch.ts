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

type SortByAirportFieldsType = Partial<Record<keyof Airport, "asc" | "desc">>;

export interface AirportSearchParams 
  extends HierarchicalAirportSearchParams, LatLonBoundsAirportSearchParams { 
  itemsFromBeginning?: number;
  itemsFromEnd?: number;
  pageIndex?: number;
  pageSize?: number;
  sortByAirportFields?: SortByAirportFieldsType;
  applyFiltersBeforeDistanceCalculations?: boolean;
}
  
export interface AirportSearchResult {
  airports: Airport[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

function hierarchicalParamsAreEmpty(params: HierarchicalAirportSearchParams): boolean {
  return !params.airportCodes?.length && !params.countryCodes?.length && !params.continentCodes?.length;
}

function latLonBoundsParamsAreEmpty(params: LatLonBoundsAirportSearchParams): boolean {
  return (
    params.maxLatitude === undefined && params.minLatitude === undefined &&
    params.maxLongitude === undefined && params.minLongitude === undefined
  );
} 

function sortingParamsAreEmpty(params: AirportSearchParams): boolean {
  const sortBy = params.sortByAirportFields as SortByAirportFieldsType | undefined;
  return !sortBy || Object.keys(sortBy).length === 0;
}

function pagingParamsAreEmpty(params: AirportSearchParams): boolean {
  return (
    params.itemsFromBeginning === undefined && params.itemsFromEnd === undefined &&
    params.pageIndex === undefined && params.pageSize === undefined
  );
}

function applySorting(airports: Airport[], params: AirportSearchParams): Airport[] {
  if (sortingParamsAreEmpty(params)) {
    return airports;
  }
  const sortBy = params.sortByAirportFields as SortByAirportFieldsType;
  return [...airports].sort((a, b) => {
    for (const key of Object.keys(sortBy!) as (keyof Airport)[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((a[key] as any) < (b[key] as any)) {
        return sortBy![key] === "asc" ? -1 : 1; 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((a[key] as any) > (b[key] as any)) {
        return sortBy![key] === "asc" ? 1 : -1;
      }
    }
    return 0;
  }
  );
}

function applyPaging(airports: Airport[], params: AirportSearchParams): Airport[] {
  if (pagingParamsAreEmpty(params)) {
    return airports;
  }
  let pagedAirports = airports;
  if (params.itemsFromBeginning !== undefined) {
    pagedAirports = pagedAirports.slice(0, params.itemsFromBeginning);
  }
  if (params.itemsFromEnd !== undefined) {
    const itemsFromEnd = params.itemsFromEnd;
    pagedAirports = pagedAirports.slice(0 - itemsFromEnd);
  }
  if (params.pageIndex !== undefined && params.pageSize !== undefined) {
    const start = params.pageIndex * params.pageSize;
    pagedAirports = pagedAirports.slice(start, start + params.pageSize);
  }
  return pagedAirports;
}

// May be helpful later on but is not currently used elsewhere
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function convertGeoRegionToLatLonBounds(geoRegion: GeoRegion): LatLonBoundsAirportSearchParams {
  return {
    maxLatitude: geoRegion.northEast.lat_decimal,
    minLatitude: geoRegion.southWest.lat_decimal,
    maxLongitude: geoRegion.northEast.lon_decimal,
    minLongitude: geoRegion.southWest.lon_decimal,
  };
}

export function useAirportSearch() {
  const { filterByCountryValues: filterAirportsByCountryValues, filterByCodeValues: filterAirportsByCodeValues, getAll: getAllAirports } = useAirports();
  
  const { filterByContinentsValues : filterCountriesByContinentsValues, filterByCodeValues: filterCountriesByCodeValues } = useTerritories();

  // IMPORTANT: the returned list object is null to allow caller to distinguish "no filtering" from "filtered to empty set"
  const getCandidateCountries = useCallback(async (params : HierarchicalAirportSearchParams): Promise<Territory[] | null> => {

    if (!params.continentCodes?.length && !params.countryCodes?.length) { 
      return null;
    }
    
    let candidateTerritories: Territory[] | null  = null;

    if (params.continentCodes?.length) {
      const countriesFromContinents = await filterCountriesByContinentsValues(params.continentCodes);

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
  }, [filterCountriesByContinentsValues, filterCountriesByCodeValues]);

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

    // The set up is inherently suboptimal in that it would be better to do this sort of filtering at data source
    // level, or at the very least inside the repo class useAirports but this is the first instance of comparative 
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

  const searchAirports = useCallback(async (params: AirportSearchParams): Promise<AirportSearchResult> => {
    let candidateAirports: Airport[] = await getAllAirports();

    if (hierarchicalParamsAreEmpty(params) && 
      latLonBoundsParamsAreEmpty(params) && 
      pagingParamsAreEmpty(params)) {
      // No filters or paging provided, get all airports

      if (!sortingParamsAreEmpty(params)) {
        candidateAirports = applySorting(candidateAirports, params.sortByAirportFields!);
      }

      return { 
        airports: candidateAirports, 
        totalCount: candidateAirports.length, 
        pageIndex: 0, 
        pageSize: candidateAirports.length 
      };
    }

    candidateAirports = (await filterAirportsByHierarchicalParams(params, candidateAirports))!

    candidateAirports = (await filterAirportsByLatLonBounds(params, candidateAirports))!

    // IMPORTANT: this functionality is also called from the distance calculator hook,
    // which may want to do filtering before distance calculations and defer sorting/paging
    // until after distances have been calculated. So we need to support that use case here.
    if (!params.applyFiltersBeforeDistanceCalculations || pagingParamsAreEmpty(params)) {
      const totalCount = candidateAirports.length;

      if (!sortingParamsAreEmpty(params)) {
        candidateAirports = applySorting(candidateAirports, params);
      } 

      return {
        airports: candidateAirports,
        totalCount,
        pageIndex: 0,
        pageSize: totalCount
      };
    }
    
    candidateAirports = applySorting(candidateAirports, params.sortByAirportFields!);

    candidateAirports = applyPaging(candidateAirports, params);

    return { 
      airports: candidateAirports, 
      totalCount: candidateAirports.length,
      pageIndex: params.pageIndex ?? 0,
      pageSize: params.pageSize ?? candidateAirports.length
    };
  }, [getAllAirports, filterAirportsByHierarchicalParams, filterAirportsByLatLonBounds]);
  return { searchAirports }
}
