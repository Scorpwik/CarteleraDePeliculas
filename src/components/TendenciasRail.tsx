import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { armVisibilitySafety, forceVisible } from '../lib/motionSafety'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { RevealWords } from './TextEffects'

gsap.registerPlugin(ScrollTrigger)

interface TendenciasRailProps {
  children: ReactNode
  title?: string
  ready?: boolean
}

/** Muro denso de carteles: grilla escalonada con scrub al scroll. */
export function TendenciasRail({
  children,
  title = 'Tendencias de la semana',
  ready = true,
}: TendenciasRailProps) {
  const reduce = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const muroRef = useRef<HTMLUListElement>(null)

  const refreshTriggers = useCallback(() => {
    ScrollTrigger.refresh()
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      const muro = muroRef.current
      if (!section || !muro || !ready) return

      const slots = muro.querySelectorAll<HTMLElement>('.tendencia-slot')
      if (slots.length === 0) return

      if (reduce) {
        forceVisible(section)
        slots.forEach((s) => forceVisible(s))
        return
      }

      const clearFns = [
        armVisibilitySafety(section),
        ...Array.from(slots).map((s) => armVisibilitySafety(s)),
      ]

      const tweens: gsap.core.Tween[] = []
      const cols =
        window.matchMedia('(max-width: 760px)').matches
          ? 2
          : window.matchMedia('(max-width: 1100px)').matches
            ? 3
            : 4

      slots.forEach((slot, i) => {
        const col = i % cols
        const fromLeft = col < cols / 2
        const tilt = col % 2 === 0 ? -0.8 : 0.8
        const card = slot.querySelector('.tendencia-slot-card')
        const rank = slot.querySelector('.tendencia-rank')

        const cardTween = gsap.fromTo(
          card || slot,
          {
            x: fromLeft ? -36 : 36,
            y: 28,
            rotate: tilt * 2,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: tilt,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: slot,
              start: 'top 92%',
              end: 'top 55%',
              scrub: 0.7,
            },
          },
        )
        tweens.push(cardTween)

        if (rank) {
          const rankTween = gsap.fromTo(
            rank,
            { scale: 1.4, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: slot,
                start: 'top 90%',
                end: 'top 58%',
                scrub: true,
              },
            },
          )
          tweens.push(rankTween)
        }
      })

      const id = window.requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        clearFns.forEach((fn) => fn())
        window.cancelAnimationFrame(id)
        tweens.forEach((t) => {
          t.scrollTrigger?.kill()
          t.kill()
        })
        slots.forEach((s) => forceVisible(s))
      }
    },
    {
      scope: sectionRef,
      dependencies: [reduce, ready],
      revertOnUpdate: true,
    },
  )

  useEffect(() => {
    if (!ready || !muroRef.current) return
    const muro = muroRef.current
    const imgs = Array.from(muro.querySelectorAll('img'))
    let pending = imgs.filter((img) => !img.complete).length
    if (pending === 0) refreshTriggers()

    const onDone = () => {
      pending -= 1
      if (pending <= 0) refreshTriggers()
    }

    imgs.forEach((img) => {
      if (img.complete) return
      img.addEventListener('load', onDone)
      img.addEventListener('error', onDone)
    })

    const ro = new ResizeObserver(() => refreshTriggers())
    ro.observe(muro)

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener('load', onDone)
        img.removeEventListener('error', onDone)
      })
      ro.disconnect()
    }
  }, [ready, children, refreshTriggers])

  return (
    <section
      ref={sectionRef}
      className="seccion-tendencias papel is-muro-carteles"
      aria-labelledby="titulo-tendencias"
    >
      <div className="tendencias-pin">
        <div className="seccion-tendencias-cabecera">
          <p className="eyebrow">Esta semana</p>
          <div className="tendencias-titulo-row">
            <RevealWords
              as="h2"
              className="titulo-tendencias"
              id="titulo-tendencias"
            >
              {title}
            </RevealWords>
            <span className="sello sello-rotate-c sello-nuevo">NUEVO</span>
          </div>
          <p className="tendencias-hint">Muro de carteles · top 20</p>
        </div>

        <ul ref={muroRef} className="tendencias-muro">
          {children}
        </ul>
      </div>
    </section>
  )
}

interface TendenciaSlotProps {
  rank: number
  children: ReactNode
}

export function TendenciaSlot({ rank, children }: TendenciaSlotProps) {
  const tilt = rank % 2 === 1 ? 'is-tilt-a' : 'is-tilt-b'
  const padded = String(rank).padStart(2, '0')

  return (
    <li className={`tendencia-slot ${tilt}`}>
      <span className="tendencia-rank" aria-hidden="true">
        {padded}
      </span>
      <div className="tendencia-slot-card">{children}</div>
      <span className="tendencia-tape" aria-hidden="true" />
    </li>
  )
}
