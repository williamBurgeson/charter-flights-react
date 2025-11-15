import LeafletMapHostComponent from './LeafletMapHostComponent'
import './MapComponent.css'

export default function MapComponent() {
  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
      <LeafletMapHostComponent />
    </div>
  )
}
