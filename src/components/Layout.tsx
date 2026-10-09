import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { session, cerrarSesion } = useAuth()
  const [cerrando, setCerrando] = useState(false)
  const [errorCierre, setErrorCierre] = useState<string | null>(null)

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

  return (
    <div className="app-shell">
      <header className="barra-superior">
        <nav className="nav-principal">
          <Link to="/" className="marca">
            Mi Cartelera
          </Link>
          {session && (
            <>
              <Link to="/">Buscar</Link>
              <Link to="/mi-lista">Mi lista</Link>
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
    </div>
  )
}
