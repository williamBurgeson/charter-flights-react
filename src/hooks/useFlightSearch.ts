import { useCallback } from 'react'
import { useAirportSearch, type AirportSearchParams } from "./useAirportSearch";
import { useFlights } from "./data/useFlights";

export interface FlightSearchParams {
  airportFromSearchParams?: AirportSearchParams;
  airportToSearchParams?: AirportSearchParams;
  departureDateFrom?: Date;
  departureDateTo?: Date;
  arrivalDateFrom?: Date;
  arrivalDateTo?: Date;
  itemsFromBeginning?: number;
  itemsFromEnd?: number;
}

export function useFlightSearch() {
  const { searchAirports } = useAirportSearch();
  const { filterByAirportCodes } = useFlights();

  // Memoize the searchFlights function so callers (like App) get a stable
  // identity and don't accidentally retrigger effects on every render.
  const searchFlights = useCallback(async (params: FlightSearchParams) => {
    // Implementation to search flights based on params

    const candidateAirportsFrom = await searchAirports(params.airportFromSearchParams || {});
    const candidateAirportsTo = await searchAirports(params.airportToSearchParams || {});

    const candidateAirportCodesFrom = candidateAirportsFrom.map(a => a.code);
    const candidateAirportCodesTo = candidateAirportsTo.map(a => a.code);

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

    if (params.itemsFromBeginning !== undefined) {
      candidateFlights = candidateFlights.slice(0, params.itemsFromBeginning);
    }

    if (params.itemsFromEnd !== undefined) {
      const itemsFromEnd = params.itemsFromEnd;
      candidateFlights = candidateFlights.slice(0 - itemsFromEnd);
    }
    return candidateFlights;
  }, [searchAirports, filterByAirportCodes]);

  return { searchFlights };
}

