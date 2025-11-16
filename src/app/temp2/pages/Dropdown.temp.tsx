import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

type Continent = {
  code: string
  name: string
}

export default function DropdownTemp() {
  const [continents, setContinents] = useState<Continent[]>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/continents.json')
        if (!res.ok) return
        const data = (await res.json()) as Continent[]
        if (!cancelled) setContinents(data.map((c) => ({ code: c.code, name: c.name })))
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (e: SelectChangeEvent<string>) => setValue(e.target.value)

  return (
    <div style={{ padding: 16 }}>
      <h2>MUI Select Dropdown (temp2)</h2>
      <Box sx={{ minWidth: 240, maxWidth: '100%' }}>
        <FormControl fullWidth>
          <InputLabel id="continent-select-label">Continent</InputLabel>
          <Select
            labelId="continent-select-label"
            value={value}
            label="Continent"
            onChange={handleChange}
            disabled={loading}
            renderValue={(v) => {
              const found = continents.find((c) => c.code === v)
              return found ? `${found.name} (${found.code})` : ''
            }}
          >
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={16} />
                <span style={{ marginLeft: 8 }}>Loading…</span>
              </MenuItem>
            ) : (
              continents.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>
    </div>
  )
}
