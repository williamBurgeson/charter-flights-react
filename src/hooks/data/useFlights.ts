import { DEFAULT_FLIGHT_STATUS, type Flight } from '../../models/flight.model';
import { generateGuid } from '../../utils/generateGuid';

// optional artificial latency (ms)
const LATENCY = 150;
const withLatency = <T,>(result: T) => new Promise<T>((res) => setTimeout(() => res(result), LATENCY));

export interface FlightCreateParams {
  // Minimal required creation parameters: caller must provide these four.
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: Date;
  arrivalTime: Date;
  distanceKm: number;
  durationMinutes: number;
  originAirportName: string;
  destinationAirportName: string;
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

// Use a module-level (singleton) store so every caller of `useFlights()` sees
// the same underlying flight list. This ensures that the seeder and any
// tester/consumer are operating on the same instance.

// Note that session storage might be a better choice for persistence across reloads,
// but this is sufficient for in-memory testing. Also, session storage might not work well in all environments.
let flightsStore: Flight[] = []

const getAll = async () => {
  return withLatency([...flightsStore])
}

const getByCode = async (code: string) => {
  const found = flightsStore.find((p) => p.code === code) ?? null
  return withLatency(found)
}

const filterByAirportCodes = async (candidateAirportCodesFrom: string[], candidateAirportCodesTo: string[], exclusive: boolean) => {

  if (exclusive) {
    if (candidateAirportCodesFrom.length === 0 || candidateAirportCodesTo.length === 0) {
      return withLatency([]);
    }

    const filtered = flightsStore.filter(
      (f) => candidateAirportCodesFrom.includes(f.originAirportCode) && candidateAirportCodesTo.includes(f.destinationAirportCode)
    );
    return withLatency(filtered); 
  }

  if (candidateAirportCodesFrom.length === 0 || candidateAirportCodesTo.length === 0) { 
    return withLatency([...flightsStore]);
  }

  const filtered = flightsStore.filter(
    (f) => candidateAirportCodesFrom.includes(f.originAirportCode) || candidateAirportCodesTo.includes(f.destinationAirportCode)
  );
  return withLatency(filtered);
}

const create = async (payload: FlightCreateParams, latencyMs?: number | null) => {
  latencyMs = latencyMs ?? LATENCY
  const withCustomLatency = <T,>(result: T) => new Promise<T>((res) => setTimeout(() => res(result), latencyMs!))

  const now = new Date()
  const code = generateGuid()
  const departure = payload.departureTime
  const arrival = payload.arrivalTime
  const name = (payload.originAirportName ?? payload.originAirportCode) + formatYYYYDDHHmm(departure) + (payload.destinationAirportName ?? payload.destinationAirportCode)
  const newFlight: Flight = {
    code,
    name,
    originAirportCode: payload.originAirportCode,
    originAirportName: payload.originAirportName,
    destinationAirportCode: payload.destinationAirportCode,
    destinationAirportName: payload.destinationAirportName,
    departureTime: departure,
    arrivalTime: arrival,
    status: DEFAULT_FLIGHT_STATUS,
    distanceKm: payload.distanceKm,
    durationMinutes: payload.durationMinutes,
    actualDepartureTime: null,
    actualArrivalTime: null,
    createdAt: now,
    updatedAt: now,
  }

  flightsStore = [...flightsStore, newFlight]
  return latencyMs ? withCustomLatency(newFlight) : newFlight
}

const update = async (code: string) => {
  const now = new Date()
  let updated: Flight | null = null

  const next = flightsStore.map((f) => {
    if (f.code !== code) return f
    const copy = { ...f }
    if (copy.status === 'scheduled' && copy.departureTime < now) {
      copy.status = 'enroute'
      copy.updatedAt = now
    }
    if ((copy.status === 'scheduled' || copy.status === 'enroute') && copy.arrivalTime < now) {
      copy.status = 'landed'
      copy.updatedAt = now
    }
    updated = copy
    return copy
  })

  flightsStore = next
  return withLatency(updated)
}

const remove = async (code: string) => {
  const prev = flightsStore
  const next = prev.filter((p) => p.code !== code)
  const removed = next.length !== prev.length
  flightsStore = next
  return withLatency(removed)
}

// Dev helper: inspect the current in-memory store (not part of production API)
export function __getFlightsStoreForDebug() {
  return flightsStore
}

export function useFlights() {
  return {
    filterByAirportCodes,
    getAll,
    getByCode,
    create,
    update,
    remove,
  }
}