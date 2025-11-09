import { useMemo } from "react";
import { useFetchData } from "./useFetchData";
import type { RecordEntity } from "../../models/record-entity";

export type Metadata<T, U extends readonly (keyof T)[], N extends readonly (keyof T)[]> = {
  uniqueKeys?: U;
  nonUniqueKeys?: N;
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type UniqueGetters<T, U extends readonly (keyof T)[]> = {
  [K in U[number] as `getBy${Capitalize<string & K>}`]: (v: T[K]) => Promise<T | null>;
};
type UniqueValueGetters<T, U extends readonly (keyof T)[]> = {
  [K in U[number] as `getBy${Capitalize<string & K>}Values`]: (v: T[K][]) => Promise<T[]>;
};
type NonUniqueFilters<T, N extends readonly (keyof T)[]> = {
  [K in N[number] as `filterBy${Capitalize<string & K>}`]: (v: T[K]) => Promise<T[]>;
};
type NonUniqueValueFilters<T, N extends readonly (keyof T)[]> = {
  [K in N[number] as `filterBy${Capitalize<string & K>}Values`]: (v: T[K][]) => Promise<T[]>;
};

export function makeGenericAccessorHook<
  T extends RecordEntity,
  U extends readonly (keyof T)[] = readonly (keyof T)[],
  N extends readonly (keyof T)[] = readonly (keyof T)[]
>(url: string, metadata?: Metadata<T, U, N>) {
  type UKeys = U extends readonly (keyof T)[] ? U : readonly (keyof T)[];
  type NKeys = N extends readonly (keyof T)[] ? N : readonly (keyof T)[];

  type Generated = {
    data: T[];
    loading: boolean;
    error: Error | null;
    getAll(): Promise<T[]>;
    filterByField<K extends keyof T>(key: K, values: T[K][]): Promise<T[]>;
  } & UniqueGetters<T, UKeys> &
    UniqueValueGetters<T, UKeys> &
    NonUniqueFilters<T, NKeys> &
    NonUniqueValueFilters<T, NKeys>;

  return function useAccessor(): Generated {
    const { data, loading, error } = useFetchData<T>(url);

    const uniqueKeys = useMemo(
      () => (metadata?.uniqueKeys ?? []) as (keyof T)[],
      []
    );
    const nonUniqueKeys = useMemo(
      () => (metadata?.nonUniqueKeys ?? []) as (keyof T)[],
      []
    );

    // Memoise accessors so they're rebuilt only when `data` changes
    const accessors = useMemo(() => {
      const getAll = async () => data;
      const filterByField = async <K extends keyof T>(key: K, values: T[K][]) =>
        data.filter((item) => values.includes(item[key]));

      const uniqueGetters: Record<string, unknown> = {};
      const uniqueValueGetters: Record<string, unknown> = {};
      const nonUniqueFilters: Record<string, unknown> = {};

      // Unique single-value getters
      uniqueKeys.forEach((k) => {
        const name = `getBy${cap(String(k))}`;
        uniqueGetters[name] = async (value: unknown) =>
          data.find((d) => d[k] === value) ?? null;

        const nameValues = `getBy${cap(String(k))}Values`;
        uniqueValueGetters[nameValues] = async (values: unknown[]) =>
          data.filter((d) => values.includes(d[k]));
      });

      // Non-unique filters
      nonUniqueKeys.forEach((k) => {
        const name = `filterBy${cap(String(k))}`;
        nonUniqueFilters[name] = async (value: unknown) =>
          data.filter((d) => d[k] === value);

        const nameValues = `filterBy${cap(String(k))}Values`;
        nonUniqueFilters[nameValues] = async (values: unknown[]) =>
          data.filter((d) => values.includes(d[k]));
      });

      return {
        getAll,
        filterByField,
        ...((uniqueGetters as unknown) as UniqueGetters<T, UKeys>),
        ...((uniqueValueGetters as unknown) as UniqueValueGetters<T, UKeys>),
        ...((nonUniqueFilters as unknown) as NonUniqueFilters<T, NKeys>),
      };
    }, [data, uniqueKeys, nonUniqueKeys]); // dependencies

    return { data, loading, error, ...accessors } as Generated;
  };
}
