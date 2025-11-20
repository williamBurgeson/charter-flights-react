import { useCallback, useEffect, useState } from 'react'
import './CurrentPositionSelectorComponent.css'
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator'
import PositionSelectorModalComponent from './PositionSelectorModal';

export default function CurrentPositionSelectorComponent() {
  const defaultLatitude = 50.0;
  const defaultLongitude = 0.0;
  const [latitude, setLatitude] = useState(defaultLatitude)
  const [longitude, setLongitude] = useState(defaultLongitude)
  const [locationAvailable, setLocationAvailable] = useState<boolean>(false);
  const [locationSelected, setLocationSelected] = useState<boolean>(false); 
  const latitudeDisplay = Math.abs(latitude).toFixed(2);
  const longitudeDisplay = Math.abs(longitude).toFixed(2);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { getCurrrentLocation } = useDistanceCalculator();

  const northSouth = useCallback(() => latitude >= 0 ? 'N' : 'S', [latitude])
  const eastWest = useCallback(() => longitude >= 0 ? 'E' : 'W', [longitude])

  useEffect(() => {
    async function fetchLocation() {
      const location = await getCurrrentLocation(); 
      if (location !== null) {
        setLocationAvailable(true);
        setLatitude(location.lat_decimal);
        setLongitude(location.lon_decimal);
      }
    }
    fetchLocation();
  }, [getCurrrentLocation]);


  return (
    <div className="current-position-selector-outer" role="group" aria-label="Nearest airports location controls">
      <div className="current-position-selector" role="group" aria-label="Nearest airports location controls">
        <div className="na-label">Location:</div>

        <div className="na-inputs">
          <label className="na-field na-field-left">
            <span className="na-field-label">Lat:</span>
            <input className="na-coord-input" type="text" defaultValue={''} value={latitudeDisplay} aria-label="Latitude" readOnly={true} />°{northSouth()}
          </label>

          <label className="na-field na-field-right">
            <span className="na-field-label">Lon:</span>
            <input className="na-coord-input" type="text" defaultValue={''} value={longitudeDisplay} aria-label="Longitude" readOnly={true} />°{eastWest()}
          </label>

          <div className="na-inputs-spacer" />
        </div>

        <button type="button" className="na-change-btn" onClick={() => setModalIsOpen(true)}>Change</button>
      </div>
      {!locationAvailable && !locationSelected && (
        <div className="na-location-unavailable">Current location unavailable - defaulting to 50°N, 0°E</div>
      )}
      <PositionSelectorModalComponent isOpen={modalIsOpen} onPositionSelected={(payload) => {
        if (payload.positionSelected !== null) {
          setLatitude(payload.positionSelected.lat_decimal);
          setLongitude(payload.positionSelected.lon_decimal);
          setLocationSelected(true);
        }
        setModalIsOpen(false);
      }} />
    </div>
  )
}
