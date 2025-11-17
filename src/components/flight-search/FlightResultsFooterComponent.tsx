import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useFlightQueryParams from '../../hooks/useFlightQueryParams'
import type { FlightQuery } from '../../hooks/useFlightQueryParams'
import type { FlightSearchResult, FlightSearchParams } from '../../hooks/useFlightSearch'

type Props = {
  searchResults?: FlightSearchResult | null
  searchParams?: FlightSearchParams | null
}

// Return a canonical string to use for the departFrom query param when
// navigating from other pages into /flight-search. Prefer the component
// supplied FlightSearchParams.departureDateFrom (a Date). Otherwise fall
// back to the parsed query's departFrom value. Convert symbolic 'now'
// into a concrete ISO timestamp at navigation time.
function getCanonicalDepartFrom(q?: FlightQuery | null, searchParams?: FlightSearchParams | null): string | undefined {



  if (searchParams?.departureDateFrom) return (searchParams.departureDateFrom as Date).toISOString()
  const df = q?.departFrom
  if (!df) return undefined
  if (df === 'now') return new Date().toISOString()
  return String(df)
}

export default function FlightResultsFooterComponent({ searchResults, searchParams }: Props) {
  const { getQuery, setQuery } = useFlightQueryParams()
  const navigate = useNavigate()
  const location = useLocation()

  const pageIndex = searchResults?.pageIndex ?? 0
  const pageSize = searchResults?.pageSize ?? (searchResults?.flights?.length ?? 0)
  const total = searchResults?.totalCount ?? (searchResults?.flights?.length ?? 0)
  const currentPage = pageIndex + 1
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1

  const goToPage = useCallback(
    (targetPage: number) => {
      const q = getQuery()
      // If we're already on the flight-search route, just update the query
      // if (location.pathname === '/flight-search') {
      //   setQuery({ page: targetPage })
      //   return
      // }
      // otherwise build a search string from explicitly supplied values and navigate
      // ensure we carry the canonical departFrom value so the target page uses
      // the same temporal anchor (prevents showing already-departed flights)
      const sp = new URLSearchParams()
      const explicit = q?.explicitlySuppliedValues ?? {}
      for (const [k, v] of Object.entries(explicit)) sp.set(k, v)
      // set departFrom using helper
      const canonicalDepartFrom = getCanonicalDepartFrom(q, searchParams)
      if (canonicalDepartFrom && !sp.has('departFrom')) sp.set('departFrom', canonicalDepartFrom)
      sp.set('page', String(targetPage))
      sp.set('tab', 'results')
      navigate({ pathname: '/flight-search', search: `?${sp.toString()}` })
    },
    [getQuery, location.pathname, navigate, setQuery, searchParams]
  )

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  const start = pageIndex * pageSize + (pageSize > 0 ? 1 : 0)
  const end = start + (searchResults?.flights?.length ?? 0) - 1

  return (
    <div className="pagination">
      <span
        role="button"
        aria-disabled={prevDisabled}
        className={`arrow ${prevDisabled ? 'disabled' : ''}`}
        onClick={() => !prevDisabled && goToPage(currentPage - 1)}
      >
        &laquo;
      </span>
      {`Displaying ${start}–${end} of ${total}`}
      <span
        role="button"
        aria-disabled={nextDisabled}
        className={`arrow ${nextDisabled ? 'disabled' : ''}`}
        onClick={() => !nextDisabled && goToPage(currentPage + 1)}
      >
        &raquo;
      </span>
    </div>
  )
}