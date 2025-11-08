import type { EntityWithCode } from './entity-with-code.model';
import type { EntityWithName } from './entity-with-name.model';

export interface Airport extends EntityWithCode, EntityWithName {
  city: string;
  country: string; // ISO 3166-1 alpha-2 (e.g., "UK", "US")
  lat_decimal: number;
  lon_decimal: number;
}
