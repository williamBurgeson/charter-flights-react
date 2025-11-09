import type { RecordEntity } from "./record-entity";

// Marker interface for entities identified by a short code
export interface EntityWithCode extends RecordEntity {
  code: string;
}
