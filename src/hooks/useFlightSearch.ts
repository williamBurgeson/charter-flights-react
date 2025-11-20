import { useCallback } from 'react'
import { useAirportSearch, type AirportSearchParams } from "./useAirportSearch";
import { useFlights } from "./data/useFlights";
import type { Flight } from '../models/flight.model';

export interface FlightSearchParams {
  airportFromSearchParams?: AirportSearchParams;
  airportToSearchParams?: AirportSearchParams;
  departureDateFrom?: Date;
  departureDateTo?: Date;
  arrivalDateFrom?: Date;
  arrivalDateTo?: Date;
  itemsFromBeginning?: number;
  itemsFromEnd?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface FlightSearchResult {
  flights: Flight[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export function useFlightSearch() {
  const { searchAirports } = useAirportSearch();
  const { filterByAirportCodes } = useFlights();

  const searchFlights = useCallback(async (params: FlightSearchParams) => {

    const candidateAirportsFrom = await searchAirports(params.airportFromSearchParams || {});
    const candidateAirportsTo = await searchAirports(params.airportToSearchParams || {});

    const candidateAirportCodesFrom = candidateAirportsFrom.airports.map(a => a.code);
    const candidateAirportCodesTo = candidateAirportsTo.airports.map(a => a.code);

    let candidateFlights = await filterByAirportCodes(candidateAirportCodesFrom, candidateAirportCodesTo, true);

    if (params.departureDateFrom) {
      candidateFlights = candidateFlights.filter(f => f.departureTime >= params.departureDateFrom!);
    }

    if (params.departureDateTo) {
      candidateFlights = candidateFlights.filter(f => f.departureTime <= params.departureDateTo!);
    }

    if (params.arrivalDateFrom) {
      candidateFlights = candidateFlights.filter(f => f.arrivalTime >= params.arrivalDateFrom!);
    }

    if (params.arrivalDateTo) {
      candidateFlights = candidateFlights.filter(f => f.arrivalTime <= params.arrivalDateTo!);
    }

    candidateFlights.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());

    if (params.itemsFromBeginning !== undefined) {
      candidateFlights = candidateFlights.slice(0, params.itemsFromBeginning);
    }

    if (params.itemsFromEnd !== undefined) {
      const itemsFromEnd = params.itemsFromEnd;
      candidateFlights = candidateFlights.slice(0 - itemsFromEnd);
    }

    if (params.pageIndex === undefined) {
      params.pageIndex = 0;
    }

    if (params.pageSize === undefined) {
      params.pageSize = candidateFlights.length;
    }

    const start = params.pageIndex * params.pageSize;
    const end = start + params.pageSize;

    // totalCount should represent the number of matching items BEFORE paging
    // (i.e. the full set after filtering and any pre-paging trimming like
    // itemsFromBeginning/itemsFromEnd). Capture that size, then slice for the
    // current page.
    const totalCount = candidateFlights.length
    candidateFlights = candidateFlights.slice(start, end);

    const results = {
      flights: candidateFlights,
      totalCount,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    }

    return results;
  }, [searchAirports, filterByAirportCodes]);

  return { searchFlights };
}

