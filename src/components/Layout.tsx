import { useEffect, useState, type MouseEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '../context/AuthContext'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { RESET_HOME_EVENT } from '../lib/events'
import { getLenis } from '../lib/lenisStore'
import { BotonSalir } from './Boton'
import { CustomCursor } from './CustomCursor'
import { FooterCartelera } from './FooterCartelera'
import { Preloader } from './Preloader'
import { RouteCurtain } from './RouteCurtain'

gsap.registerPlugin(ScrollTrigger)

export function Layout() {
  const { session, cerrarSesion } = useAuth()
  const [cerrando, setCerrando] = useState(false)
  const [errorCierre, setErrorCierre] = useState<string | null>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [path, setPath] = useState('')
  const { progress, y } = useScrollProgress()
  const compacta = y > 80
  const location = useLocation()
  const navigate = useNavigate()

  if (path === '') {
    setPath(location.pathname)
  } else if (location.pathname !== path) {
    setPath(location.pathname)
    if (menuAbierto) setMenuAbierto(false)
  }

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--scroll-progress',
      String(progress),
    )
  }, [progress])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      window.cancelAnimationFrame(id)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuAbierto])

  async function handleCerrarSesion() {
    setErrorCierre(null)
    setCerrando(true)
    setMenuAbierto(false)
    try {
      await cerrarSesion()
    } catch (err) {
      setErrorCierre(
        err instanceof Error ? err.message : 'No se pudo cerrar la sesión',
      )
      setCerrando(false)
    }
  }

  function scrollTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: reduce })
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    }
  }

  function handleLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    setMenuAbierto(false)
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent(RESET_HOME_EVENT))
      scrollTop()
      return
    }
    navigate('/', { state: { resetHome: true }, viewTransition: true })
    window.setTimeout(scrollTop, 50)
  }

  return (
    <div className="app-shell">
      <Preloader />
      <CustomCursor />
      <RouteCurtain />
      <div className="film-grain" aria-hidden="true" />

      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <header
        className={`barra-superior${compacta ? ' compacta' : ''}`}
      >
        <a
          href={`${import.meta.env.BASE_URL}`}
          className="marca"
          onClick={handleLogoClick}
        >
          <span className="marca-roll" data-text="MI CARTELERA">
            <span className="marca-roll-inner">MI CARTELERA</span>
          </span>
        </a>

        {session && (
          <>
            <nav className="nav-principal" aria-label="Principal">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link${isActive ? ' is-active' : ''}`
                }
                viewTransition
              >
                Buscar
              </NavLink>
              <NavLink
                to="/mi-lista"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' is-active' : ''}`
                }
                viewTransition
              >
                Mi lista
              </NavLink>
            </nav>

            <BotonSalir
              className="nav-logout-desktop"
              onClick={handleCerrarSesion}
              disabled={cerrando}
            >
              {cerrando ? 'Cerrando…' : 'Cerrar sesión'}
            </BotonSalir>

            <button
              type="button"
              className={`nav-menu-btn${menuAbierto ? ' is-open' : ''}`}
              aria-expanded={menuAbierto}
              aria-controls="nav-mobile-panel"
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <span className="sr-only">
                {menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              </span>
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </>
        )}
      </header>

      {session && (
        <div
          id="nav-mobile-panel"
          className={`nav-mobile-panel${menuAbierto ? ' is-open' : ''}`}
          hidden={!menuAbierto}
        >
          <nav className="nav-mobile-links" aria-label="Menú móvil">
            <NavLink
              to="/"
              end
              className="nav-mobile-link"
              viewTransition
              onClick={() => setMenuAbierto(false)}
            >
              Buscar
            </NavLink>
            <NavLink
              to="/mi-lista"
              className="nav-mobile-link"
              viewTransition
              onClick={() => setMenuAbierto(false)}
            >
              Mi lista
            </NavLink>
          </nav>
          <BotonSalir onClick={handleCerrarSesion} disabled={cerrando}>
            {cerrando ? 'Cerrando…' : 'Cerrar sesión'}
          </BotonSalir>
        </div>
      )}

      {errorCierre && <p className="error banner-error">{errorCierre}</p>}

      <main className="contenido">
        <Outlet />
      </main>

      {session ? <FooterCartelera /> : null}
    </div>
  )
}
