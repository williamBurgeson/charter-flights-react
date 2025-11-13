import { readPromise } from '../utils/promise-suspense-support' // or your resource path

export function FlightSeedHost() {
  // throws a Promise while pending -> Suspense shows fallback
  const seedValue = readPromise()

  console.log('FlightSeedHost: seedValue=', seedValue)

  // render using the seed result
  return <>Rendering...</>
}