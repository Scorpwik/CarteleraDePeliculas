import { describe, expect, it } from 'vitest'
import {
  MOTIVO_FALLO_CONSULTA,
  MOTIVO_FALLO_TITULO,
  MOTIVO_SIN_DURACION,
  PAUSA_ENTRE_MIN,
  cabe,
  clasificarPorCabida,
  duracionConocida,
  evaluarFichaDuracion,
  mensajeFalloConsultaGeneral,
  textoSelloNoDisponible,
  tiempoDisponibleValido,
  totalSesion,
} from './sesion'

describe('tiempoDisponibleValido', () => {
  it('acepta los bordes 30 y 600', () => {
    expect(tiempoDisponibleValido(30)).toBe(true)
    expect(tiempoDisponibleValido(600)).toBe(true)
  })

  it('rechaza tiempo fuera de rango o no entero', () => {
    expect(tiempoDisponibleValido(29)).toBe(false)
    expect(tiempoDisponibleValido(601)).toBe(false)
    expect(tiempoDisponibleValido(90.5)).toBe(false)
    expect(tiempoDisponibleValido(Number.NaN)).toBe(false)
  })
})

describe('duracionConocida', () => {
  it('trata ausente, cero y negativa como desconocida', () => {
    expect(duracionConocida(null)).toBe(false)
    expect(duracionConocida(undefined)).toBe(false)
    expect(duracionConocida(0)).toBe(false)
    expect(duracionConocida(-12)).toBe(false)
  })

  it('acepta una duración positiva', () => {
    expect(duracionConocida(118)).toBe(true)
  })
})

describe('cabe', () => {
  it('una sesión que ocupa exactamente el tiempo sí cabe', () => {
    const resultado = cabe(120, [60, 50], PAUSA_ENTRE_MIN)
    expect(resultado.cabe).toBe(true)
    expect(resultado.totalMin).toBe(120)
    expect(resultado.pausasMin).toBe(10)
    expect(resultado.restanteMin).toBe(0)
    expect(resultado.motivo).toBeNull()
  })

  it('una sola película no suma pausa', () => {
    const resultado = cabe(90, [90])
    expect(resultado.cabe).toBe(true)
    expect(resultado.totalMin).toBe(90)
    expect(resultado.pausasMin).toBe(0)
    expect(totalSesion([90])).toBe(90)
  })

  it('una película sin duración no cabe y explica', () => {
    const resultado = cabe(120, [90, null])
    expect(resultado.cabe).toBe(false)
    expect(resultado.motivo).toMatch(/sin duración/i)
  })

  it('tiempo fuera del rango permitido no cabe y explica', () => {
    const bajo = cabe(29, [20])
    const alto = cabe(601, [90])
    expect(bajo.cabe).toBe(false)
    expect(alto.cabe).toBe(false)
    expect(bajo.motivo).toMatch(/30/)
    expect(alto.motivo).toMatch(/600/)
  })

  it('no cabe si la suma con pausas supera el tiempo', () => {
    const resultado = cabe(100, [60, 40])
    expect(resultado.cabe).toBe(false)
    expect(resultado.totalMin).toBe(110)
  })
})

describe('consulta de cabida (C7, C9, C10)', () => {
  it('C7: una película sin duración queda no disponible con motivo y no se agrega', () => {
    const ev = evaluarFichaDuracion({ estado: 'ok', duracion: null }, 120)
    expect(ev.duracion).toBeNull()
    expect(ev.motivo).toBe(MOTIVO_SIN_DURACION)
    expect(textoSelloNoDisponible(ev.duracion)).toBe('Sin duración')

    const { cabida, noDisponibles } = clasificarPorCabida(
      [{ titulo: 'Sin runtime', ...ev }],
      (c) => c.titulo,
    )
    expect(cabida).toHaveLength(0)
    expect(noDisponibles).toHaveLength(1)
    expect(cabe(120, [ev.duracion]).cabe).toBe(false)
    expect(cabe(120, [ev.duracion]).motivo).toMatch(/sin duración/i)
  })

  it('C7: duración 0 o no positiva se trata igual que desconocida', () => {
    const cero = evaluarFichaDuracion({ estado: 'ok', duracion: 0 }, 120)
    const negativa = evaluarFichaDuracion({ estado: 'ok', duracion: -8 }, 120)
    expect(cero.motivo).toBe(MOTIVO_SIN_DURACION)
    expect(negativa.motivo).toBe(MOTIVO_SIN_DURACION)
    expect(textoSelloNoDisponible(cero.duracion)).toBe('Sin duración')
  })

  it('C9: el fallo de un título no tumba al resto', () => {
    const corta = {
      titulo: 'Corta',
      ...evaluarFichaDuracion({ estado: 'ok', duracion: 90 }, 180),
    }
    const rota = {
      titulo: 'Rota',
      ...evaluarFichaDuracion({ estado: 'error' }, 180),
    }
    const larga = {
      titulo: 'Larga',
      ...evaluarFichaDuracion({ estado: 'ok', duracion: 240 }, 180),
    }
    const { cabida, noDisponibles } = clasificarPorCabida(
      [corta, rota, larga],
      (c) => c.titulo,
    )

    expect(cabida).toHaveLength(1)
    expect(cabida[0].titulo).toBe('Corta')
    expect(cabida[0].motivo).toBeNull()
    expect(noDisponibles).toHaveLength(2)
    expect(rota.motivo).toBe(MOTIVO_FALLO_TITULO)
    expect(noDisponibles.map((c) => c.titulo)).toEqual(['Larga', 'Rota'])
    expect(textoSelloNoDisponible(larga.duracion)).toBe('No cabe · 240 min')
    expect(textoSelloNoDisponible(rota.duracion)).toBe('Sin duración')
  })

  it('C10: un fallo general devuelve el mensaje de error y no clasifica títulos', () => {
    expect(mensajeFalloConsultaGeneral(new Error('listar falló'))).toBe(
      'listar falló',
    )
    expect(mensajeFalloConsultaGeneral('sin red')).toBe(MOTIVO_FALLO_CONSULTA)
    // Si la consulta general falla, no hay lista que clasificar.
    const vacia = clasificarPorCabida(
      [] as {
        duracion: number | null
        motivo: string | null
        titulo: string
      }[],
      (c) => c.titulo,
    )
    expect(vacia.cabida).toEqual([])
    expect(vacia.noDisponibles).toEqual([])
  })
})
