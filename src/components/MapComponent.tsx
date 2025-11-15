import LeafletMapHostComponent, { type MapBoundsPayload } from './LeafletMapHostComponent'
import './MapComponent.css'

export default function MapComponent() {
  const handleMapUpdated = (b: MapBoundsPayload) => {
    console.debug('MapComponent: bounds changed', b)
  }

  return (
    <div className="map-component">
      <h2>World Map (Leaflet)</h2>
      <LeafletMapHostComponent mapUpdatedEvent={handleMapUpdated} />
    </div>
  )
}
