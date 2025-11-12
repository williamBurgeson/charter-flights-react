import { useCallback } from "react";
import type { ContinentCode } from "../models/continent.model";
import { useAirports } from "./data/useAirports";
import { useTerritories } from "./data/useTerritories";

export interface AirportSearchParams {
  airportCodes?: string[];
  countryCodes?: string[];
  continentCodes?: ContinentCode[];
}

export function useAirportSearch() {
  // This is a placeholder for the actual implementation of the airport search hook.
  // You would typically include data access logic here.  
  const { filterByCountryValues: filterAirportsByCountryValues, filterByCodeValues: filterAirportsByCodeValues, getAll: getAllAirports } = useAirports();
  
  const { filterByContinentCodeValues : filterCountriesByContinentCodeValues, filterByCodeValues: filterCountriesByCodeValues } = useTerritories();

  const searchAirports = useCallback(async (params: AirportSearchParams) => {
    // Implementation to search airports based on params

    const { airportCodes, countryCodes, continentCodes } = params;

    if (!airportCodes?.length && !countryCodes?.length && !continentCodes?.length) {
      // No filters provided, return all airports
      return await getAllAirports(); 
    }

    // Resolve countries
    const [countriesFromContinents, countriesFromCodes] = await Promise.all([
      continentCodes?.length ? filterCountriesByContinentCodeValues(continentCodes) : [],
      countryCodes?.length ? filterCountriesByCodeValues(countryCodes) : []
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
        ? filterAirportsByCountryValues(combinedCountries.map(c => c.code))
        : [],
      airportCodes?.length
        ? filterAirportsByCodeValues(airportCodes)
        : []
    ]);

    const combinedAirports = [
      ...airportsFromCountries.filter(a => !airportsFromCodes.some(ac => ac.code === a.code)),
      ...airportsFromCodes
    ];

    return combinedAirports;
  }, [filterAirportsByCountryValues, filterAirportsByCodeValues, filterCountriesByContinentCodeValues, filterCountriesByCodeValues]);
    return { searchAirports }
}
