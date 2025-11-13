import { useEffect, useState } from 'react'

interface EllipsisProps {
  /** interval between updates, in seconds */
  intervalSeconds?: number
  /** character to repeat (default '.') */
  char?: string
  /** number of dots to cycle through */
  maxDots?: number
  /** include a zero-dot stage in the cycle (0..maxDots) */
  includeZero?: boolean
  className?: string
}

export default function EllipsisTemp({
  intervalSeconds = 0.5,
  char = '.',
  maxDots = 3,
  includeZero = false,
  className,
}: EllipsisProps) {
  const effectiveMax = Math.max(0, Math.floor(maxDots))
  const [count, setCount] = useState<number>(includeZero ? 0 : (effectiveMax > 0 ? 1 : 0))

  useEffect(() => {
    const ms = Math.max(10, Math.round(intervalSeconds * 1000))
    const id = window.setInterval(() => {
      setCount((c) => {
        if (includeZero) {
          // cycle 0..effectiveMax
          return c >= effectiveMax ? 0 : c + 1
        }
        // cycle 1..effectiveMax (or remain 0 if effectiveMax is 0)
        if (effectiveMax <= 0) return 0
        return (c % effectiveMax) + 1
      })
    }, ms)
    return () => clearInterval(id)
  }, [intervalSeconds, effectiveMax, includeZero])

  const dots = char.repeat(Math.max(0, count))

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', position: 'relative', lineHeight: 1 }}
    >
      {/* invisible token reserves width so the element doesn't jump */}
      <span aria-hidden style={{ visibility: 'hidden', display: 'inline-block' }}>
        {char.repeat(Math.max(0, maxDots))}
      </span>
      <span
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}
      >
        {dots}
      </span>
    </span>
  )
}
