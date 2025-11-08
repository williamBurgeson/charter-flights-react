import type { Territory } from "../../models/territory.model";
import { makeGenericAccessorHook } from "./makeGenericAccessorHook";

export const useTerritories = makeGenericAccessorHook<
  Territory & Record<string, string | number | boolean | symbol>
>("/territories.json", { uniqueKeys: ["code", "name"], nonUniqueKeys: ["parentTerritory"] });
