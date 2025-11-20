import Dialog from "@mui/material/Dialog"
import PositionSelectorMapComponent, { type PositionSelectPayload } from "./PositionSelectorMapComponent"
import { useEffect, useState } from "react"
import { DialogContent, DialogTitle } from "@mui/material"
import type { GeoPoint } from "../../models/geo-types"

export default function PositionSelectorModalComponent({
  isOpen = false,
  selectedCenter,
  selectedZoom,
  onPositionSelected,
  onZoomChanged
}: {
  isOpen?: boolean,
  selectedCenter?: GeoPoint | null,
  selectedZoom?: number | null,
  onPositionSelected?: (p: PositionSelectPayload) => void,
  onZoomChanged?: (z: { zoom: number }) => void
}) {
  const [open, setOpen] = useState(false) 

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleMapSelect = (p: PositionSelectPayload) => {
    if (typeof onPositionSelected === 'function') {
      onPositionSelected(p)
    }
    setOpen(false);
  }

  return (
    <div className="position-selector-modal-component">
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="demo-dialog-title">
        <DialogTitle id="demo-dialog-title">Please select a position on the map</DialogTitle>
        <DialogContent>
          <PositionSelectorMapComponent 
            selectedCenter={selectedCenter} 
            onPositionSelected={handleMapSelect}
            selectedZoom={selectedZoom}
            onZoomChanged={onZoomChanged} />
        </DialogContent>
      </Dialog>
    </div>
  )
}