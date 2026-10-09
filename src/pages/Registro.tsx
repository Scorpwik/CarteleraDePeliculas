import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Registro() {
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
      const { error: errorAuth } = await supabase.auth.signUp({
        email,
        password,
      })

      if (errorAuth) {
        setError(errorAuth.message)
        return
      }

      navigate('/', { replace: true, viewTransition: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-decor" aria-hidden="true">
        <p className="auth-decor-word">NUEVA</p>
        <p className="auth-decor-word filled">FILA</p>
        <div className="auth-decor-meta">
          <span>Cartelera personal</span>
          <span>Asiento libre · 02</span>
        </div>
        <div className="auth-decor-strip">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="auth-panel">
        <p className="eyebrow">Alta</p>
        <h1>Registro</h1>
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
              autoComplete="new-password"
              minLength={6}
            />
          </label>
          {error && <p className="error">{error}</p>}
          {cargando && <p className="mensaje-estado cinta">Creando cuenta…</p>}
          <button type="submit" className="btn-primario" disabled={cargando}>
            Registrarse
          </button>
        </form>
        <p className="auth-enlace">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" viewTransition>
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  )
}
