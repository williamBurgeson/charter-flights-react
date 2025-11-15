import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import './AirportSearchTabPanelComponent.css'

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null
}

export default function AirportSearchTabPanelComponent() {
  const [value, setValue] = useState(0)
  return (
    <div className="airport-search-tab-panel-component">
      <Box>
        <Tabs value={value} onChange={(_, v) => setValue(v)} aria-label="example tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="by Map" />
          <Tab label="By Territories" />
          <Tab label="From Point" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <div className="airport-search-tab-panel-by-maps">
            First content
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className="airport-search-tab-panel-by-territories">
            Second content
          </div>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className="airport-search-tab-panel-from-point">
            Third content
          </div>
        </TabPanel>
      </Box>
    </div>
  )
}
