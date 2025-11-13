import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { Link as RouterLink } from 'react-router-dom'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/flights', label: 'Flights' },
  { to: '/airports', label: 'Airports' },
  { to: '/settings', label: 'Settings' },
]

export default function DemoDrawer() {
  const theme = useTheme()
  // treat >= md as desktop
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [open, setOpen] = useState(false)

  const drawerWidth = 260

  const drawerContent = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Box sx={{ p: 2, fontWeight: 'bold' }}>App Menu</Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((it) => (
          <ListItem key={it.to} disablePadding>
            <ListItemButton component={RouterLink} to={it.to} onClick={() => { if (!isDesktop) setOpen(false) }}>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      {/* Menu button visible on mobile */}
      {!isDesktop && (
        <IconButton aria-label="open menu" onClick={() => setOpen(true)} sx={{ ml: 1 }}>
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop: permanent left drawer; Mobile: temporary slide-out */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}
