import { useEffect, useRef, useState, type RefObject } from 'react'

interface UseInViewOptions {
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  const { rootMargin = '0px 0px -8% 0px', threshold = 0.12, once = true } =
    options
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return [ref, visible]
}
