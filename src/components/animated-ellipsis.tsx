import { useEffect, useState } from 'react'

interface EllipsisProps {
  /** interval between updates, in seconds */
  intervalSeconds?: number
  /** character to repeat (default '.') */
  tokenChar?: string
  /** number of tokens to cycle through */
  maxTokens?: number
  /** include a zero-dot stage in the cycle (0..maxDots) */
  includeZeroTokenPhase?: boolean
  className?: string
}

export default function AnimatedEllipsis({
  intervalSeconds = 0.5,
  tokenChar = '.',
  maxTokens = 3,
  includeZeroTokenPhase = true,
  className,
}: EllipsisProps) {
  const defaultCount = includeZeroTokenPhase ? 0 : 1;
  const [count, setCount] = useState<number>(defaultCount)
  useEffect(() => {
    const ms = Math.max(10, Math.round(intervalSeconds * 1000))
    const id = window.setInterval(() => {
      setCount((c) => {
        return c >= maxTokens ? defaultCount : c + 1
      })
    }, ms)
    return () => clearInterval(id)
  }, [intervalSeconds, maxTokens, includeZeroTokenPhase, defaultCount])
  const tokens = tokenChar.repeat(Math.max(0, count))

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', position: 'relative', lineHeight: 1 }}>
      {/* invisible token reserves width so the element doesn't jump */}
      <span aria-hidden style={{ visibility: 'hidden', display: 'inline-block' }}>
        {tokenChar.repeat(Math.max(0, maxTokens))}
      </span>
      <span
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}>
        {tokens}
      </span>
    </span>
  )
}
