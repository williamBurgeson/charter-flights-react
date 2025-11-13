import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { Link as RouterLink } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/flights', label: 'Flights' },
  { to: '/airports', label: 'Airports' },
  { to: '/settings', label: 'Settings' },
]

export default function LeftDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drawerWidth = 260
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const variant = isDesktop ? 'permanent' : 'temporary'

  return (
    <Drawer
      variant={variant}
      open={isDesktop ? true : open}
      onClose={onClose}
      ModalProps={isDesktop ? undefined : { keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ width: drawerWidth }} role="presentation">
        <Box sx={{ p: 2, fontWeight: 'bold' }}>App Menu</Box>
        <Divider />
        <List>
          {NAV_ITEMS.map((it) => (
            <ListItem key={it.to} disablePadding>
              <ListItemButton component={RouterLink} to={it.to} onClick={onClose}>
                <ListItemText primary={it.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
