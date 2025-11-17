import React, { useEffect, useMemo, useRef, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

type AirportOption = {
  code: string
  name: string
  country?: string
}

/**
 * Temp page: async autocomplete textbox that queries local `/airports.json` and shows a dropdown.
 * This is intentionally simple and safe (no external API calls).
 */
export default function AutocompleteTemp() {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<AirportOption[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  const fetchSuggestions = async (q: string) => {
    if (!q || q.length < 2) {
      setOptions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/airports.json')
      if (!res.ok) {
        setOptions([])
        return
      }
      const data: unknown[] = await res.json()
      const qlc = q.toLowerCase()
      const matches = data
        .filter((a) => {
          const name = String(a.name || '')
          const code = String(a.iata_code || a.code || '')
          return name.toLowerCase().includes(qlc) || code.toLowerCase().includes(qlc)
        })
        .slice(0, 25)
        .map((a) => ({ code: a.iata_code || a.code || '', name: a.name, country: a.country }))
      setOptions(matches)
    } catch (err) {
      console.error('suggestion fetch error', err)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // debounce input changes
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    // small debounce to avoid hammering disk/FS in dev
    debounceRef.current = window.setTimeout(() => fetchSuggestions(inputValue), 300)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [inputValue])

  const renderOptionLabel = useMemo(() => (opt: AirportOption) => `${opt.name} (${opt.code})${opt.country ? ' — ' + opt.country : ''}` , [])

  return (
    <div style={{ padding: 16 }}>
      <h2>Async Autocomplete (temp2)</h2>
      <Box sx={{ width: 600, maxWidth: '100%' }}>
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          options={options}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : renderOptionLabel(opt))}
          onInputChange={(_, value) => setInputValue(value)}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search airports"
              placeholder="Type name or IATA code (min 2 chars)"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
    </div>
  )
}
