// Shared interface for territories used across the app
// Matches the structure in public/territories.json

// Shared interface for territories used across the app
// Matches the structure in public/territories.json
import type { EntityWithCode } from './entity-with-code.model';
import type { EntityWithName } from './entity-with-name.model';
import type { ContinentCode } from './continent.model';
import type { RecordEntity } from './record-entity';

export interface Territory extends RecordEntity, EntityWithCode, EntityWithName {
  continents?: ContinentCode[];
  parentTerritory?: string;
}
