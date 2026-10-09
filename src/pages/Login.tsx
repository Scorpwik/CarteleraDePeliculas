import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthPosterWall } from '../components/AuthPosterWall'
import { Boton } from '../components/Boton'
import { RevealWords } from '../components/TextEffects'
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
      <div className="auth-visual">
        <AuthPosterWall />
        <div className="auth-visual-overlay">
          <span className="sello sello-rotate-a">EN CARTELERA</span>
          <p className="auth-giant">ENTRA</p>
        </div>
      </div>

      <div className="auth-panel papel">
        <p className="eyebrow">Acceso</p>
        <RevealWords as="h1" className="auth-titulo" immediate>
          Iniciar sesión
        </RevealWords>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className={`campo-linea${email ? ' has-value' : ''}`}>
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@correo.com"
            />
          </label>
          <label className={`campo-linea${password ? ' has-value' : ''}`}>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
              placeholder="••••••••"
            />
          </label>
          {error && <p className="error">{error}</p>}
          {cargando && <p className="mensaje-estado cinta">Proyectando…</p>}
          <Boton type="submit" disabled={cargando}>
            Entrar
          </Boton>
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
