import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: 'div' | 'li' | 'section' | 'article'
  style?: CSSProperties
  'data-num'?: string
  'data-col'?: string
}

export function Reveal({
  children,
  className = '',
  delayMs = 0,
  as: Tag = 'div',
  style,
  'data-num': dataNum,
  'data-col': dataCol,
}: RevealProps) {
  const [ref, visible] = useInView<HTMLElement>()

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'is-inview' : ''} ${className}`.trim()}
      data-num={dataNum}
      data-col={dataCol}
      style={{
        ...style,
        transitionDelay: delayMs ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </Tag>
  )
}

interface TituloLineasProps {
  texto: string
  className?: string
}

/** Split title into line-sized chunks for staggered line reveal. */
export function TituloLineas({ texto, className = '' }: TituloLineasProps) {
  const [ref, visible] = useInView<HTMLHeadingElement>({ threshold: 0.2 })
  const words = texto.trim().split(/\s+/).filter(Boolean)
  const lineas: string[] = []
  const porLinea = words.length > 6 ? 3 : 2

  for (let i = 0; i < words.length; i += porLinea) {
    lineas.push(words.slice(i, i + porLinea).join(' '))
  }

  if (lineas.length === 0) lineas.push(texto)

  return (
    <h1
      ref={ref}
      className={`titulo-lineas ${visible ? 'is-inview' : ''} ${className}`.trim()}
    >
      {lineas.map((linea, i) => (
        <span className="titulo-linea" key={`${i}-${linea}`}>
          <span
            className="titulo-linea-inner"
            style={{ transitionDelay: `${80 + i * 90}ms` }}
          >
            {linea}
          </span>
        </span>
      ))}
    </h1>
  )
}
