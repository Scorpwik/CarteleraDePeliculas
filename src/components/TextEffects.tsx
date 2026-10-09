import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { armVisibilitySafety, forceVisible } from '../lib/motionSafety'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

gsap.registerPlugin(ScrollTrigger)

interface ParteTitulo {
  texto: string
  tipo: 'display' | 'serif'
}

interface TituloMixtoProps {
  partes: ParteTitulo[]
  as?: 'h1' | 'h2'
  className?: string
}

export function TituloMixto({
  partes,
  as: Tag = 'h1',
  className = '',
}: TituloMixtoProps) {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const inners = el.querySelectorAll('.tm-inner')
      if (reduce) {
        forceVisible(el)
        return
      }
      const clearSafety = armVisibilitySafety(el)
      const tween = gsap.from(inners, {
        yPercent: 110,
        duration: 0.75,
        stagger: 0.08,
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
      dependencies: [partes.map((p) => p.texto).join('|'), reduce],
      revertOnUpdate: true,
    },
  )

  return (
    <Tag ref={ref} className={`titulo-mixto ${className}`.trim()}>
      {partes.map((p, i) => (
        <span key={`${i}-${p.texto}`} className={`tm-chunk tm-${p.tipo}`}>
          <span className="tm-inner">{p.texto}</span>
        </span>
      ))}
    </Tag>
  )
}

interface RevealWordsProps {
  children: string
  as?: ElementType
  className?: string
  id?: string
}

export function RevealWords({
  children,
  as: Tag = 'h2',
  className = '',
  id,
}: RevealWordsProps) {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const words = children.trim().split(/\s+/).filter(Boolean)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const inners = el.querySelectorAll('.rw-inner')
      if (reduce) {
        forceVisible(el)
        return
      }
      const clearSafety = armVisibilitySafety(el)
      const tween = gsap.from(inners, {
        yPercent: 110,
        duration: 0.7,
        stagger: 0.055,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
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
      dependencies: [children, reduce],
      revertOnUpdate: true,
    },
  )

  return (
    <Tag
      id={id}
      ref={ref as never}
      className={`reveal-words hover-react ${className}`.trim()}
    >
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          className={`rw-word${i % 4 === 2 ? ' is-serif' : ''}`}
        >
          <span className="rw-inner">{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

interface ScrollHighlightProps {
  children: string
  className?: string
}

export function ScrollHighlight({
  children,
  className = '',
}: ScrollHighlightProps) {
  const reduce = usePrefersReducedMotion()
  const rootRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const words = root.querySelectorAll('.sh-word')

      if (reduce) {
        gsap.set(words, { opacity: 1 })
        return
      }

      const clearSafety = armVisibilitySafety(root)
      gsap.set(words, { opacity: 0.28 })
      const tween = gsap.to(words, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: true,
        },
      })

      return () => {
        clearSafety()
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(words, { opacity: 1 })
      }
    },
    {
      scope: rootRef,
      dependencies: [children, reduce],
      revertOnUpdate: true,
    },
  )

  const words = children.trim().split(/\s+/).filter(Boolean)

  return (
    <p ref={rootRef} className={`scroll-highlight ${className}`.trim()}>
      {words.map((w, i) => (
        <span key={`${i}-${w}`} className="sh-word">
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

interface ImageRevealProps {
  src: string | null
  alt?: string
  className?: string
  viewTransitionName?: string
  glow?: boolean
  children?: ReactNode
}

export function ImageReveal({
  src,
  alt = '',
  className = '',
  viewTransitionName,
  glow = false,
  children,
}: ImageRevealProps) {
  const reduce = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      if (reduce) {
        forceVisible(root)
        return
      }

      const clearSafety = armVisibilitySafety(root)
      const reveal = gsap.fromTo(
        root,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            once: true,
          },
        },
      )

      const img = root.querySelector('.img-parallax-inner')
      let parallax: gsap.core.Tween | null = null
      if (img) {
        parallax = gsap.fromTo(
          img,
          { scale: 1.15, yPercent: -4 },
          {
            scale: 1.05,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }

      return () => {
        clearSafety()
        reveal.scrollTrigger?.kill()
        reveal.kill()
        parallax?.scrollTrigger?.kill()
        parallax?.kill()
        forceVisible(root)
      }
    },
    {
      scope: rootRef,
      dependencies: [src, reduce],
      revertOnUpdate: true,
    },
  )

  return (
    <div ref={rootRef} className={`img-reveal ${className}`.trim()}>
      {glow && src ? (
        <img src={src} alt="" className="img-ambient" aria-hidden="true" />
      ) : null}
      <div className="img-parallax-frame">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="img-parallax-inner"
            style={
              viewTransitionName
                ? { viewTransitionName }
                : undefined
            }
          />
        ) : (
          <div
            className="poster-vacio"
            style={
              viewTransitionName
                ? { viewTransitionName }
                : undefined
            }
          >
            Sin póster
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
