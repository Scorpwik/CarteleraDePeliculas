import { useEffect, useRef, useState } from 'react'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

type CursorMode = 'default' | 'grown' | 'precise'

export function CustomCursor() {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState<CursorMode>('default')
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
        setMode('default')
        setLabel('')
        return
      }

      const precise = target.closest(
        '.estrella, .estrellas, select, input, textarea, label, .campo-linea, .campo-inline',
      )
      if (precise) {
        setMode('precise')
        setLabel('')
        return
      }

      const interactive = target.closest(
        'a, button, [role="link"], [role="tab"], [data-cursor]',
      )
      if (!interactive) {
        setMode('default')
        setLabel('')
        return
      }

      setMode('grown')
      setLabel(interactive.getAttribute('data-cursor') ?? '')
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
      className={`cursor-dot is-${mode}${hidden ? ' is-hidden' : ''}${label ? ' has-label' : ''}`}
      aria-hidden="true"
    >
      <span className="cursor-core" />
      {label ? <span className="cursor-label">{label}</span> : null}
    </div>
  )
}
