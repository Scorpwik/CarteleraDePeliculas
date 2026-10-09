import { useEffect, useRef, useState } from 'react'

interface ContadorAnimadoProps {
  valor: number
  duracionMs?: number
}

export function ContadorAnimado({
  valor,
  duracionMs = 420,
}: ContadorAnimadoProps) {
  const [mostrado, setMostrado] = useState(valor)
  const anterior = useRef(valor)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || valor === anterior.current) {
      setMostrado(valor)
      anterior.current = valor
      return
    }

    const desde = anterior.current
    const delta = valor - desde
    const inicio = performance.now()
    let frame = 0

    const tick = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracionMs)
      const eased = 1 - (1 - t) ** 3
      setMostrado(Math.round(desde + delta * eased))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        anterior.current = valor
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [valor, duracionMs])

  return <span className="contador-num">{mostrado}</span>
}
