import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

type Variante = 'primario' | 'secundario' | 'peligro'

interface BotonShared {
  children: ReactNode
  variante?: Variante
  className?: string
  conFlecha?: boolean
}

type BotonButtonProps = BotonShared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    to?: undefined
  }

type BotonLinkProps = BotonShared &
  Omit<LinkProps, 'children' | 'className'> & {
    to: LinkProps['to']
    disabled?: boolean
  }

export type BotonProps = BotonButtonProps | BotonLinkProps

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M3 8h9M8 3l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M6 3H3v10h3M9 8h6M12 5l3 3-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function labelText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  return ''
}

function useMagnetic<T extends HTMLElement>() {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const localRef = useRef<T | null>(null)

  function onMove(e: ReactMouseEvent<HTMLElement>) {
    const el = localRef.current
    if (!canHover || reduce || !el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const max = 8
    el.style.setProperty('--btn-mx', `${Math.max(-max, Math.min(max, x * 0.25))}px`)
    el.style.setProperty('--btn-my', `${Math.max(-max, Math.min(max, y * 0.25))}px`)
  }

  function onLeave() {
    const el = localRef.current
    if (!el) return
    el.style.setProperty('--btn-mx', '0px')
    el.style.setProperty('--btn-my', '0px')
  }

  return { localRef, onMove, onLeave }
}

function BotonInner({
  children,
  conFlecha,
}: {
  children: ReactNode
  conFlecha?: boolean
}) {
  const text = labelText(children)
  return (
    <>
      <span className="btn-fill" aria-hidden="true" />
      <span className="btn-content">
        {text ? (
          <span className="btn-roll" data-text={text}>
            <span className="btn-roll-inner">{text}</span>
          </span>
        ) : (
          <span className="btn-roll-inner">{children}</span>
        )}
        {conFlecha ? (
          <span className="btn-arrow" aria-hidden="true">
            <ArrowIcon />
          </span>
        ) : null}
      </span>
    </>
  )
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(
  function Boton(props, ref) {
    const {
      children,
      variante = 'primario',
      className = '',
      conFlecha = variante === 'primario',
      ...rest
    } = props
    const { localRef, onMove, onLeave } = useMagnetic<HTMLButtonElement>()
    const cls =
      `btn btn-${variante}${conFlecha ? ' has-arrow' : ''} ${className}`.trim()
    const magStyle = { '--btn-mx': '0px', '--btn-my': '0px' } as CSSProperties

    if ('to' in props && props.to != null) {
      const linkProps = rest as BotonLinkProps
      const { to, viewTransition, disabled, onClick, onMouseLeave, ...linkRest } =
        linkProps
      return (
        <Link
          {...linkRest}
          to={to}
          viewTransition={viewTransition}
          className={`${cls}${disabled ? ' is-disabled' : ''}`}
          onMouseMove={onMove}
          onMouseLeave={(e) => {
            onLeave()
            onMouseLeave?.(e)
          }}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault()
              return
            }
            onClick?.(e)
          }}
          style={magStyle}
          aria-disabled={disabled || undefined}
          ref={(node) => {
            localRef.current = node as unknown as HTMLButtonElement
          }}
        >
          <BotonInner conFlecha={conFlecha}>{children}</BotonInner>
        </Link>
      )
    }

    const buttonRest = rest as BotonButtonProps
    return (
      <button
        {...buttonRest}
        type={buttonRest.type ?? 'button'}
        className={cls}
        ref={(node) => {
          localRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        onMouseMove={onMove}
        onMouseLeave={(e) => {
          onLeave()
          buttonRest.onMouseLeave?.(e)
        }}
        style={{ ...buttonRest.style, ...magStyle }}
      >
        <BotonInner conFlecha={conFlecha}>{children}</BotonInner>
      </button>
    )
  },
)

export function BotonSalir({
  children = 'Cerrar sesión',
  className = '',
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
  children?: ReactNode
  className?: string
}) {
  return (
    <button type="button" className={`nav-logout ${className}`.trim()} {...rest}>
      <span className="btn-roll" data-text={labelText(children) || 'Cerrar sesión'}>
        <span className="btn-roll-inner">{children}</span>
      </span>
      <span className="btn-exit-icon" aria-hidden="true">
        <ExitIcon />
      </span>
    </button>
  )
}
