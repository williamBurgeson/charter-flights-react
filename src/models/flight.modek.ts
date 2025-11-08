// Flight model used by the flights service and UI.
// Minimal fields are required; many operational fields are optional for later extension.

export type FlightStatus = 'scheduled' | 'enroute' | 'landed' | 'cancelled' | 'diverted';

export interface Flight {
  // Core identifiers (use `code`/`name` to match other domain entities)
  code: string; // canonical short code (e.g. flight number)
  name: string; // human-friendly display name

  // Routing
  origin: string; // airport code (IATA or ICAO depending on project convention)
  destination: string;

  // Times (ISO strings in UTC recommended)
  departureTime: Date; // scheduled departure (UTC)
  arrivalTime: Date; // scheduled arrival (UTC)

  // Status
  status: FlightStatus;

  // Recommended / operational
  aircraftType?: string;
  aircraftRegistration?: string;
  distanceKm?: number;
  durationMinutes?: number; // planned airborne minutes
  actualDepartureTime?: Date | null;
  actualArrivalTime?: Date | null;
  passengers?: number;
  capacity?: number;
  operator?: string; // carrier/operator code or name

  // Audit
  createdAt?: Date;
  updatedAt?: Date;

  // Extensibility
  metadata?: Record<string, unknown>;
}

export const DEFAULT_FLIGHT_STATUS: FlightStatus = 'scheduled';