export function coerceToNonNegativeInteger(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.floor(n)
  return i < 0 ? 0 : i
}

export function clampInt(value: unknown, min: number, max: number, fallback = min): number {
  const n = coerceToNonNegativeInteger(value, fallback)
  if (n < min) return min
  if (n > max) return max
  return n
}

export function isIntegerLike(value: unknown): boolean {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && Math.floor(n) === n
}
