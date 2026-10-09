import { useEffect, useState } from 'react'

function getMq(query: string): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() =>
    getMq('(prefers-reduced-motion: reduce)'),
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduce
}

export function useIsNarrow(maxWidth = 760): boolean {
  const [narrow, setNarrow] = useState(() =>
    getMq(`(max-width: ${maxWidth}px)`),
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const sync = () => setNarrow(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [maxWidth])

  return narrow
}

export function useSupportsScrollTimeline(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'scroll()')
  )
}
