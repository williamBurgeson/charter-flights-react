import { use } from "react";
import { useFetchData } from "./useFetchData";

export function useContinents1() {
  // Implementation goes here

  useFetchData("https://example.com/api/continents");
}