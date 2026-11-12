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

export const MOTIVO_SIN_DURACION = 'TMDB no tiene duración para este título.'
export const MOTIVO_FALLO_TITULO = 'No se pudo consultar la duración en TMDB.'
export const MOTIVO_FALLO_CONSULTA = 'No se pudieron consultar las duraciones.'

export type FichaDuracion =
  { estado: 'ok'; duracion: number | null } | { estado: 'error' }

export interface ResultadoFicha {
  duracion: number | null
  motivo: string | null
}

export function evaluarFichaDuracion(
  ficha: FichaDuracion,
  minutos: number,
): ResultadoFicha {
  if (ficha.estado === 'error') {
    return { duracion: null, motivo: MOTIVO_FALLO_TITULO }
  }
  if (!duracionConocida(ficha.duracion)) {
    return { duracion: null, motivo: MOTIVO_SIN_DURACION }
  }
  if (ficha.duracion > minutos) {
    return {
      duracion: ficha.duracion,
      motivo: `Dura ${ficha.duracion} min: no cabe en ${minutos} min.`,
    }
  }
  return { duracion: ficha.duracion, motivo: null }
}

export function textoSelloNoDisponible(duracion: number | null): string {
  if (duracionConocida(duracion)) return `No cabe · ${duracion} min`
  return 'Sin duración'
}

export function compararPorCabida(
  a: { duracion: number | null; titulo: string },
  b: { duracion: number | null; titulo: string },
): number {
  const da = a.duracion ?? Number.POSITIVE_INFINITY
  const db = b.duracion ?? Number.POSITIVE_INFINITY
  if (da !== db) return da - db
  return a.titulo.localeCompare(b.titulo, 'es')
}

export function clasificarPorCabida<
  T extends { duracion: number | null; motivo: string | null },
>(
  evaluadas: readonly T[],
  tituloDe: (item: T) => string,
): { cabida: T[]; noDisponibles: T[] } {
  const porTitulo = (x: T, y: T) =>
    compararPorCabida(
      { duracion: x.duracion, titulo: tituloDe(x) },
      { duracion: y.duracion, titulo: tituloDe(y) },
    )
  return {
    cabida: evaluadas
      .filter((c) => c.motivo === null && duracionConocida(c.duracion))
      .slice()
      .sort(porTitulo),
    noDisponibles: evaluadas
      .filter((c) => c.motivo !== null)
      .slice()
      .sort(porTitulo),
  }
}

export function mensajeFalloConsultaGeneral(error: unknown): string {
  return error instanceof Error ? error.message : MOTIVO_FALLO_CONSULTA
}
