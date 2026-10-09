import { useEffect, useState, type RefObject } from 'react'
import { useIsNarrow, usePrefersReducedMotion, useSupportsScrollTimeline } from './useMotionPrefs'

/** Fallback JS parallax when CSS scroll-driven animations are unavailable. */
export function useParallaxOffset(
  ref: RefObject<HTMLElement | null>,
  factor: number,
): number {
  const reduce = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const scrollTimeline = useSupportsScrollTimeline()
  const disabled = reduce || narrow || scrollTimeline
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (disabled) return

    let frame = 0

    const update = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2
      setOffset(-mid * factor)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, factor, disabled])

  return disabled ? 0 : offset
}
