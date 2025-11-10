// useFetchData.ts
import { useCallback } from "react";

/**
 * Minimal fetch hook that returns a stable fetcher function.
 * The hook itself has no internal state and does not auto-load.
 *
 * Usage:
 * const fetcher = useFetchData();
 * const items = await fetcher<MyType>("/path/to.json");
 */
export function useFetchData() {
  const fetchData = useCallback(async <T,>(url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = (await res.json()) as T[];
    return data;
  }, []);

  return fetchData;
}
