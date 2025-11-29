import { useCallback, useMemo } from 'react'
import { useFetchData } from './useFetchData'
import type { RecordEntity } from '../../models/record-entity'

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

export type Metadata<T, U extends readonly (keyof T)[], N extends readonly (keyof T)[]> = {
  uniqueKeys?: U
  nonUniqueKeys?: N
}

type UniqueGetters<T, U extends readonly (keyof T)[]> = {
  [K in U[number] as `getBy${Capitalize<string & K>}`]: (v: T[K]) => Promise<T | null>
}
type UniqueValueGetters<T, U extends readonly (keyof T)[]> = {
  [K in U[number] as `getBy${Capitalize<string & K>}Values`]: (v: T[K][]) => Promise<T[]>
}
type NonUniqueFilters<T, N extends readonly (keyof T)[]> = {
  [K in N[number] as `filterBy${Capitalize<string & K>}`]: (v: T[K]) => Promise<T[]>
}
type NonUniqueValueFilters<T, N extends readonly (keyof T)[]> = {
  [K in N[number] as `filterBy${Capitalize<string & K>}Values`]: (v: T[K][]) => Promise<T[]>
}

// Methods-only, tidy version: getAll & filterByField are top-level stable callbacks.
// Dynamically generated accessors are created inside a memo and depend on the concrete callbacks
// plus the metadata keys. This keeps function identity stable except when inputs change.
export function makeGenericAccessorHook<
  T extends RecordEntity,
  U extends readonly (keyof T)[] = readonly (keyof T)[],
  N extends readonly (keyof T)[] = readonly (keyof T)[]
>(url: string, 
  metadata?: Metadata<T, U, N>) {
  type UKeys = U extends readonly (keyof T)[] ? U : readonly (keyof T)[]
  type NKeys = N extends readonly (keyof T)[] ? N : readonly (keyof T)[]

  type Generated = {
    getAll(): Promise<T[]>
    filterByField<K extends keyof T>(key: K, values: T[K][]): Promise<T[]>
  } & UniqueGetters<T, UKeys> &
    UniqueValueGetters<T, UKeys> &
    NonUniqueFilters<T, NKeys> &
    NonUniqueValueFilters<T, NKeys>

  const siteBaseUrl : string = window?.location?.href.includes('github.io') ?  '/charter-flights-react/' : '/'
  const jsonResourceUrl = siteBaseUrl +
    (siteBaseUrl.endsWith('/') ? '' : '/') + url

  return function useAccessor(): Generated {
    const fetchData = useFetchData()

    // Concrete, always-present callbacks
    const getAll = useCallback(async () => {
      const data = await fetchData<T>(jsonResourceUrl)
      return data
    }, [fetchData])

    // Generic matcher that supports scalar or array-valued entity fields and
    // scalar or array test values. Examples:
    // - fieldVal = 'US', testVal = 'US' -> true
    // - fieldVal = ['NA','SA'], testVal = 'NA' -> true
    // - fieldVal = ['NA','SA'], testVal = ['AF','NA'] -> true (any overlap)
    // - fieldVal = 'US', testVal = ['US','GB'] -> true
    const matchesValue = (fieldVal: unknown, testVal: unknown | unknown[]) => {
      if (Array.isArray(fieldVal)) {
        const fv = fieldVal as unknown[]
        if (Array.isArray(testVal)) {
          return (testVal as unknown[]).some((v) => fv.includes(v))
        }
        return fv.includes(testVal)
      }

      // field is scalar
      if (Array.isArray(testVal)) {
        return (testVal as unknown[]).includes(fieldVal)
      }
      return fieldVal === testVal
    }

    const filterByField = useCallback(
      async <K extends keyof T>(key: K, values: T[K][]) => {
        const list = await getAll()
        return list.filter((item) => matchesValue(item[key], values))
      },
      [getAll]
    )

  // Metadata keys (factory inputs) - treat as stable for this hook instance.
  // Wrap in useMemo so their identity is stable for linting and memo deps.
  const uniqueKeys = useMemo(() => (metadata?.uniqueKeys ?? []) as (keyof T)[], [])
  const nonUniqueKeys = useMemo(() => (metadata?.nonUniqueKeys ?? []) as (keyof T)[], [])

    // Dynamically generate the rest of the accessor API and memoize it.
    const accessors = useMemo(() => {
      const uniqueGetters: Record<string, unknown> = {}
      const uniqueValueGetters: Record<string, unknown> = {}
      const nonUniqueFilters: Record<string, unknown> = {}

      uniqueKeys.forEach((k) => {
        const name = `getBy${cap(String(k))}`
        uniqueGetters[name] = async (value: unknown) => {
          const list = await getAll()
          return (list.find((d) => matchesValue(d[k], value)) ?? null) as T | null
        }

        const nameValues = `getBy${cap(String(k))}Values`
        uniqueValueGetters[nameValues] = async (values: unknown[]) => {
          const list = await getAll()
          return list.filter((d) => matchesValue(d[k], values))
        }
      })

      nonUniqueKeys.forEach((k) => {
        const name = `filterBy${cap(String(k))}`
        nonUniqueFilters[name] = async (value: unknown) => {
          const list = await getAll()
          return list.filter((d) => matchesValue(d[k], value))
        }

        const nameValues = `filterBy${cap(String(k))}Values`
        nonUniqueFilters[nameValues] = async (values: unknown[]) => {
          const list = await getAll()
          return list.filter((d) => matchesValue(d[k], values))
        }
      })

      return {
        getAll,
        filterByField,
        ...((uniqueGetters as unknown) as UniqueGetters<T, UKeys>),
        ...((uniqueValueGetters as unknown) as UniqueValueGetters<T, UKeys>),
        ...((nonUniqueFilters as unknown) as NonUniqueFilters<T, NKeys>),
      }
    }, [getAll, filterByField, uniqueKeys, nonUniqueKeys])

    return accessors as Generated
  }
}
