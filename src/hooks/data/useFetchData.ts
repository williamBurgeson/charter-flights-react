// useFetchData.ts
import { useCallback, useEffect, useState } from "react";

/**
 * Minimal fetch hook that exposes just a single async loader method.
 * Callers should manage storage if they need to keep the data.
 *
 * Usage:
 * const fetchData = useFetchData<T>(url)
 * const items = await fetchData()
 */
export function useFetchData<T>(url: string) {

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<T[]>;
      })
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err) => {
        if (mounted) setError(err as Error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading, error };
}
