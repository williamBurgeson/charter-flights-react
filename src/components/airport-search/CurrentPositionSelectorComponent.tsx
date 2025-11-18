import './CurrentPositionSelectorComponent.css'

export default function CurrentPositionSelectorComponent() {
  return (
    <div className="current-position-selector" role="group" aria-label="Nearest airports location controls">
      <div className="na-label">Location:</div>

      <div className="na-inputs">
        <label className="na-field">
          <span className="na-field-label">Lat:</span>
          <input className="na-coord-input" type="text" defaultValue={''} aria-label="Latitude" />
        </label>

        <label className="na-field">
          <span className="na-field-label">Lon:</span>
          <input className="na-coord-input" type="text" defaultValue={''} aria-label="Longitude" />
        </label>
      </div>

      <button type="button" className="na-change-btn">Change</button>
    </div>
  )
}
