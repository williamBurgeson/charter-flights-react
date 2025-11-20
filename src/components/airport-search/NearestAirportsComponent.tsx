import './NearestAirportsComponent.css'
import CurrentPositionSelectorComponent from './CurrentPositionSelectorComponent'
import type { GeoPoint } from '../../models/geo-types'
import { useState } from 'react'
import NearestAirportsTableComponent from './NearestAirportsTableComponent'

export default function NearestAirportsComponent() {
  const [currentPosition, setCurrentPosition] = useState<GeoPoint | null>(null)

  return (
    <div className="nearest-airports">
      <div className="nearest-airports-header">Nearest airports (skeleton)</div>
      <CurrentPositionSelectorComponent onPositionSelected={setCurrentPosition} />
      <NearestAirportsTableComponent currentPosition={currentPosition}  />
    </div>
  )
}
