import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FLIGHT_STATUS, type Flight } from '../../models/flight.model';
import { generateGuid } from '../../utils/generateGuid';

// optional artificial latency (ms)
const LATENCY = 150;
const withLatency = <T,>(result: T) => new Promise<T>((res) => setTimeout(() => res(result), LATENCY));

export interface FlightCreateParams {
  // Minimal required creation parameters: caller must provide these four.
  departureAirport: string;
  destinationAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  distanceKm: number;
  durationMinutes: number;
}

// Format a Date (UTC) to YYYYDDHHmm as requested (four-digit year, day, hour, minute)
function formatYYYYDDHHmm(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getUTCFullYear().toString();
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  return `${yyyy}${dd}${hh}${mm}`;
}

// The hook will own the flights state (single source-of-truth per-hook).
// This keeps the logic local and testable while still simulating an async
// fake HTTP API via `withLatency`.


// Hook: fetches initial data on mount and exposes async CRUD methods that
// update local state after the operation completes. This is a simple fake-HTTP
// client pattern — consumers await methods and the hook keeps UI state in sync.
export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);

  const getAll = useCallback(async () => {
    // return a copy to mimic an immutable response
    return withLatency([...flights]);
  }, [flights]);

  const getByCode = useCallback(async (code: string) => {
    const found = flights.find((p) => p.code === code) ?? null;
    return withLatency(found);
  }, [flights]);

  const create = useCallback(async (payload: FlightCreateParams) => {
    const now = new Date();
    const code = generateGuid();
    const departure = payload.departureTime;
    const arrival = payload.arrivalTime;
    const name = payload.departureAirport + formatYYYYDDHHmm(departure) + payload.destinationAirport;
    const newFlight: Flight = {
      code,
      name,
      origin: payload.departureAirport,
      destination: payload.destinationAirport,
      departureTime: departure,
      arrivalTime: arrival,
      status: DEFAULT_FLIGHT_STATUS,
      distanceKm: payload.distanceKm,
      durationMinutes: payload.durationMinutes,
      actualDepartureTime: null,
      actualArrivalTime: null,
      createdAt: now,
      updatedAt: now,
    };

    setFlights((prev) => {
      if (prev.length % 50 === 0) {
        console.log(`Creating flight ${newFlight.code} (${prev.length} flights total)`);
      }
      // console.log('prev:', prev);
      return [...prev, newFlight];
    });
    return withLatency(newFlight);
  }, []);

  const update = useCallback(async (code: string) => {
    const now = new Date();
    let updated: Flight | null = null;

    // Compute the next array from the current `flights` state synchronously,
    // then set it. This avoids mutating an outer variable from inside the
    // state updater callback and is easier to reason about.
    const next = flights.map((f) => {
      if (f.code !== code) return f;
      const copy = { ...f };
      if (copy.status === 'scheduled' && copy.departureTime < now) {
        copy.status = 'enroute';
        copy.updatedAt = now;
      }
      if ((copy.status === 'scheduled' || copy.status === 'enroute') && copy.arrivalTime < now) {
        copy.status = 'landed';
        copy.updatedAt = now;
      }
      updated = copy;
      return copy;
    });

    setFlights(next);
    return withLatency(updated);
  }, [flights]);

  const remove = useCallback(async (code: string) => {
    let removed = false;
    setFlights((prev) => {
      const next = prev.filter((p) => p.code !== code);
      removed = next.length !== prev.length;
      return next;
    });
    return withLatency(removed);
  }, []);

  const api = useMemo(() => ({
    // flights: flights,
    getAll,
    getByCode,
    create,
    update,
    remove,
  }), [getAll, getByCode, create, update, remove]);

  return api;
}