import type { Airport } from "../../models/airport.model";
import { makeGenericAccessorHook } from "./makeGenericAccessorHook";

export const useAirports = makeGenericAccessorHook<Airport>(
	`${location.href}/airports.json`,
	{ uniqueKeys: ["code", "name"], nonUniqueKeys: ["country", "city"] }
);
