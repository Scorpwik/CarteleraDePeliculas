interface EstrellasProps {
  valor: number | null
  onChange?: (valor: number) => void
  editable?: boolean
}

export function Estrellas({ valor, onChange, editable = false }: EstrellasProps) {
  const actual = valor ?? 0

  return (
    <div
      className={`estrellas ${editable ? 'estrellas-editables' : ''}`}
      role={editable ? 'radiogroup' : 'img'}
      aria-label={`Calificación: ${actual} de 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`estrella ${n <= actual ? 'activa' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            if (editable && onChange) onChange(n)
          }}
          disabled={!editable}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          aria-checked={editable ? n === actual : undefined}
          role={editable ? 'radio' : undefined}
        >
          ★
        </button>
      ))}
    </div>
  )
}
