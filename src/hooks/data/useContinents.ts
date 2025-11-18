import type { Continent } from '../../models/continent.model';
import { makeGenericAccessorHook } from './makeGenericAccessorHook';

export const useContinents = makeGenericAccessorHook<Continent, ['code', 'name'], []>(`${location.href}/continents.json`, 
  { uniqueKeys: ['code', 'name'] as const, nonUniqueKeys: [] as const});