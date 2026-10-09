import { useEffect, useRef } from 'react'
import { getLenis } from '../lib/lenisStore'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

const TEXT =
  'EN CARTELERA · ESTA SEMANA · ESTRENOS · FUNCIÓN CONTINUA · SALA ABIERTA · '

interface MarqueeScrollProps {
  className?: string
}

export function MarqueeScroll({ className = '' }: MarqueeScrollProps) {
  const reduce = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const dirRef = useRef(1)
  const speedRef = useRef(0.6)
  const lastYRef = useRef(0)

  useEffect(() => {
    if (reduce) return

    let frame = 0
    const track = trackRef.current
    if (!track) return

    const loop = () => {
      offsetRef.current += speedRef.current * dirRef.current
      const half = track.scrollWidth / 2
      if (half > 0) {
        if (offsetRef.current > half) offsetRef.current -= half
        if (offsetRef.current < 0) offsetRef.current += half
      }
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const onScroll = (payload?: { scroll: number; velocity: number }) => {
      const y = payload?.scroll ?? window.scrollY
      const velocity = payload?.velocity ?? y - lastYRef.current
      lastYRef.current = y
      if (velocity > 0.2) dirRef.current = 1
      else if (velocity < -0.2) dirRef.current = -1
      speedRef.current = Math.min(4.5, 0.55 + Math.abs(velocity) * 0.08)
    }

    const onWindowScroll = () => onScroll()
    const onLenisScroll = (instance: {
      scroll: number
      velocity: number
    }) => onScroll(instance)

    const lenis = getLenis()
    if (lenis) {
      lenis.on('scroll', onLenisScroll)
    } else {
      window.addEventListener('scroll', onWindowScroll, { passive: true })
    }

    return () => {
      cancelAnimationFrame(frame)
      if (lenis) lenis.off('scroll', onLenisScroll)
      else window.removeEventListener('scroll', onWindowScroll)
    }
  }, [reduce])

  const content = (
    <>
      <span>{TEXT}</span>
      <span>{TEXT}</span>
      <span>{TEXT}</span>
      <span>{TEXT}</span>
    </>
  )

  return (
    <div className={`marquee ${className}`.trim()} aria-hidden="true">
      <div className="marquee-marks">
        <span className="reg-mark" />
        <span className="reg-mark" />
      </div>
      <div ref={trackRef} className="marquee-track">
        {content}
      </div>
    </div>
  )
}
