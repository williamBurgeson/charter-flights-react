import type { EntityWithCode } from './entity-with-code.model';
import type { EntityWithName } from './entity-with-name.model';
import type { GeoPoint } from './geo-types';
import type { RecordEntity } from './record-entity';

export interface Airport extends RecordEntity, EntityWithCode, EntityWithName, GeoPoint {
  city: string;
  country: string; // ISO 3166-1 alpha-2 (e.g., "UK", "US")
}
