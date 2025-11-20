import Dialog from "@mui/material/Dialog"
import PositionSelectorMapComponent, { type PositionSelectPayload } from "./PositionSelectorMapComponent"
import { useEffect, useRef, useState } from "react"
import { DialogContent, DialogTitle } from "@mui/material"
import type { GeoPoint } from "../../models/geo-types"

export default function PositionSelectorModalComponent({
  isOpen = false,
  selectedCenter,
  onPositionSelected
}: {
  isOpen?: boolean,
  selectedCenter?: GeoPoint | null,
  selectedZoom?: number | null,
  onPositionSelected?: (p: PositionSelectPayload) => void
}) {
  const [open, setOpen] = useState(false) 

  // Keep track of zoom level to pass back to map on re-open
  const zoomRef = useRef<number | null>(null);

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
            selectedZoom={zoomRef.current}
            onZoomChanged={z => { zoomRef.current = z.zoom }}
            />
        </DialogContent>
      </Dialog>
    </div>
  )
}