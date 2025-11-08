// Shared interface for continents used across the app
// Shared interface for continents used across the app
import type { EntityWithCode } from './entity-with-code.model';
import type { EntityWithName } from './entity-with-name.model';

// Canonical set of continent codes used across the app
export type ContinentCode = 'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';

export interface Continent extends EntityWithCode, EntityWithName {}
