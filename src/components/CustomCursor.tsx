import { useEffect, useRef, useState } from 'react'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

export function CustomCursor() {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [grown, setGrown] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!canHover || reduce) return

    document.documentElement.classList.add('has-custom-cursor')

    const onMove = (e: MouseEvent) => {
      const el = dotRef.current
      if (!el) return
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }

    const updateTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setGrown(false)
        setLabel('')
        return
      }
      const interactive = target.closest(
        'a, button, input, select, textarea, [role="link"], [data-cursor]',
      )
      if (!interactive) {
        setGrown(false)
        setLabel('')
        return
      }
      setGrown(true)
      const custom = interactive.getAttribute('data-cursor')
      setLabel(custom ?? '')
    }

    const onOver = (e: MouseEvent) => updateTarget(e.target)
    const onLeave = () => setHidden(true)
    const onEnter = () => setHidden(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [canHover, reduce])

  if (!canHover || reduce) return null

  return (
    <div
      ref={dotRef}
      className={`cursor-dot${grown ? ' is-grown' : ''}${hidden ? ' is-hidden' : ''}${label ? ' has-label' : ''}`}
      aria-hidden="true"
    >
      {label ? <span className="cursor-label">{label}</span> : null}
    </div>
  )
}
