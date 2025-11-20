import Dialog from "@mui/material/Dialog"
import PositionSelectorMapComponent, { type PositionSelectPayload } from "./PositionSelectorMapComponent"
import { useEffect, useState } from "react"
import { DialogContent, DialogTitle } from "@mui/material"

export default function PositionSelectorModalComponent({
  isOpen = false,
  onPositionSelected
}: {
  isOpen?: boolean,
  onPositionSelected?: (p: PositionSelectPayload) => void
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
          <PositionSelectorMapComponent onPositionSelected={handleMapSelect} />
        </DialogContent>
      </Dialog>
    </div>
  )
}