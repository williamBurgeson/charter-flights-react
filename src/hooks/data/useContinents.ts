import type { Continent } from '../../models/continent.model';
import { makeGenericAccessorHook } from './makeGenericAccessorHook';

export const useContinents = makeGenericAccessorHook<Continent & Record<string, string | number | boolean | symbol>>('/continents.json', 
  { uniqueKeys: ['code', 'name']  , nonUniqueKeys: [] });