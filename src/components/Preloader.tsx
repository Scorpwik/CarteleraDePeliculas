import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

const SESSION_KEY = 'cartelera-preloader-done'

function shouldShowPreloader(reduce: boolean): boolean {
  if (reduce) return false
  if (typeof sessionStorage === 'undefined') return false
  return !sessionStorage.getItem(SESSION_KEY)
}

export function Preloader() {
  const reduce = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => shouldShowPreloader(false))
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)

  if (reduce && visible) {
    setVisible(false)
  }

  useEffect(() => {
    if (reduce || !visible) return

    const start = performance.now()
    const duration = 1000
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setCount(Math.round(t * 100))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        window.setTimeout(() => {
          sessionStorage.setItem(SESSION_KEY, '1')
          setVisible(false)
        }, 420)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce, visible])

  if (!visible) return null

  return (
    <div className={`preloader${leaving ? ' preloader-leave' : ''}`}>
      <div className="preloader-curtain" aria-hidden="true" />
      <div className="preloader-inner">
        <p className="preloader-label">Proyectando</p>
        <p className="preloader-count">{count}</p>
      </div>
    </div>
  )
}
