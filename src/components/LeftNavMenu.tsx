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
  { to:  `${location.href}`, label: 'Home' },
  { to: `${location.href}map`, label: 'Map' },
  { to: `${location.href}airports`, label: 'Airports' },
  { to: `${location.href}flight-search?departFrom=now&page=1&pageSize=6`, label: 'Flight Search' },
  { to: `${location.href}settings`, label: 'Settings' },
  { to: `${location.href}empty`, label: 'Empty' },
]

export default function LeftNavMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        // Prevent horizontal scrollbar by hiding x-overflow on the drawer paper.
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', overflowX: 'hidden' },
      }}
    >
      <Box sx={{ width: drawerWidth }} role="presentation">
        <Box sx={{ p: 2, fontWeight: 'bold', overflowX: 'hidden' }}>App Menu</Box>
        <Divider />
        <List>
          {NAV_ITEMS.map((it) => (
            <ListItem key={it.to} disablePadding>
              <ListItemButton component={RouterLink} to={it.to} onClick={onClose}>
                <ListItemText primary={it.label} primaryTypographyProps={{ noWrap: true }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
