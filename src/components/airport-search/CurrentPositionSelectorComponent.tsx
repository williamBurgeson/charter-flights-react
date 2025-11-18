import { useCallback, useState } from 'react'
import './CurrentPositionSelectorComponent.css'

export default function CurrentPositionSelectorComponent() {
  const [latitude, setLatitude] = useState(50.0)
  const [longitude, setLongitude] = useState(0.0)

  const northSouth = useCallback(() => latitude >= 0 ? 'N' : 'S', [latitude])
  const eastWest = useCallback(() => longitude >= 0 ? 'E' : 'W', [longitude])

  return (
    <div className="current-position-selector" role="group" aria-label="Nearest airports location controls">
      <div className="na-label">Location:</div>

      <div className="na-inputs">
        <label className="na-field">
          <span className="na-field-label">Lat:</span>
          <input className="na-coord-input" type="text" defaultValue={''} aria-label="Latitude" />°{northSouth()}
        </label>

        <label className="na-field">
          <span className="na-field-label">Lon:</span>
          <input className="na-coord-input" type="text" defaultValue={''} aria-label="Longitude" />°{eastWest()}
        </label>
      </div>

      <button type="button" className="na-change-btn">Change</button>
    </div>
  )
}
