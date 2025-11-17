import type { FlightSearchResult } from "../../hooks/useFlightSearch"

type Props = {
  searchResults?: FlightSearchResult | null
}

export default function FlightResultsFooterComponent({ searchResults }: Props) {



  return (
      <div className="pagination">
        <span className="arrow">&laquo;</span>
        {
          (() => {
            const pageIndex = searchResults?.pageIndex ?? 0
            const pageSize = searchResults?.pageSize ?? (searchResults?.flights?.length ?? 0)
            const start = pageIndex * pageSize + (pageSize > 0 ? 1 : 0)
            const end = start + (searchResults?.flights?.length ?? 0) - 1
            const total = searchResults?.totalCount ?? (searchResults?.flights?.length ?? 0)
            return `Displaying ${start}–${end} of ${total}`
          })()
        }
        <span className="arrow">&raquo;</span>
      </div>
  )
}