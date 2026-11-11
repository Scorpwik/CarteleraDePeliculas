import { describe, expect, it } from 'vitest'
import { mensajeErrorAuth } from './mensajesAuth'

describe('mensajeErrorAuth', () => {
  it('no muestra Failed to fetch al cliente', () => {
    expect(mensajeErrorAuth('Failed to fetch')).toBe(
      'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    )
  })

  it('traduce credenciales inválidas', () => {
    expect(mensajeErrorAuth('Invalid login credentials')).toBe(
      'Correo o contraseña incorrectos.',
    )
  })

  it('usa el respaldo si el mensaje viene vacío', () => {
    expect(mensajeErrorAuth('')).toBe(
      'No se pudo completar la operación. Inténtalo de nuevo.',
    )
  })

  it('deja pasar mensajes ya en español', () => {
    expect(mensajeErrorAuth('Este título ya está en tu lista')).toBe(
      'Este título ya está en tu lista',
    )
  })
})
