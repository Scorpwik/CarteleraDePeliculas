import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useScrollProgress } from '../hooks/useScrollProgress'

export function Layout() {
  const { session, cerrarSesion } = useAuth()
  const [cerrando, setCerrando] = useState(false)
  const [errorCierre, setErrorCierre] = useState<string | null>(null)
  const { progress, y } = useScrollProgress()
  const solida = y > 28
  const mostrarArriba = y > 420

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--scroll-progress',
      String(progress),
    )
  }, [progress])

  async function handleCerrarSesion() {
    setErrorCierre(null)
    setCerrando(true)
    try {
      await cerrarSesion()
    } catch (err) {
      setErrorCierre(
        err instanceof Error ? err.message : 'No se pudo cerrar la sesión',
      )
      setCerrando(false)
    }
  }

  function volverArriba() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className="app-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <header
        className={`barra-superior${solida ? ' solida compacta' : ' transparente'}`}
      >
        <nav className="nav-principal">
          <Link to="/" className="marca" viewTransition>
            Mi Cartelera<span>.</span>
          </Link>
          {session && (
            <>
              <Link to="/" viewTransition>
                Buscar
              </Link>
              <Link to="/mi-lista" viewTransition>
                Mi lista
              </Link>
            </>
          )}
        </nav>
        {session && (
          <button
            type="button"
            className="btn-secundario"
            onClick={handleCerrarSesion}
            disabled={cerrando}
          >
            {cerrando ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        )}
      </header>

      {errorCierre && <p className="error banner-error">{errorCierre}</p>}

      <main className="contenido">
        <Outlet />
      </main>

      <button
        type="button"
        className={`btn-arriba${mostrarArriba ? ' visible' : ''}`}
        onClick={volverArriba}
        aria-label="Volver arriba"
      >
        ↑
      </button>
    </div>
  )
}
