import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import '../common/tabs.css'
import './FlightSearchTabPanelComponent.css'

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null
}

export default function FlightSearchTabPanelComponent() {
  const [value, setValue] = useState(0)
  return (
    <div className="flight-search-tab-panel-component">
      <Box>
        <div className="tab-set">
          <Tabs value={value} onChange={(_, v) => setValue(v)} aria-label="flight search tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Criteria" className="tab-header tab-header-left" />
            <Tab label="Results" className="tab-header tab-header-right" />
          </Tabs>
        </div>

        <TabPanel value={value} index={0}>
          <div className="flight-search-tab-panel-criteria">
            Custom criteria for searching for flights... (coming soon)
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className="flight-search-tab-panel-results">
            Results here (in an hour or so)
          </div>
        </TabPanel>
      </Box>
    </div>
  )
}
