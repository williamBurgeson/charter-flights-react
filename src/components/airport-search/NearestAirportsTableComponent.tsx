// src/components/airport-search/NearestAirportsTableComponent.tsx
import React from 'react'
import './NearestAirportsTableComponent.css'

export default function NearestAirportsTableComponent(): JSX.Element {
  return (
    <div className="nearest-airports">
      <div className="nearest-airports-header">Nearest airports (skeleton)</div>
      <div className="nearest-airports-empty">No data — skeleton component.</div>
    </div>
  )
}
