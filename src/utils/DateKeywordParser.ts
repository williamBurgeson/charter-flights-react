export type ParsedDateResult =
  | { kind: 'invalid'; raw: string }
  | { kind: 'point'; raw: string; date: Date; canonical: string }
  | { kind: 'range'; raw: string; start: Date; end: Date; canonical: string }

/**
 * Lightweight date keyword parser for prototyping.
 * Supports keywords like: now, today, tomorrow, yesterday,
 * this_week / next_week / last_week, this_month / next_month, this_year, weekdays (monday..sunday)
 * and simple offsets: +Nd, -Nd, +Nw, +Nm, +Ny, +Nh where N is integer.
 *
 * This lives in the temp folder as a small, dependency-free utility.
 */
export class DateKeywordParser {
  static parse(input: string | undefined | null, nowArg?: Date): ParsedDateResult {
    const raw = (input ?? '').trim()
    if (!raw) return { kind: 'invalid', raw }

    const now = nowArg ? new Date(nowArg) : new Date()
    const s = raw.toLowerCase()

    // Check for base+offset pattern, e.g. today+3d, now-2h
    const m = s.match(/^([a-z_]+|[+-]?\d{4}-\d{2}-\d{2}|now)([+-].+)?$/)
    if (!m) return { kind: 'invalid', raw }

    const base = m[1]
    const offsetPart = m[2]

    let baseRange: { start: Date; end: Date } | null = null
    // helpers
    const startOfDay = (d: Date) => { const t = new Date(d); t.setHours(0,0,0,0); return t }
    const endOfDay = (d: Date) => { const t = new Date(d); t.setHours(23,59,59,999); return t }
    const addDays = (d: Date, n: number) => { const t = new Date(d); t.setDate(t.getDate() + n); return t }
    const addWeeks = (d: Date, n: number) => addDays(d, n * 7)
    const addMonths = (d: Date, n: number) => { const t = new Date(d); const md = t.getDate(); t.setMonth(t.getMonth() + n);
      // clamp
      if (t.getDate() !== md) t.setDate(0)
      return t }
    const addYears = (d: Date, n: number) => { const t = new Date(d); t.setFullYear(t.getFullYear() + n); return t }
    const addHours = (d: Date, n: number) => { const t = new Date(d); t.setHours(t.getHours() + n); return t }
    const addMinutes = (d: Date, n: number) => { const t = new Date(d); t.setMinutes(t.getMinutes() + n); return t }
    const addSeconds = (d: Date, n: number) => { const t = new Date(d); t.setSeconds(t.getSeconds() + n); return t }

    const startOfWeek = (d: Date) => {
      // ISO week start Monday
      const t = startOfDay(d)
      const day = t.getDay() // 0=Sun,1=Mon...
      const diff = (day === 0 ? -6 : 1 - day)
      return addDays(t, diff)
    }

    const endOfWeek = (d: Date) => addDays(startOfWeek(d), 6)
    const startOfMonth = (d: Date) => { const t = new Date(d); t.setDate(1); return startOfDay(t) }
    const endOfMonth = (d: Date) => { const t = startOfMonth(d); t.setMonth(t.getMonth() + 1); t.setDate(0); return endOfDay(t) }
    const startOfYear = (d: Date) => { const t = new Date(d); t.setMonth(0,1); return startOfDay(t) }
    const endOfYear = (d: Date) => { const t = new Date(d); t.setMonth(11,31); return endOfDay(t) }

    const weekdayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    }
    const isDayOfWeek = (s: string) => Object.prototype.hasOwnProperty.call(weekdayMap, s)

    // interpret base
    if (base === 'now') {
      baseRange = { start: new Date(now), end: new Date(now) }
    } else if (base === 'today') {
      baseRange = { start: startOfDay(now), end: endOfDay(now) }
    } else if (base === 'tomorrow') {
      const d = addDays(now, 1)
      baseRange = { start: startOfDay(d), end: endOfDay(d) }
    } else if (base === 'yesterday') {
      const d = addDays(now, -1)
      baseRange = { start: startOfDay(d), end: endOfDay(d) }
    } else if (base === 'this_week') {
      baseRange = { start: startOfWeek(now), end: endOfDay(endOfWeek(now)) }
    } else if (base === 'next_week') {
      const s2 = addWeeks(startOfWeek(now), 1)
      baseRange = { start: s2, end: endOfDay(addDays(s2,6)) }
    } else if (base === 'last_week') {
      const s2 = addWeeks(startOfWeek(now), -1)
      baseRange = { start: s2, end: endOfDay(addDays(s2,6)) }
    } else if (base === 'this_month') {
      baseRange = { start: startOfMonth(now), end: endOfMonth(now) }
    } else if (base === 'next_month') {
      const s2 = addMonths(startOfMonth(now), 1)
      baseRange = { start: s2, end: endOfMonth(s2) }
    } else if (base === 'last_month') {
      const s2 = addMonths(startOfMonth(now), -1)
      baseRange = { start: s2, end: endOfMonth(s2) }
    } else if (base === 'this_year') {
      baseRange = { start: startOfYear(now), end: endOfYear(now) }
    } else if (base === 'next_year') {
      const s2 = addYears(startOfYear(now), 1)
      baseRange = { start: s2, end: endOfYear(s2) }
  } else if (isDayOfWeek(base)) {
      // next occurrence (including today)
      const target = weekdayMap[base]
      const t = new Date(now)
      const today = t.getDay()
      let delta = target - today
      if (delta < 0) delta += 7
      const d = addDays(startOfDay(now), delta)
      baseRange = { start: startOfDay(d), end: endOfDay(d) }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(base)) {
      // ISO date
      const d = new Date(base + 'T00:00:00')
      if (Number.isNaN(d.getTime())) return { kind: 'invalid', raw }
      baseRange = { start: startOfDay(d), end: endOfDay(d) }
    } else {
      return { kind: 'invalid', raw }
    }

    // apply offset if present
    if (offsetPart) {
      // offsetPart looks like +3d-1w etc; support single offset for now: [+-]\d+[dwMyhms]
      const om = offsetPart.match(/^([+-]\d+)([dwMyhms])$/)
      if (!om) return { kind: 'invalid', raw }
      const amount = Number(om[1])
      const unit = om[2]
      let shiftStart = baseRange.start
      let shiftEnd = baseRange.end
      switch (unit) {
        case 'd': shiftStart = addDays(shiftStart, amount); shiftEnd = addDays(shiftEnd, amount); break
        case 'w': shiftStart = addWeeks(shiftStart, amount); shiftEnd = addWeeks(shiftEnd, amount); break
        case 'M': shiftStart = addMonths(shiftStart, amount); shiftEnd = addMonths(shiftEnd, amount); break
        case 'y': shiftStart = addYears(shiftStart, amount); shiftEnd = addYears(shiftEnd, amount); break
        case 'h': shiftStart = addHours(shiftStart, amount); shiftEnd = addHours(shiftEnd, amount); break
        case 'm': shiftStart = addMinutes(shiftStart, amount); shiftEnd = addMinutes(shiftEnd, amount); break
        case 's': shiftStart = addSeconds(shiftStart, amount); shiftEnd = addSeconds(shiftEnd, amount); break
        default: return { kind: 'invalid', raw }
      }
      baseRange = { start: shiftStart, end: shiftEnd }
    }

    // Decide whether to return point vs range: if start and end are the same instant, return point
    const same = baseRange.start.getTime() === baseRange.end.getTime()
    const canonical = same ? DateKeywordParser.toIsoDateTime(baseRange.start) : `${DateKeywordParser.toIsoDate(baseRange.start)}_${DateKeywordParser.toIsoDate(baseRange.end)}`
    if (same) return { kind: 'point', raw, date: baseRange.start, canonical }
    return { kind: 'range', raw, start: baseRange.start, end: baseRange.end, canonical }
  }

  static toIsoDate(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  static toIsoDateTime(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${DateKeywordParser.toIsoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}Z`
  }
}

export default DateKeywordParser
