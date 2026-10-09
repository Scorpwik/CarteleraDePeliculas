import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

export function RouteCurtain() {
  const location = useLocation()
  const reduce = usePrefersReducedMotion()
  const prevPath = useRef(location.pathname)
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle')

  useEffect(() => {
    if (reduce) {
      prevPath.current = location.pathname
      return
    }
    if (prevPath.current === location.pathname) return
    prevPath.current = location.pathname

    setActive(true)
    setPhase('cover')
    const t1 = window.setTimeout(() => setPhase('reveal'), 280)
    const t2 = window.setTimeout(() => {
      setActive(false)
      setPhase('idle')
    }, 720)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [location.pathname, reduce])

  if (!active) return null

  return (
    <div
      className={`route-curtain phase-${phase}`}
      aria-hidden="true"
    />
  )
}
