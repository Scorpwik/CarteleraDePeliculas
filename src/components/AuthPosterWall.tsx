import { useEffect, useRef, useState } from 'react'
import { getTendencias } from '../lib/tmdb'
import type { ResultadoBusqueda } from '../types'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { useParallaxOffset } from '../hooks/useParallaxOffset'

export function AuthPosterWall() {
  const [items, setItems] = useState<ResultadoBusqueda[]>([])
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
    const base = posters.filter((_, i) => i % 3 === col)
    return base.concat(base)
  })

  return (
    <div ref={wallRef} className="auth-poster-wall" aria-hidden="true">
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
          {colPosters.map((src, i) => (
            <img key={`${col}-${i}`} src={src} alt="" />
          ))}
        </div>
      ))}
    </div>
  )
}
