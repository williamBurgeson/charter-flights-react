import { useCallback, useRef, useState } from 'react'
import { useAirports } from './data/useAirports'
import { useTerritories } from './data/useTerritories'
import { useFlights, type FlightCreateParams } from './data/useFlights'
import type { Airport } from '../models/airport.model'
import type { Territory } from '../models/territory.model'
import { addDays, addMinutes, getTicks } from '../utils/date-utils'
import type { ContinentCode } from '../models/continent.model'
import type { Flight } from '../models/flight.model'
import { useDistanceCalculator } from './useDistanceCalculator'
import useFlightTimeCalculator from './useFlightTimeCalculator'

interface FlightSeedInfo {
  fromContinent: ContinentCode
  toContinent: ContinentCode | null
  flightsPerDay: number
}

const FLIGHT_SEED_CONFIG: FlightSeedInfo[] = [
  { fromContinent: 'EU', toContinent: 'EU', flightsPerDay: 20 },
  { fromContinent: 'AS', toContinent: 'AS', flightsPerDay: 20 },
  { fromContinent: 'NA', toContinent: 'NA', flightsPerDay: 10 },
  { fromContinent: 'SA', toContinent: 'SA', flightsPerDay: 10 },
  { fromContinent: 'AF', toContinent: 'AF', flightsPerDay: 5 },
  { fromContinent: 'OC', toContinent: 'OC', flightsPerDay: 5 },
  { fromContinent: 'EU', toContinent: null, flightsPerDay: 10 },
  { fromContinent: 'AS', toContinent: null, flightsPerDay: 10 },
  { fromContinent: 'NA', toContinent: null, flightsPerDay: 5 },
  { fromContinent: 'SA', toContinent: null, flightsPerDay: 5 },
  { fromContinent: 'AF', toContinent: null, flightsPerDay: 2 },
  { fromContinent: 'OC', toContinent: null, flightsPerDay: 2 },
]

/**
 * Hook: expose arrays for display and a `triggerSeed` that will run once per
 * component lifetime. The trigger awaits the accessor `getAll()` helpers so
 * callers don't need to worry about loading state.
 */
export function useFlightSeeder() {
  // Accessor hooks (async accessor methods + cached data)
  const { getAll: getAllAirports } = useAirports()
  const { getAll: getAllTerritories } = useTerritories()
  const { create: createFlight } = useFlights()
  const { calculateDistance : calculateFlightDistance } = useDistanceCalculator()
  const { calculateFlightTimeMinutes } = useFlightTimeCalculator()

  // Entity arrays aliased to the domain name. Use state so callers can treat
  // them as stable `const` snapshots. We'll keep them in sync with the
  // accessor's data and update them when the seeder explicitly loads data.
  const [airportData, setAirportData] = useState<Airport[]>([])
  const [territoryData, setTerritoryData] = useState<Territory[]>([])

  // Load helpers: explicitly load and snapshot data. These replace exposing
  // the accessor.getAll methods directly to avoid duplication between the
  // exported array (`airportData`) and a getAll function that returns the same
  // data.
  const loadAirports = useCallback(async () => {
    const a = await getAllAirports()
    setAirportData(a)
    return a
  }, [airportData, getAllAirports])

  const loadTerritories = useCallback(async () => {
    const t = await getAllTerritories()
    setTerritoryData(t)
    return t
  }, [territoryData, getAllTerritories])

  const seededRef = useRef(false)

  const triggerSeed = useCallback(
    async (params: FlightCreateParams) => {
      if (seededRef.current) return
      

      // Ensure underlying data is loaded via the loader helpers and
      // snapshot it into local state so callers can use the `airportData`
      const airportDataTemp = await loadAirports()
      const territoryDataTemp = await loadTerritories()
      setAirportData(airportDataTemp)
      setTerritoryData(territoryDataTemp)

      // const create = createFn ?? createFlight

      // minimal guard
      if (airportData.length === 0 || territoryData.length === 0) {
        return;
      } 

      seededRef.current = true

      const today = new Date(new Date().toDateString())
      const fortyFiveDaysAgo = addDays(today, -45)

      const getFlightTimesForDate = (flightDate: Date) => {
        const totalFlightsPerDay = FLIGHT_SEED_CONFIG.reduce((acc, cfg) => acc + cfg.flightsPerDay, 0)
        const minutesInDay = 24 * 60
        const timeSlots: Date[] = []

        for (let i = 0; i < totalFlightsPerDay; i++) {
          let slotTaken: boolean
          let attempts = 0
          do {
            if (attempts >= totalFlightsPerDay) {
              throw new Error('Could not find sufficient unique time slots for flight seeding')
            }
            attempts++
            const minutesSeed = Math.floor(Math.random() * minutesInDay)
            const proposedTime = addMinutes(flightDate, minutesSeed)
            slotTaken = timeSlots.some((ts) => getTicks(ts) === getTicks(proposedTime))
            if (!slotTaken) timeSlots.push(proposedTime)
          } while (slotTaken)
        }
        return timeSlots
      }

      const getAirportsByTerritory = (countryCode: string) => airportData.filter((a) => a.country === countryCode)
      const getTerritoriesByContinent = (continentCode: ContinentCode) =>
        territoryData.filter((t) => t.continents?.includes(continentCode))

      const getAirportsFromCountries = (fromCountryCode: string, toCountryCode: string) => {
        const fromAirportsList = getAirportsByTerritory(fromCountryCode)
        const toAirportsList = fromCountryCode === toCountryCode ? fromAirportsList : getAirportsByTerritory(toCountryCode)

        if (fromAirportsList.length === 0 || toAirportsList.length === 0) {
          throw new Error('No airports available for given countries')
        }

        const maxAttempts = Math.max(10, fromAirportsList.length * 2)
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
          const fromAirport = fromAirportsList[Math.floor(Math.random() * fromAirportsList.length)]
          const toAirport = toAirportsList[Math.floor(Math.random() * toAirportsList.length)]
          if (fromAirport.code !== toAirport.code) return { fromAirport, toAirport }
        }

        // fallback
        return { fromAirport: fromAirportsList[0], toAirport: toAirportsList[0] }
      }

      const getUsableTerritories = (fromTerritories: Territory[], toTerritories: Territory[]) => {
        const maxAttempts = Math.max(10, fromTerritories.length * 2)
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
          const fromTerritory = fromTerritories[Math.floor(Math.random() * fromTerritories.length)]
          const toTerritory = toTerritories[Math.floor(Math.random() * toTerritories.length)]

          const fromAirportsList = getAirportsByTerritory(fromTerritory.code)
          const toAirportsList = fromTerritory.code === toTerritory.code ? fromAirportsList : getAirportsByTerritory(toTerritory.code)

          if (fromAirportsList.length === 0 || toAirportsList.length === 0) continue

          if (fromTerritory.code !== toTerritory.code) return { fromTerritory, toTerritory }
          if (fromAirportsList.length >= 2) return { fromTerritory, toTerritory }
        }

        // fallback: return first pair
        return { fromTerritory: fromTerritories[0], toTerritory: toTerritories[0] }
      }

      const getCountryCodesFromContinents = (fromContinentCode: ContinentCode, toContinentCode: ContinentCode | null) => {
        const allTerritoriesInFromContinent = getTerritoriesByContinent(fromContinentCode)
        const allTerritoriesInToContinent =
          fromContinentCode === toContinentCode
            ? allTerritoriesInFromContinent
            : toContinentCode
            ? getTerritoriesByContinent(toContinentCode)
            : territoryData

        return getUsableTerritories(allTerritoriesInFromContinent, allTerritoriesInToContinent)
      }

      const getAirportsFromContinents = (fromContinentCode: ContinentCode, toContinentCode: ContinentCode | null) => {
        const { fromTerritory, toTerritory } = getCountryCodesFromContinents(fromContinentCode, toContinentCode)
        const { fromAirport, toAirport } = getAirportsFromCountries(fromTerritory.code, toTerritory.code)
        return { fromAirport, toAirport }
      }

      const createFlightsForDate = async (flightDate: Date) => {
        const flightsForDate: Flight[] = []
        const timeSlots = getFlightTimesForDate(flightDate)
        let slotIndex = 0

        for (const cfg of FLIGHT_SEED_CONFIG) {
          for (let i = 0; i < cfg.flightsPerDay; i++) {
            const flightTime = timeSlots[slotIndex++] || addMinutes(flightDate, i * 10)
            const { fromAirport, toAirport } = getAirportsFromContinents(cfg.fromContinent, cfg.toContinent)

            // awaiting implementation of distance calculation
            const distanceKm = calculateFlightDistance(fromAirport, toAirport)
            const durationMinutes = calculateFlightTimeMinutes(distanceKm)

            const createdFlight = await createFlight({
              departureAirport: fromAirport.code,
              destinationAirport: toAirport.code,
              departureTime: flightTime,
              arrivalTime: addMinutes(flightTime, durationMinutes),
              distanceKm,
              durationMinutes,
            })
            if (createdFlight) flightsForDate.push(createdFlight)
          }
        }

        return flightsForDate
      }

      const createFlightsForDateRange = async (startDate: Date, endDate: Date) => {
        const allFlights: Flight[] = []
        let currentDate = startDate
        while (currentDate <= endDate) {
          const flights = await createFlightsForDate(currentDate)
          allFlights.push(...flights)
          currentDate = addDays(currentDate, 1)
        }
        return allFlights
      }

      return await createFlightsForDateRange(fortyFiveDaysAgo, addDays(today, 45))
    },
    [airportData, territoryData],
  )

  return {
    triggerSeed,
  } as const
}

export default useFlightSeeder
