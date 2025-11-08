import { useFetchData } from "./useFetchData";

export function useGetAllAirports() {
  const { data, error, loading } = useFetchData("/airports.json");

  return { data, error, loading };
} 