import { useCallback, useEffect, useRef, useState } from 'react'
import './CurrentPositionSelectorComponent.css'
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator'
import PositionSelectorModalComponent from './PositionSelectorModaComponentl';
import type { GeoPoint } from '../../models/geo-types';

export default function CurrentPositionSelectorComponent({
  onPositionSelected,
}: { 
  onPositionSelected?: (p: GeoPoint | null) => void } = {}
) {
  const defaultLatitude = 50.0;
  const defaultLongitude = 0.0;
  const defaultLocation: GeoPoint = { lat_decimal: defaultLatitude, lon_decimal: defaultLongitude };
  const [referencePosoition, setReferencePosition] = useState<GeoPoint | null>(null);
  // const [latitude, setLatitude] = useState(defaultLatitude)
  // const [longitude, setLongitude] = useState(defaultLongitude)
  const [locationAvailable, setLocationAvailable] = useState<boolean>(false);
  const [locationSelected, setLocationSelected] = useState<boolean>(false); 
  const latitudeDisplay = Math.abs(referencePosoition?.lat_decimal ?? defaultLatitude).toFixed(2);
  const longitudeDisplay = Math.abs(referencePosoition?.lon_decimal ?? defaultLongitude).toFixed(2);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const zoomRef = useRef<number | null>(null);

  const { getCurrrentLocation } = useDistanceCalculator();

  const northSouth = useCallback(() => referencePosoition?.lat_decimal ?? defaultLatitude >= 0 ? 'N' : 'S', [referencePosoition])
  const eastWest = useCallback(() => referencePosoition?.lon_decimal ?? defaultLongitude >= 0 ? 'E' : 'W', [referencePosoition])

  const applySelection = () => {
    const payload = { lat_decimal: referencePosoition?.lat_decimal ?? defaultLatitude, lon_decimal: referencePosoition?.lon_decimal ?? defaultLongitude }
    setLocationSelected(true)
    onPositionSelected?.(payload)
  }

  useEffect(() => {
    async function fetchLocation() {
      if (referencePosoition === null) {
        const currentLocation = await getCurrrentLocation(); 

        setReferencePosition(currentLocation ?? defaultLocation);
        if (currentLocation === null) {
          setLocationAvailable(false);
          onPositionSelected?.(null);
          return;
        }
      }
      else {
        setLocationAvailable(true);
        onPositionSelected?.({ lat_decimal: referencePosoition.lat_decimal, lon_decimal: referencePosoition.lon_decimal });
        return;
      }
    }
    fetchLocation();
 
  }, [getCurrrentLocation, locationAvailable, referencePosoition, onPositionSelected, defaultLocation]);




  return (
    <div className="current-position-selector-outer" role="group" aria-label="Nearest airports location controls">
      <div className="current-position-selector" role="group" aria-label="Nearest airports location controls">
        <div className="na-label">Location:</div>

        <div className="na-inputs">
          <label className="na-field na-field-left">
            <span className="na-field-label">Lat:</span>
            <input className="na-coord-input" type="text" value={latitudeDisplay} aria-label="Latitude" readOnly={true} />°{northSouth()}
          </label>

          <label className="na-field na-field-right">
            <span className="na-field-label">Lon:</span>
            <input className="na-coord-input" type="text" value={longitudeDisplay} aria-label="Longitude" readOnly={true} />°{eastWest()}
          </label>

          <div className="na-inputs-spacer" />
        </div>

        <button type="button" className="na-change-btn" onClick={() => setModalIsOpen(true)}>Change</button>
      </div>
      {!locationAvailable && !locationSelected && (
        <div className="na-location-unavailable">Current location unavailable - defaulting to 50°N, 0°E</div>
      )}
      <PositionSelectorModalComponent isOpen={modalIsOpen} 
          selectedCenter={{lat_decimal: referencePosoition?.lat_decimal ?? defaultLatitude, lon_decimal: referencePosoition?.lon_decimal ?? defaultLongitude}}
          selectedZoom={zoomRef.current}
          onPositionSelected={(payload) => {
        if (payload.positionSelected !== null) {
          setReferencePosition(payload.positionSelected);
          applySelection();
        }
        setModalIsOpen(false);
      }} 
      onZoomChanged={(z) => zoomRef.current = z.zoom} />  
    </div>
  )
}
