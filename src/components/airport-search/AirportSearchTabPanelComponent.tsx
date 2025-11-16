import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import '../common/tabs.css'
import './AirportSearchTabPanelComponent.css'
import MapComponent from '../MapComponent'

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null
}

export default function AirportSearchTabPanelComponent() {
  const [value, setValue] = useState(0)
  return (
    <div className="airport-search-tab-panel-component">
      <Box>
        <div className="tab-set">
          <Tabs value={value} onChange={(_, v) => setValue(v)} aria-label="example tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="by Map" className="tab-header tab-header-left" />
            <Tab label="By Territories" className="tab-header tab-header-inner" />
            <Tab label="From Point" className="tab-header tab-header-right" />
          </Tabs>
        </div>

        <TabPanel value={value} index={0}>
          <div className="airport-search-tab-panel-by-maps">
            <MapComponent />
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className="airport-search-tab-panel-by-territories">
            Search for airports by continent/territory... (coming soon)
          </div>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className="airport-search-tab-panel-from-point">
            Search for airports from a specific point... (coming soon)
          </div>
        </TabPanel>
      </Box>
    </div>
  )
}
