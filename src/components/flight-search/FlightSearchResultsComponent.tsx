import type { Flight } from '../../models/flight.model'
import './FlightSearchResultsComponent.css'

type Props = {
  flights?: Flight[]
  onSelect?: (flight: Flight) => void
  className?: string
}

export default function FlightSearchResultsComponent({ flights = [], onSelect, className = '' }: Props) {
  if (!flights || flights.length === 0) {
    return <div className={`flight-search-results ${className}`}>No flights</div>
  }

  return (
    <div className={`flight-search-results ${className}`}>
      <ul>
        {flights.map((f) => (
          <li key={String(((f as unknown) as Record<string, unknown>).id ?? f.code)} className="flight-search-result-item" onClick={() => onSelect?.(f)}>
            <div className="flight-row-left">
              <div className="flight-code">{f.code}</div>
              <div className="flight-name">{f.name}</div>
            </div>
            <div className="flight-row-right">
              <div className="flight-route">{f.originAirportCode} → {f.destinationAirportCode}</div>
              <div className="flight-times">{new Date(f.departureTime).toLocaleString()} — {new Date(f.arrivalTime).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
