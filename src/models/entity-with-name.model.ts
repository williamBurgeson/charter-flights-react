import type { RecordEntity } from "./record-entity";

// Marker interface for entities that carry a display name
export interface EntityWithName extends RecordEntity {
  name: string;
}
