import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { getLenis, setLenis } from '../lib/lenisStore'

gsap.registerPlugin(ScrollTrigger)

let lenisOwners = 0
let tickerFn: ((time: number) => void) | null = null

interface LenisRootProps {
  children: ReactNode
}

export function LenisRoot({ children }: LenisRootProps) {
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    if (reduce) {
      document.documentElement.classList.add('reduce-motion')
      return
    }

    document.documentElement.classList.remove('reduce-motion')
    lenisOwners += 1

    if (!getLenis()) {
      const lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        touchMultiplier: 1.2,
      })
      setLenis(lenis)
      lenis.on('scroll', ScrollTrigger.update)

      tickerFn = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)
    }

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      lenisOwners -= 1
      if (lenisOwners <= 0) {
        if (tickerFn) {
          gsap.ticker.remove(tickerFn)
          tickerFn = null
        }
        getLenis()?.destroy()
        setLenis(null)
        lenisOwners = 0
      }
    }
  }, [reduce])

  return children
}
