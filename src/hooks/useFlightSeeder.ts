import { useCallback, useRef, useState } from 'react'
import { useAirports } from './data/useAirports'
import { useTerritories } from './data/useTerritories'
import { useFlights } from './data/useFlights'
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
 * Seed flight data into the system on app start-up.
 */
export function useFlightSeeder() {
  // Service hook accessors
  const { getAll: getAllAirports } = useAirports()
  const { getAll: getAllTerritories } = useTerritories()
  const { create: createFlight } = useFlights()
  const { calculateDistance: calculateFlightDistance } = useDistanceCalculator()
  const { calculateFlightTimeMinutes } = useFlightTimeCalculator()

  const [airportData, setAirportData] = useState<Airport[]>([])
  const [territoryData, setTerritoryData] = useState<Territory[]>([])

  const loadAirports = useCallback(async () => {
    const a = await getAllAirports()
    setAirportData(a)
    return a
  }, [getAllAirports])

  const loadTerritories = useCallback(async () => {
    const t = await getAllTerritories()
    setTerritoryData(t)
    return t
  }, [getAllTerritories])

  const seededRef = useRef(false)

  const triggerSeed = useCallback(async () => {
    if (seededRef.current) return
    seededRef.current = true

    const airportDataTemp = await loadAirports()
    const territoryDataTemp = await loadTerritories()

    // preserve original helper order, but return null on failures and log them

    const today = new Date(new Date().toDateString())
    const oldestFlightsDate = addDays(today, -30)
    const lastFlightsDate = addDays(today, 60)

    const getFlightTimesForDate = (flightDate: Date) => {
      const totalFlightsPerDay = FLIGHT_SEED_CONFIG.reduce((acc, cfg) => acc + cfg.flightsPerDay, 0)
      const minutesInDay = 24 * 60
      const timeSlots: Date[] = []

      for (let i = 0; i < totalFlightsPerDay; i++) {
        let slotTaken: boolean
        let attempts = 0
        do {
          if (attempts >= totalFlightsPerDay) {
            console.log(`Could not find sufficient unique time slots for ${flightDate.toDateString()}; continuing with what we have`)
            break
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

    const getAirportsByTerritory = (countryCode: string) =>
      airportDataTemp.filter((a) => a.country === countryCode)

    const getTerritoriesByContinent = (continentCode: ContinentCode) =>
      territoryDataTemp.filter((t) => t.continents?.includes(continentCode))

    const getAirportsFromCountries = (fromCountryCode: string, toCountryCode: string) => {
      try {
        const fromAirportsList = getAirportsByTerritory(fromCountryCode)
        const toAirportsList = fromCountryCode === toCountryCode ? fromAirportsList : getAirportsByTerritory(toCountryCode)

        if (fromAirportsList.length === 0 || toAirportsList.length === 0) {
          console.log(`No airports available for countries ${fromCountryCode} -> ${toCountryCode}`)
          return null
        }

        const maxAttempts = Math.max(10, fromAirportsList.length * 2)
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
          const fromAirport = fromAirportsList[Math.floor(Math.random() * fromAirportsList.length)]
          const toAirport = toAirportsList[Math.floor(Math.random() * toAirportsList.length)]
          if (fromAirport.code !== toAirport.code) return { fromAirport, toAirport }
        }

        console.log(`Unable to select different airports from territories ${fromCountryCode} and ${toCountryCode} after ${maxAttempts} attempts`)
        return null
      } catch (err) {
        console.log('getAirportsFromCountries error', err)
        return null
      }
    }

    const getUsableTerritories = (fromTerritories: Territory[], toTerritories: Territory[]) => {
      try {
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

        console.log('Unable to find usable territory pair after max attempts')
        return null
      } catch (err) {
        console.log('getUsableTerritories error', err)
        return null
      }
    }

    const getCountryCodesFromContinents = (fromContinentCode: ContinentCode, toContinentCode: ContinentCode | null) => {
      const allTerritoriesInFromContinent = getTerritoriesByContinent(fromContinentCode)
      const allTerritoriesInToContinent =
        fromContinentCode === toContinentCode
          ? allTerritoriesInFromContinent
          : toContinentCode
          ? getTerritoriesByContinent(toContinentCode)
          : territoryDataTemp

      return getUsableTerritories(allTerritoriesInFromContinent, allTerritoriesInToContinent)
    }

    const getAirportsFromContinents = (fromContinentCode: ContinentCode, toContinentCode: ContinentCode | null) => {
      const pair = getCountryCodesFromContinents(fromContinentCode, toContinentCode)
      if (!pair) return null
      const { fromTerritory, toTerritory } = pair
      const airports = getAirportsFromCountries(fromTerritory.code, toTerritory.code)
      return airports
    }

    const createFlightsForDate = async (flightDate: Date) => {
      const flightsForDate: Flight[] = []
      const timeSlots = getFlightTimesForDate(flightDate)
      let slotIndex = 0

      for (const cfg of FLIGHT_SEED_CONFIG) {
        for (let i = 0; i < cfg.flightsPerDay; i++) {
          const flightTime = timeSlots[slotIndex++] || addMinutes(flightDate, i * 10)
          const airports = getAirportsFromContinents(cfg.fromContinent, cfg.toContinent)
          if (!airports) {
            console.log(`Skipping flight: no airport pair available for ${JSON.stringify(cfg)} on ${flightDate.toDateString()}`)
            continue
          }
          const { fromAirport, toAirport } = airports

          const distanceKm = calculateFlightDistance(fromAirport, toAirport)
          const durationMinutes = calculateFlightTimeMinutes(distanceKm)

          const latencyMs = 0 // zero latency for seeding

          try {
            const createdFlight = await createFlight({
              departureAirport: fromAirport.code,
              destinationAirport: toAirport.code,
              departureTime: flightTime,
              arrivalTime: addMinutes(flightTime, durationMinutes),
              distanceKm,
              durationMinutes,
            }, latencyMs )
            if (createdFlight) flightsForDate.push(createdFlight)
          } catch (err) {
            console.log('createFlight failed for pair', fromAirport.code, toAirport.code, err)
            // skip this one and continue
          }
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

    const seeded = await createFlightsForDateRange(oldestFlightsDate, lastFlightsDate)

    setAirportData(airportDataTemp)
    setTerritoryData(territoryDataTemp)

    return seeded
  }, [loadAirports, loadTerritories, createFlight, calculateFlightDistance, calculateFlightTimeMinutes])

  return {
    triggerSeed,
    airportData,
    territoryData,
  } as const
}

export default useFlightSeeder
