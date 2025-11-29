import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Temporary demo component showing a basic Material Dialog (modal).
// Place this file under `src/app/temp3` for testing or later integration.
export default function MaterialModalDemo() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <div style={{ padding: '1rem' }}>
      <Button variant="contained" onClick={handleOpen} color="primary">
        Open Demo Modal
      </Button>

      <Dialog open={open} onClose={handleClose} aria-labelledby="demo-dialog-title">
        <DialogTitle id="demo-dialog-title">Demo Modal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a temporary demo of a Material-UI Dialog. It demonstrates a simple modal
            with a title, body text, and actions. Replace or extend this for real content.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => { /* placeholder confirm action */ handleClose() }} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
