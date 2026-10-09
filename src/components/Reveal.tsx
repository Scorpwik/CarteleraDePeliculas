import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { armVisibilitySafety, forceVisible } from '../lib/motionSafety'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

gsap.registerPlugin(ScrollTrigger)

interface RevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: 'div' | 'li' | 'section' | 'article'
  style?: CSSProperties
  'data-num'?: string
  'data-col'?: string
  'data-flip-id'?: string
  clipReveal?: boolean
}

export function Reveal({
  children,
  className = '',
  delayMs = 0,
  as: Tag = 'div',
  style,
  'data-num': dataNum,
  'data-col': dataCol,
  'data-flip-id': dataFlipId,
  clipReveal = false,
}: RevealProps) {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      if (reduce) {
        forceVisible(el)
        return
      }

      const clearSafety = armVisibilitySafety(el)
      const tween = clipReveal
        ? gsap.fromTo(
            el,
            { clipPath: 'inset(0 0 100% 0)' },
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.85,
              delay: delayMs / 1000,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                once: true,
              },
            },
          )
        : gsap.from(el, {
            opacity: 0,
            y: 16,
            duration: 0.7,
            delay: delayMs / 1000,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              once: true,
            },
          })

      return () => {
        clearSafety()
        tween.scrollTrigger?.kill()
        tween.kill()
        forceVisible(el)
      }
    },
    {
      scope: ref,
      dependencies: [reduce, delayMs, clipReveal],
      revertOnUpdate: true,
    },
  )

  return (
    <Tag
      ref={ref as never}
      className={`reveal${clipReveal ? ' reveal-clip' : ''} ${className}`.trim()}
      data-num={dataNum}
      data-col={dataCol}
      data-flip-id={dataFlipId}
      style={style}
    >
      {children}
    </Tag>
  )
}

interface TituloLineasProps {
  texto: string
  className?: string
}

/** Split title into words with masked reveal; line breaks only between words. */
export function TituloLineas({ texto, className = '' }: TituloLineasProps) {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const words = texto.trim().split(/\s+/).filter(Boolean)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const inners = el.querySelectorAll('.titulo-linea-inner')

      if (reduce) {
        forceVisible(el)
        return
      }

      const clearSafety = armVisibilitySafety(el)
      const tween = gsap.from(inners, {
        yPercent: 110,
        opacity: 0,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      })

      return () => {
        clearSafety()
        tween.scrollTrigger?.kill()
        tween.kill()
        forceVisible(el)
      }
    },
    {
      scope: ref,
      dependencies: [texto, reduce],
      revertOnUpdate: true,
    },
  )

  return (
    <h1 ref={ref} className={`titulo-lineas hover-react ${className}`.trim()}>
      {words.map((w, i) => (
        <span className="titulo-word-mask" key={`${i}-${w}`}>
          <span
            className={`titulo-linea-inner${i % 2 === 1 ? ' is-serif' : ''}`}
          >
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  )
}
