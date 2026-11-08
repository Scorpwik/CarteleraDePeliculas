import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastTipo = 'ok' | 'error'

interface ToastProps {
  mensaje: string | null
  tipo?: ToastTipo
  onCerrar: () => void
}

export function Toast({ mensaje, tipo = 'ok', onCerrar }: ToastProps) {
  useEffect(() => {
    if (!mensaje) return
    const id = window.setTimeout(onCerrar, tipo === 'error' ? 5200 : 2800)
    return () => window.clearTimeout(id)
  }, [mensaje, tipo, onCerrar])

  if (!mensaje) return null

  return createPortal(
    <div
      className={`toast toast-${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
      aria-live={tipo === 'error' ? 'assertive' : 'polite'}
    >
      <p className="toast-texto">{mensaje}</p>
      <button
        type="button"
        className="toast-cerrar"
        onClick={onCerrar}
        aria-label="Cerrar aviso"
      >
        ×
      </button>
    </div>,
    document.body,
  )
}
