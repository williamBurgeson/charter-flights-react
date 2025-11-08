import { useEffect, useState } from 'react';
import type { Flight } from '../../models/flight.model';

// Fake HTTP-style in-memory service: async methods (Promise) that mimic
// remote calls. No subscribers — callers fetch/await results. This mirrors
// how a real HTTP client behaves and keeps the API simple.

// internal list
let _flights: Flight[] = [];

// optional artificial latency (ms)
const LATENCY = 150;
const withLatency = <T,>(result: T) =>
  new Promise<T>((res) => setTimeout(() => res(result), LATENCY));


export const flightService = {
  async getAll(): Promise<Flight[]> {
    return withLatency([..._flights]);
  },

  async getByCode(code: Flight['code']): Promise<Flight | null> {
    return withLatency(_flights.find((p) => p.code === code) ?? null);
  },

  async create(data: Omit<Flight, 'code'>): Promise<Flight> {
    const p: Flight = { ...data, code: '' };
    _flights = [p, ..._flights];
    return withLatency(p);
  },

  async update(code: string, patch: Partial<Omit<Flight, 'code'>>): Promise<Flight | null> {
    let updated: Flight | null = null;
    _flights = _flights.map((p) => {
      if (p.code === code) {
        updated = { ...p, ...patch };
        return updated;
      }
      return p;
    });
    return withLatency(updated);
  },

  async remove(code: string): Promise<boolean> {
    const before = _flights.length;
    _flights = _flights.filter((p) => p.code !== code);
    const removed = _flights.length !== before;
    return withLatency(removed);
  },

  async replaceAll(items: Flight[]): Promise<void> {
    _flights = [...items];
    return withLatency(undefined as unknown as void);
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

  const create = async (data: Omit<Flight, 'code'>) => {
    const p = await flightService.create(data);
    // refresh list from service to keep consistent
    setCurrent(await flightService.getAll());
    return p;
  };

  const update = async (code: string, patch: Partial<Omit<Flight, 'code'>>) => {
    const p = await flightService.update(code, patch);
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