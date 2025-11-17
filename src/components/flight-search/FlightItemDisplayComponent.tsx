import { useCallback } from "react"
import type { Flight } from "../../models/flight.model"

type Props = {
  flight: Flight
  key: number
}

export default function FlightItemDisplayComponent({ flight, key }: Props) {

  // Quick helper to shorten verbose airport names in the UI.
  // Rules applied:
  // - Replace the whole-word "International" anywhere (case-insensitive) with "Intl."
  // - Truncate any single word longer than 15 characters to first 15 chars + '.'
  const shortenAirportName = useCallback((name: string) => {
    if (!name) return name
    // Replace International anywhere
    const replaced = name.replace(/\bInternational\b/gi, 'Intl.')
    // Truncate overly long words
    const words = replaced.split(/(\s+)/) // keep whitespace tokens so we preserve original spacing
    return words
      .map((w) => {
        // leave whitespace unchanged
        if (/^\s+$/.test(w)) return w
        // if word length > 15, truncate
        if (w.length > 15) return w.slice(0, 15) + '.'
        return w
      })
      .join('')
  }, [])

  // Simple date formatter: DD/MM/YYYY HH:mm (24-hour)
  const formatDateShort = useCallback((d: Date) => {
    if (!d) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear())
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }, [])

  return (
    <div key={key} className="table-row">
      <div className="airport">
        <div className="airport-code">{flight.originAirportCode}</div>
        <div className="airport-name">{shortenAirportName(flight.originAirportName)}</div>
      </div>
      <div className="date">{formatDateShort(flight.departureTime)}</div>
      <div className="airport dest">
        <div className="airport-code">{flight.destinationAirportCode}</div>
        <div className="airport-name">{shortenAirportName(flight.destinationAirportName)}</div>
      </div>
    </div>
  )
}
