import { useEffect } from 'react'

interface ToastProps {
  mensaje: string | null
  onCerrar: () => void
}

export function Toast({ mensaje, onCerrar }: ToastProps) {
  useEffect(() => {
    if (!mensaje) return
    const id = window.setTimeout(onCerrar, 2800)
    return () => window.clearTimeout(id)
  }, [mensaje, onCerrar])

  if (!mensaje) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      {mensaje}
    </div>
  )
}
