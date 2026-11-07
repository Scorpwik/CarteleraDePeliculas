export const PAUSA_ENTRE_MIN = 10
export const TIEMPO_MIN_PERMITIDO = 30
export const TIEMPO_MAX_PERMITIDO = 600

export interface ResultadoCabe {
  cabe: boolean
  totalMin: number
  pausasMin: number
  restanteMin: number
  motivo: string | null
}

export function tiempoDisponibleValido(minutos: number): boolean {
  return (
    Number.isInteger(minutos) &&
    minutos >= TIEMPO_MIN_PERMITIDO &&
    minutos <= TIEMPO_MAX_PERMITIDO
  )
}

export function duracionConocida(
  valor: number | null | undefined,
): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0
}

export function totalSesion(
  duraciones: readonly number[],
  pausaMin = PAUSA_ENTRE_MIN,
): number {
  if (duraciones.length === 0) return 0
  const suma = duraciones.reduce((acc, d) => acc + d, 0)
  const pausas = Math.max(0, duraciones.length - 1) * pausaMin
  return suma + pausas
}

export function cabe(
  tiempo: number,
  duraciones: readonly (number | null | undefined)[],
  pausaMin = PAUSA_ENTRE_MIN,
): ResultadoCabe {
  if (!tiempoDisponibleValido(tiempo)) {
    return {
      cabe: false,
      totalMin: 0,
      pausasMin: 0,
      restanteMin: 0,
      motivo: `El tiempo debe ser un entero entre ${TIEMPO_MIN_PERMITIDO} y ${TIEMPO_MAX_PERMITIDO} minutos.`,
    }
  }

  if (duraciones.some((d) => !duracionConocida(d))) {
    return {
      cabe: false,
      totalMin: 0,
      pausasMin: 0,
      restanteMin: 0,
      motivo: 'Hay una película sin duración conocida.',
    }
  }

  const conocidas = duraciones.filter(duracionConocida)
  const pausasMin = Math.max(0, conocidas.length - 1) * pausaMin
  const totalMin = totalSesion(conocidas, pausaMin)
  const restanteMin = tiempo - totalMin

  if (totalMin > tiempo) {
    return {
      cabe: false,
      totalMin,
      pausasMin,
      restanteMin,
      motivo: 'La suma de duraciones y pausas supera el tiempo disponible.',
    }
  }

  return {
    cabe: true,
    totalMin,
    pausasMin,
    restanteMin,
    motivo: null,
  }
}
