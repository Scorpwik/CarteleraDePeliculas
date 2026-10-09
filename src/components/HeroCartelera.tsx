import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { ResultadoBusqueda } from '../types'
import { armVisibilitySafety, forceVisible } from '../lib/motionSafety'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { Boton } from './Boton'
import { TituloMixto } from './TextEffects'

interface HeroCarteleraProps {
  items: ResultadoBusqueda[]
  collapsed?: boolean
  resetKey?: number
}

export function HeroCartelera({
  items,
  collapsed = false,
  resetKey = 0,
}: HeroCarteleraProps) {
  const reduce = usePrefersReducedMotion()
  const slides = items.slice(0, 5)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [slideEpoch, setSlideEpoch] = useState(`${resetKey}:${slides.length}`)
  const rootRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const epoch = `${resetKey}:${slides.length}`

  if (epoch !== slideEpoch) {
    setSlideEpoch(epoch)
    setActive(0)
  }

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return
      setActive(((index % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )

  useEffect(() => {
    if (reduce || paused || collapsed || slides.length < 2) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [reduce, paused, collapsed, slides.length, active])

  useGSAP(
    () => {
      const wrap = titleRef.current
      if (!wrap) return
      const words = wrap.querySelectorAll('.hero-word-inner')

      if (reduce) {
        forceVisible(wrap)
        return
      }

      const clearSafety = armVisibilitySafety(wrap)
      const tween = gsap.fromTo(
        words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
        },
      )

      return () => {
        clearSafety()
        tween.kill()
        forceVisible(wrap)
      }
    },
    {
      scope: rootRef,
      dependencies: [active, resetKey, reduce],
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (!rootRef.current || reduce || collapsed) return
      const imgs = rootRef.current.querySelectorAll(
        '.hero-slide.is-active .hero-kenburns',
      )
      const tween = gsap.fromTo(
        imgs,
        { scale: 1.08, xPercent: -2 },
        {
          scale: 1.18,
          xPercent: 2,
          duration: 6,
          ease: 'none',
        },
      )
      return () => {
        tween.kill()
      }
    },
    {
      scope: rootRef,
      dependencies: [active, resetKey, reduce, collapsed],
      revertOnUpdate: true,
    },
  )

  if (slides.length === 0) {
    return (
      <section className={`hero-cartelera${collapsed ? ' is-collapsed' : ''}`}>
        <div className="hero-fallback">
          <TituloMixto
            as="h1"
            partes={[
              { texto: 'MI ', tipo: 'display' },
              { texto: 'Cartelera', tipo: 'serif' },
            ]}
          />
        </div>
      </section>
    )
  }

  const actual = slides[active]
  const wordList = actual.titulo.trim().split(/\s+/).filter(Boolean)

  return (
    <section
      ref={rootRef}
      className={`hero-cartelera${collapsed ? ' is-collapsed' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Estrenos en tendencia"
    >
      <div className="hero-slides" aria-live="polite">
        {slides.map((item, i) => {
          const bg = item.backdrop_url || item.poster_url
          return (
            <div
              key={`${item.tipo_contenido}-${item.tmdb_id}`}
              className={`hero-slide${i === active ? ' is-active' : ''}`}
              aria-hidden={i !== active}
            >
              {bg ? (
                <div className="hero-frame">
                  <img
                    src={bg}
                    alt=""
                    className="hero-kenburns"
                    draggable={false}
                  />
                  <img
                    src={bg}
                    alt=""
                    className="hero-glow"
                    aria-hidden="true"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="hero-frame hero-frame-empty" />
              )}
            </div>
          )
        })}
      </div>

      <div className="hero-veil" aria-hidden="true" />

      <div className="hero-copy">
        <span className="sello sello-rotate-a">EN CARTELERA</span>
        {actual.anio ? (
          <span className="sello sello-rotate-b sello-amarillo">{actual.anio}</span>
        ) : null}

        <div ref={titleRef} className="hero-title-wrap">
          <h1 className="hero-title">
            {wordList.map((word, wi) => {
              const serif = wi % 3 === 1
              return (
                <span
                  key={`${active}-${wi}-${word}`}
                  className={`hero-word${serif ? ' is-serif' : ''}`}
                >
                  <span className="hero-word-inner">{word}</span>
                  {wi < wordList.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </h1>
        </div>

        <p className="hero-meta">
          <span>{actual.tipo_contenido === 'pelicula' ? 'Película' : 'Serie'}</span>
          <span className="meta-sep">/</span>
          <span>{actual.anio ?? '—'}</span>
          <span className="meta-sep">/</span>
          <span>Tendencia #{active + 1}</span>
        </p>

        <Boton
          to={`/explorar/${actual.tipo_contenido}/${actual.tmdb_id}`}
          viewTransition
          data-cursor="VER"
        >
          Ver detalle
        </Boton>
      </div>

      <div className="hero-indicators" role="tablist" aria-label="Seleccionar título">
        {slides.map((item, i) => (
          <button
            key={`ind-${item.tmdb_id}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`hero-dot${i === active ? ' is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Mostrar ${item.titulo}`}
          />
        ))}
      </div>
    </section>
  )
}
