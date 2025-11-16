import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import '../common/tabs.css'
import './FlightSearchTabPanelComponent.css'
import FlightSearchResultsComponent from './FlightSearchResultsComponent'

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null
}

export default function FlightSearchTabPanelComponent() {
  // default to the right-hand tab (Results) by using index 1
  const [selectedTabIndex, setSelectedTabIndex] = useState(1)
  return (
    <div className="flight-search-tab-panel-component">
      <Box>
        <div className="tab-set">
          <Tabs value={selectedTabIndex} onChange={(_, v) => setSelectedTabIndex(v)} aria-label="flight search tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Criteria" className="tab-header tab-header-left" />
            <Tab label="Results" className="tab-header tab-header-right" />
          </Tabs>
        </div>

  <TabPanel value={selectedTabIndex} index={0}>
          <div className="flight-search-tab-panel-criteria">
            Custom criteria for searching for flights... (coming soon)
          </div>
        </TabPanel>
  <TabPanel value={selectedTabIndex} index={1}>
          <div className="flight-search-tab-panel-results">
            <FlightSearchResultsComponent />
          </div>
        </TabPanel>
      </Box>
    </div>
  )
}
