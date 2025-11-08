import { useEffect, useState } from 'react';
import { DEFAULT_FLIGHT_STATUS, type Flight } from '../../models/flight.model';
import { generateGuid } from '../generateGuid';

// Fake HTTP-style in-memory service: async methods (Promise) that mimic
// remote calls. No subscribers — callers fetch/await results. This mirrors
// how a real HTTP client behaves and keeps the API simple.

// internal list
let _flights: Flight[] = [];

// optional artificial latency (ms)
const LATENCY = 150;
const withLatency = <T,>(result: T) =>
  new Promise<T>((res) => setTimeout(() => res(result), LATENCY));

export interface FlightCreateParams {
  // Minimal required creation parameters: caller must provide these four.
  departureAirport: string;
  destinationAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  distanceKm: number;
  durationMinutes: number;
}

// Format a Date (UTC) to YYDDHHmm as requested (two-digit year, day, hour, minute)
function formatYYYYDDHHmm(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getUTCFullYear().toString();
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  return `${yyyy}${dd}${hh}${mm}`;
}

export const flightService = {
  async getAll(): Promise<Flight[]> {
    return withLatency([..._flights]);
  },

  async getByCode(code: Flight['code']): Promise<Flight | null> {
    return withLatency(_flights.find((p) => p.code === code) ?? null);
  },

  async create(payload: FlightCreateParams): Promise<Flight> {
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

    // this.store is immutable, so we push to the internal array
    // and return the new flight
    _flights.push(newFlight);
    return await this.getByCode(newFlight.code) as Flight;
  },

  async update(code: string): Promise<Flight | null> {
    const theItem = _flights.find(f => f.code === code);
    if (!theItem) return withLatency(null);

    const now = new Date();

    if (theItem.status === 'scheduled' && theItem.departureTime < now) {
      theItem.status = 'enroute';
      theItem.updatedAt = now;
    } 

    if ((theItem.status === 'scheduled' || theItem.status === 'enroute') && theItem.arrivalTime < now) {
      theItem.status = 'landed';
      theItem.updatedAt = now;
    } 
    return withLatency(theItem);
  },

  async remove(code: string): Promise<boolean> {
    const before = _flights.length;
    _flights = _flights.filter((p) => p.code !== code);
    const removed = _flights.length !== before;
    return withLatency(removed);
  },

} as const;


// Hook: fetches initial data on mount and exposes async CRUD methods that
// update local state after the operation completes. This is a simple fake-HTTP
// client pattern — consumers await methods and the hook keeps UI state in sync.
export function useFlights() {
  const [current, setCurrent] = useState<Flight[]>([]);

  useEffect(() => {
    let mounted = true;
    flightService.getAll().then((list) => {
      if (mounted) setCurrent(list);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getAll = async () => {
    const list = await flightService.getAll();
    setCurrent(list);
    return list;
  };

  const getByCode = (code: string) => flightService.getByCode(code);

  const create = async (data: FlightCreateParams) => {
    const p = await flightService.create(data);
    // refresh list from service to keep consistent
    setCurrent(await flightService.getAll());
    return p;
  };

  const update = async (code: string) => {
    const p = await flightService.update(code);
    setCurrent(await flightService.getAll());
    return p;
  };

  const remove = async (code: string) => {
    const ok = await flightService.remove(code);
    setCurrent(await flightService.getAll());
    return ok;
  };

  return {
    flights: current,
    getAll,
    getByCode,
    create,
    update,
    remove,
  } as const;
}