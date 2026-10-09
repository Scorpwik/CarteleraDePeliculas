import { useEffect, useRef, useState } from 'react'
import { getTendencias } from '../lib/tmdb'
import type { ResultadoBusqueda } from '../types'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { useParallaxOffset } from '../hooks/useParallaxOffset'

const FALLBACK_TILES = 18

export function AuthPosterWall() {
  const [items, setItems] = useState<ResultadoBusqueda[]>([])
  const [cargado, setCargado] = useState(false)
  const reduce = usePrefersReducedMotion()
  const wallRef = useRef<HTMLDivElement>(null)
  const up = useParallaxOffset(wallRef, 0.08)
  const down = useParallaxOffset(wallRef, -0.06)

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const data = await getTendencias()
        if (activo) setItems(data)
      } catch {
        if (activo) setItems([])
      } finally {
        if (activo) setCargado(true)
      }
    })()
    return () => {
      activo = false
    }
  }, [])

  const posters = items
    .map((i) => i.poster_url)
    .filter((u): u is string => Boolean(u))

  const cols = [0, 1, 2].map((col) => {
    if (posters.length === 0) {
      return Array.from({ length: FALLBACK_TILES / 3 }, (_, i) => `fallback-${col}-${i}`)
    }
    const base = posters.filter((_, i) => i % 3 === col)
    const filled = base.length > 0 ? base : posters
    return filled.concat(filled)
  })

  return (
    <div
      ref={wallRef}
      className={`auth-poster-wall${cargado && posters.length === 0 ? ' is-fallback' : ''}${cargado ? ' is-ready' : ''}`}
      aria-hidden="true"
    >
      {cols.map((colPosters, col) => (
        <div
          key={col}
          className="auth-poster-col"
          style={
            reduce
              ? undefined
              : {
                  transform: `translate3d(0, ${col % 2 === 0 ? up : down}px, 0)`,
                }
          }
        >
          {colPosters.map((src, i) =>
            src.startsWith('fallback-') ? (
              <div
                key={`${col}-${i}`}
                className={`auth-poster-fallback tile-${(col + i) % 4}`}
              />
            ) : (
              <img key={`${col}-${i}`} src={src} alt="" />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
