/**
 * useFlightTimeCalculator
 * React translation of the Angular FlightTimeCalculatorService.
 * 
 * Purely computational — no side effects or React state.
 * Returns a small API object with the same public methods.
 */

export function useFlightTimeCalculator() {

  /** Estimate flight time in hours given distance and cruise speed (km-based). */
  const calculateFlightTimeHours = (
    distanceKm: number,
    cruiseSpeedKmH: number
  ): number => {
    if (!isFinite(distanceKm) || !isFinite(cruiseSpeedKmH) || cruiseSpeedKmH <= 0) {
      return 0;
    }
    return distanceKm / cruiseSpeedKmH;
  };

  /**
   * Estimate total flight time in minutes, including ground handling if provided.
   * - Defaults to 600 km/h cruise and 30 min ground.
   */
  const calculateFlightTimeMinutes = (
    distanceKm: number,
    cruiseKmh = 600,
    groundMinutes = 30
  ): number => {
    if (!isFinite(distanceKm) || distanceKm <= 0 || !isFinite(cruiseKmh) || cruiseKmh <= 0) {
      return Math.round(Number.isFinite(groundMinutes) ? groundMinutes : 0);
    }

    const hours = calculateFlightTimeHours(distanceKm, cruiseKmh);
    const airborne = Math.round(hours * 60);
    const gm = Number.isFinite(groundMinutes) ? Math.round(groundMinutes) : 0;

    return airborne + gm;
  };

  /**
   * Return a structured breakdown: { hours, minutes }.
   */
  const calculateFlightTime = (
    distanceKm: number,
    cruiseKmh = 600,
    groundMinutes = 30
  ): { hours: number; minutes: number } => {
    const totalMinutes = calculateFlightTimeMinutes(distanceKm, cruiseKmh, groundMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  /**
   * Compute estimated arrival time given a departure Date or ISO string.
   */
  const getArrivalTime = (
    departure: Date | string,
    distanceKm: number,
    cruiseKmh = 600,
    groundMinutes = 30
  ): Date => {
    const dep =
      typeof departure === "string"
        ? new Date(departure)
        : new Date(departure.getTime());

    if (!isFinite(dep.getTime())) return dep;

    const { hours, minutes } = calculateFlightTime(distanceKm, cruiseKmh, groundMinutes);
    const totalMinutes = hours * 60 + minutes;
    const arrivalMs = dep.getTime() + totalMinutes * 60_000; // convert to ms

    return new Date(arrivalMs);
  };

  // Public API
  return {
    calculateFlightTimeMinutes,
    calculateFlightTime,
    getArrivalTime,
  };
}
export default useFlightTimeCalculator;