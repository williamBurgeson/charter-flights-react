import './AirportSearchComponent.css'
import AirportSearchTabPanelComponent from './AirportSearchTabPanelComponent'

export default function AirportSearchComponent() {
  return (
    <div className="airport-search-component">
      <h2>Welcome to Airport Search</h2>
      <p>This placeholder component will host the Airport Search UI.</p>
          <AirportSearchTabPanelComponent />
    </div>
  )
}
