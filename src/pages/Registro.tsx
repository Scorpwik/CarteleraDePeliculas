import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthPosterWall } from '../components/AuthPosterWall'
import { Boton } from '../components/Boton'
import { RevealWords } from '../components/TextEffects'
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
      <div className="auth-visual">
        <AuthPosterWall />
        <div className="auth-visual-overlay">
          <span className="sello sello-rotate-b sello-nuevo">NUEVO</span>
          <p className="auth-giant">ALTA</p>
        </div>
      </div>

      <div className="auth-panel papel">
        <p className="eyebrow">Registro</p>
        <RevealWords as="h1">Crear cuenta</RevealWords>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className={`campo-linea${email ? ' has-value' : ''}`}>
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className={`campo-linea${password ? ' has-value' : ''}`}>
            <span>Contraseña</span>
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
          <Boton type="submit" disabled={cargando}>
            Registrarse
          </Boton>
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
