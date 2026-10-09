import {
  useRef,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

interface TarjetaTituloProps {
  indice?: number
  titulo: string
  posterUrl: string | null
  meta: string
  anio?: string | null
  estadoSello?: string | null
  viewTransitionName?: string
  to?: string
  onActivate?: () => void
  className?: string
  delayMs?: number
  accion: ReactNode
  ariaLabel?: string
  dataFlipId?: string
  as?: 'li' | 'div' | 'article'
  clipReveal?: boolean
}

export function TarjetaTitulo({
  titulo,
  posterUrl,
  meta,
  anio,
  estadoSello,
  viewTransitionName,
  to,
  onActivate,
  className = '',
  delayMs = 0,
  accion,
  ariaLabel,
  dataFlipId,
  as = 'li',
  clipReveal = true,
}: TarjetaTituloProps) {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLSpanElement>(null)
  const esActivable = Boolean(onActivate) && !to
  const anioSello = anio ?? (meta.match(/^\d{4}$/) ? meta : null)

  function handleKeyDown(e: KeyboardEvent) {
    if (!esActivable || !onActivate) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }

  function onMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!canHover || reduce || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 16
    const ry = (x - 0.5) * 16
    cardRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    if (shineRef.current) {
      shineRef.current.style.opacity = '1'
      shineRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 45%)`
    }
  }

  function onLeave() {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'
    if (shineRef.current) shineRef.current.style.opacity = '0'
  }

  const posterInner = posterUrl ? (
    <img
      src={posterUrl}
      alt=""
      className="poster"
      style={
        viewTransitionName
          ? { viewTransitionName }
          : undefined
      }
    />
  ) : (
    <div
      className="poster poster-vacio"
      aria-hidden="true"
      style={
        viewTransitionName
          ? { viewTransitionName }
          : undefined
      }
    >
      Sin póster
    </div>
  )

  return (
    <Reveal
      as={as}
      className={`tarjeta-titulo ${className}`.trim()}
      delayMs={delayMs}
      clipReveal={clipReveal}
      style={dataFlipId ? { ['--flip-id' as string]: dataFlipId } : undefined}
      data-flip-id={dataFlipId}
    >
      <div
        ref={cardRef}
        className={`tarjeta-titulo-inner${esActivable ? ' tarjeta-titulo-hit' : ''}${canHover && !reduce ? ' has-tilt' : ''}`}
        onClick={esActivable ? onActivate : undefined}
        onKeyDown={esActivable ? handleKeyDown : undefined}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        role={esActivable ? 'link' : undefined}
        tabIndex={esActivable ? 0 : undefined}
        aria-label={esActivable ? (ariaLabel ?? `Ver detalle de ${titulo}`) : undefined}
      >
        <div className="poster-wrap">
          {to ? (
            <Link
              to={to}
              className="enlace-poster"
              viewTransition
              aria-label={`Ver detalle de ${titulo}`}
              data-cursor="VER"
            >
              {posterInner}
            </Link>
          ) : (
            <div data-cursor="VER">{posterInner}</div>
          )}
          <span ref={shineRef} className="poster-shine" aria-hidden="true" />
          {estadoSello ? (
            <span className="sello sello-estado" aria-hidden="true">
              {estadoSello}
            </span>
          ) : anioSello ? (
            <span className="sello sello-anio" aria-hidden="true">
              {anioSello}
            </span>
          ) : null}
        </div>

        <div className="tarjeta-titulo-body">
          <h2 className="titulo-resultado hover-react">
            {to ? (
              <Link to={to} className="enlace-titulo" viewTransition>
                {titulo}
              </Link>
            ) : (
              titulo
            )}
          </h2>
          <p className="tarjeta-titulo-meta">{meta}</p>
          <div
            className="tarjeta-titulo-accion"
            onClick={esActivable ? (e) => e.stopPropagation() : undefined}
          >
            {accion}
          </div>
        </div>
      </div>
    </Reveal>
  )
}
