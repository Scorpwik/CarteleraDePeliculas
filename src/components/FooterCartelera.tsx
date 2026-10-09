import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { Boton } from './Boton'
import { MarqueeScroll } from './MarqueeScroll'
import { getLenis } from '../lib/lenisStore'

export function FooterCartelera() {
  const reduce = usePrefersReducedMotion()
  const btnWrapRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduce || !btnWrapRef.current) return
      const tween = gsap.to(btnWrapRef.current, {
        y: -4,
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
      return () => {
        tween.kill()
        gsap.set(btnWrapRef.current, { clearProps: 'transform' })
      }
    },
    { dependencies: [reduce], revertOnUpdate: true },
  )

  function scrollTop() {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: reduce })
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="footer-cartelera full-bleed">
      <MarqueeScroll className="footer-marquee" />
      <div className="footer-inner">
        <p className="footer-brand">
          MI <em>CARTELERA</em>
        </p>
        <div ref={btnWrapRef}>
          <Boton type="button" className="footer-arriba" onClick={scrollTop}>
            Volver arriba
          </Boton>
        </div>
        <p className="footer-tmdb">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </footer>
  )
}
