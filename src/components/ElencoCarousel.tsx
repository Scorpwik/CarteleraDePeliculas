import { useEffect, useRef } from 'react'
import type { CreditoElenco } from '../types'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

interface ElencoCarouselProps {
  elenco: CreditoElenco[]
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function ElencoCarousel({ elenco }: ElencoCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const xRef = useRef(0)
  const velRef = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastT = useRef(0)
  const reduce = usePrefersReducedMotion()
  const canHover = useCanHover()

  useEffect(() => {
    const track = trackRef.current
    if (!track || reduce) return

    let frame = 0

    const clamp = () => {
      const max = Math.max(0, track.scrollWidth - track.parentElement!.clientWidth)
      xRef.current = Math.min(0, Math.max(-max, xRef.current))
    }

    const apply = () => {
      track.style.transform = `translate3d(${xRef.current}px, 0, 0)`
    }

    const inertia = () => {
      if (dragging.current) return
      xRef.current += velRef.current
      velRef.current *= 0.92
      clamp()
      apply()
      if (Math.abs(velRef.current) > 0.15) {
        frame = requestAnimationFrame(inertia)
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true
      lastX.current = e.clientX
      lastT.current = performance.now()
      velRef.current = 0
      track.setPointerCapture(e.pointerId)
      track.classList.add('is-dragging')
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const now = performance.now()
      const dx = e.clientX - lastX.current
      const dt = Math.max(1, now - lastT.current)
      xRef.current += dx
      velRef.current = (dx / dt) * 16
      lastX.current = e.clientX
      lastT.current = now
      clamp()
      apply()
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      track.releasePointerCapture(e.pointerId)
      track.classList.remove('is-dragging')
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(inertia)
    }

    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)

    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', onPointerUp)
      track.removeEventListener('pointercancel', onPointerUp)
    }
  }, [elenco, reduce])

  if (elenco.length === 0) {
    return <p className="mensaje-estado">Sin información de elenco.</p>
  }

  return (
    <div className="elenco-carousel" aria-label="Elenco">
      <ul ref={trackRef} className="elenco-track">
        {elenco.map((c) => (
          <li key={`${c.nombre}-${c.personaje}`} className="elenco-card">
            <div className="elenco-foto-wrap">
              {c.foto_url ? (
                <img
                  src={c.foto_url}
                  alt=""
                  className={`elenco-foto${canHover ? ' has-color-hover' : ''}`}
                  draggable={false}
                />
              ) : (
                <div className="elenco-iniciales" aria-hidden="true">
                  {iniciales(c.nombre)}
                </div>
              )}
            </div>
            <strong>{c.nombre}</strong>
            <span>{c.personaje || '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
