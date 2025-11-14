import './airport-search-component.css'
import AirportSearchTabPanel from './AirportSearchTabPanel'

export default function AirportSearchComponent() {
  return (
    <div className="airport-search-component">
      <h2>Welcome to Airport Search</h2>
      <p>This placeholder component will host the Airport Search UI.</p>
          <AirportSearchTabPanel />
    </div>
  )
}
