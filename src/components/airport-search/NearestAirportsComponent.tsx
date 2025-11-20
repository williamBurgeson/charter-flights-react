import './NearestAirportsComponent.css'
import CurrentPositionSelectorComponent from './CurrentPositionSelectorComponent'

export default function NearestAirportsComponent() {
  return (
    <div className="nearest-airports">
      <div className="nearest-airports-header">Nearest airports (skeleton)</div>
      <CurrentPositionSelectorComponent />
      <div className="nearest-airports-empty">No data — skeleton component.</div>
    </div>
  )
}
