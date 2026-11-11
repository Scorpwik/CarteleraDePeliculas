/** Traduce errores técnicos de Auth/red a mensajes legibles para la UI. */
export function mensajeErrorAuth(
  mensaje: string | null | undefined,
  respaldo = 'No se pudo completar la operación. Inténtalo de nuevo.',
): string {
  const texto = (mensaje ?? '').trim()
  if (!texto) return respaldo

  const lower = texto.toLowerCase()

  if (
    lower === 'failed to fetch' ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('fetch failed')
  ) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
  }

  if (lower.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  if (lower.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.'
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered')
  ) {
    return 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.'
  }

  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (lower.includes('unable to validate email') || lower.includes('invalid email')) {
    return 'El correo no es válido.'
  }

  // Evitar filtrar jerga técnica al cliente
  if (/^[A-Za-z]+Error:/.test(texto) || lower.includes('exception')) {
    return respaldo
  }

  return texto
}
