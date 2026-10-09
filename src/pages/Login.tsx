import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { session, cargando: cargandoSesion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  if (!cargandoSesion && session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const { error: errorAuth } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (errorAuth) {
        setError(errorAuth.message)
        return
      }

      navigate('/', { replace: true, viewTransition: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-decor" aria-hidden="true">
        <p className="auth-decor-word">ENTRA</p>
        <p className="auth-decor-word filled">DA</p>
        <div className="auth-decor-meta">
          <span>Sala 01 · Función continua</span>
          <span>Ticket / no transferible</span>
        </div>
        <div className="auth-decor-strip">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="auth-panel">
        <p className="eyebrow">Acceso</p>
        <h1>Iniciar sesión</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </label>
          {error && <p className="error">{error}</p>}
          {cargando && <p className="mensaje-estado cinta">Proyectando…</p>}
          <button type="submit" className="btn-primario" disabled={cargando}>
            Entrar
          </button>
        </form>
        <p className="auth-enlace">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" viewTransition>
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  )
}
