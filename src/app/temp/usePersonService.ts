import { useEffect, useState } from 'react';
import type { Person } from './person.model';
import { initialPeople } from './person.model';

// Fake HTTP-style in-memory service: async methods (Promise) that mimic
// remote calls. No subscribers — callers fetch/await results. This mirrors
// how a real HTTP client behaves and keeps the API simple.

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// internal list
let people: Person[] = [...initialPeople];

// optional artificial latency (ms)
const LATENCY = 150;
const withLatency = <T,>(result: T) =>
  new Promise<T>((res) => setTimeout(() => res(result), LATENCY));

export const personService = {
  async getAll(): Promise<Person[]> {
    return withLatency([...people]);
  },

  async getById(id: string): Promise<Person | null> {
    return withLatency(people.find((p) => p.id === id) ?? null);
  },

  async create(data: Omit<Person, 'id'>): Promise<Person> {
    const p: Person = { ...data, id: genId() };
    people = [p, ...people];
    return withLatency(p);
  },

  async update(id: string, patch: Partial<Omit<Person, 'id'>>): Promise<Person | null> {
    let updated: Person | null = null;
    people = people.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...patch };
        return updated;
      }
      return p;
    });
    return withLatency(updated);
  },

  async remove(id: string): Promise<boolean> {
    const before = people.length;
    people = people.filter((p) => p.id !== id);
    const removed = people.length !== before;
    return withLatency(removed);
  },

  async replaceAll(items: Person[]): Promise<void> {
    people = [...items];
    return withLatency(undefined as unknown as void);
  },
} as const;

// Hook: fetches initial data on mount and exposes async CRUD methods that
// update local state after the operation completes. This is a simple fake-HTTP
// client pattern — consumers await methods and the hook keeps UI state in sync.
export function usePersonService() {
  const [current, setCurrent] = useState<Person[]>([]);

  useEffect(() => {
    let mounted = true;
    personService.getAll().then((list) => {
      if (mounted) setCurrent(list);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getAll = async () => {
    const list = await personService.getAll();
    setCurrent(list);
    return list;
  };

  const getById = (id: string) => personService.getById(id);

  const create = async (data: Omit<Person, 'id'>) => {
    const p = await personService.create(data);
    // refresh list from service to keep consistent
    setCurrent(await personService.getAll());
    return p;
  };

  const update = async (id: string, patch: Partial<Omit<Person, 'id'>>) => {
    const p = await personService.update(id, patch);
    setCurrent(await personService.getAll());
    return p;
  };

  const remove = async (id: string) => {
    const ok = await personService.remove(id);
    setCurrent(await personService.getAll());
    return ok;
  };

  const replaceAll = async (items: Person[]) => {
    await personService.replaceAll(items);
    setCurrent(await personService.getAll());
  };

  return {
    people: current,
    getAll,
    getById,
    create,
    update,
    remove,
    replaceAll,
  } as const;
}

/*
Usage (fake HTTP style):

const { people, create, update, remove, getAll } = usePersonService();

// create returns a Promise<Person>
await create({ name: 'Zoe' });

// imperative calls to the service are also async but won't update hook state
// unless you call getAll() or use the hook methods which refresh state.
await personService.create({ name: 'Imperative' });
*/
