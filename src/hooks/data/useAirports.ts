import type { Airport } from "../../models/airport.model";
import { makeGenericAccessorHook } from "./makeGenericAccessorHook";

export const useAirports = makeGenericAccessorHook<
  Airport & Record<string, string | number | boolean | symbol>
>("/airports.json", { uniqueKeys: ["code", "name"], nonUniqueKeys: ["country", "city"] });
