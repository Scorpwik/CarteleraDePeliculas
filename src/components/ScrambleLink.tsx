import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { useCanHover } from '../hooks/useCanHover'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·'

interface ScrambleLinkProps extends Omit<LinkProps, 'children'> {
  children: string
  className?: string
}

export function ScrambleLink({
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ScrambleLinkProps) {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const [display, setDisplay] = useState(children)
  const frameRef = useRef(0)
  const original = children

  function scramble() {
    if (!canHover || reduce) return
    cancelAnimationFrame(frameRef.current)
    const target = original
    let frame = 0
    const total = Math.min(12, target.length + 4)

    const run = () => {
      frame += 1
      const progress = frame / total
      setDisplay(
        target
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < progress * target.length) return target[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join(''),
      )
      if (frame < total) {
        frameRef.current = requestAnimationFrame(run)
      } else {
        setDisplay(target)
      }
    }
    frameRef.current = requestAnimationFrame(run)
  }

  function reset() {
    cancelAnimationFrame(frameRef.current)
    setDisplay(original)
  }

  function handleEnter(e: MouseEvent<HTMLAnchorElement>) {
    scramble()
    onMouseEnter?.(e)
  }

  function handleLeave(e: MouseEvent<HTMLAnchorElement>) {
    reset()
    onMouseLeave?.(e)
  }

  return (
    <Link
      {...rest}
      className={`nav-scramble ${className}`.trim()}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {display}
    </Link>
  )
}

interface ScrambleButtonProps {
  children: string
  className?: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function ScrambleButton({
  children,
  className = '',
  onClick,
  disabled,
  type = 'button',
}: ScrambleButtonProps) {
  const canHover = useCanHover()
  const reduce = usePrefersReducedMotion()
  const [display, setDisplay] = useState(children)
  const frameRef = useRef(0)

  function scramble() {
    if (!canHover || reduce || disabled) return
    cancelAnimationFrame(frameRef.current)
    let frame = 0
    const total = 10
    const run = () => {
      frame += 1
      const progress = frame / total
      setDisplay(
        children
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < progress * children.length) return children[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join(''),
      )
      if (frame < total) frameRef.current = requestAnimationFrame(run)
      else setDisplay(children)
    }
    frameRef.current = requestAnimationFrame(run)
  }

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={scramble}
      onMouseLeave={() => {
        cancelAnimationFrame(frameRef.current)
        setDisplay(children)
      }}
    >
      {display as ReactNode}
    </button>
  )
}
