import { describe, expect, it } from 'vitest'
import {
  PAUSA_ENTRE_MIN,
  cabe,
  duracionConocida,
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
