/**
 * Small date helper utilities. Prefer explicit helpers over mutating
 * Date.prototype. These are pure and return new Date instances.
 */
export function addSeconds(d: Date, seconds: number): Date {
  return new Date(d.getTime() + Math.round(seconds * 1000));
}

export function addMinutes(d: Date, minutes: number): Date {
  return addSeconds(d, minutes * 60);
}

export function addHours(d: Date, hours: number): Date {
  return addSeconds(d, hours * 60 * 60);
}

export function addDays(d: Date, days: number): Date {
  return addSeconds(d, days * 24 * 60 * 60);
}

export function getTicks(d: Date): number {
  return d.getTime();
}

export default {
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  getTicks,
}
