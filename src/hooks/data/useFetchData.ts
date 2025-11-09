// useFetchData.ts
import { useCallback } from "react";

/**
 * Minimal fetch hook that exposes just a single async loader method.
 * Callers should manage storage if they need to keep the data.
 *
 * Usage:
 * const fetchData = useFetchData<T>(url)
 * const items = await fetchData()
 */
export function useFetchData() {
  // The hook returns a stable async fetch function which itself is generic.
  // Callers can write: const fetcher = useFetchData(); const items = await fetcher<MyType>(url)
  const fetchData = useCallback(async <T,>(url: string): Promise<T[]> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = (await res.json()) as T[];
    return json;
  }, []);

  return fetchData;
}
