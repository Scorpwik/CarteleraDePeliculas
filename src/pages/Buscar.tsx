import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Boton } from '../components/Boton'
import { HeroCartelera } from '../components/HeroCartelera'
import { RESET_HOME_EVENT } from '../lib/events'
import { getLenis } from '../lib/lenisStore'
import { MarqueeScroll } from '../components/MarqueeScroll'
import { SkeletonPoster } from '../components/SkeletonPoster'
import { TarjetaTitulo } from '../components/TarjetaTitulo'
import { TendenciaSlot, TendenciasRail } from '../components/TendenciasRail'
import { RevealWords, ScrollHighlight } from '../components/TextEffects'
import { Toast } from '../components/Toast'
import { agregar, claveItem, listarClavesGuardadas } from '../lib/lista'
import { getTendencias, searchMulti } from '../lib/tmdb'
import type { ResultadoBusqueda } from '../types'

function vtPosterTmdb(tmdbId: number): string {
  return `poster-tmdb-${tmdbId}`
}

export function Buscar() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [tendencias, setTendencias] = useState<ResultadoBusqueda[]>([])
  const [enLista, setEnLista] = useState<Set<string>>(new Set())
  const [agregando, setAgregando] = useState<string | null>(null)
  const [recienAgregados, setRecienAgregados] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(false)
  const [cargandoTendencias, setCargandoTendencias] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorTendencias, setErrorTendencias] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [heroResetKey, setHeroResetKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  const cerrarToast = useCallback(() => setToast(null), [])

  const mostrandoBusqueda = buscado && query.trim() !== ''
  const heroCollapsed = searchFocused || mostrandoBusqueda

  const resetHome = useCallback(() => {
    setQuery('')
    setResultados([])
    setBuscado(false)
    setError(null)
    setSearchFocused(false)
    setHeroResetKey((k) => k + 1)
    inputRef.current?.blur()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: reduce })
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    const onReset = () => resetHome()
    window.addEventListener(RESET_HOME_EVENT, onReset)
    return () => window.removeEventListener(RESET_HOME_EVENT, onReset)
  }, [resetHome])

  useEffect(() => {
    const state = location.state as { resetHome?: boolean } | null
    if (!state?.resetHome) return
    const id = window.requestAnimationFrame(() => {
      resetHome()
      window.history.replaceState({}, '')
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.state, resetHome])

  useEffect(() => {
    let activo = true

    ;(async () => {
      setCargandoTendencias(true)
      setErrorTendencias(null)
      try {
        const [data, claves] = await Promise.all([
          getTendencias(),
          listarClavesGuardadas(),
        ])
        if (!activo) return
        setTendencias(data)
        setEnLista(claves)
      } catch (err) {
        if (activo) {
          setErrorTendencias(
            err instanceof Error ? err.message : 'Error al cargar tendencias',
          )
        }
      } finally {
        if (activo) setCargandoTendencias(false)
      }
    })()

    return () => {
      activo = false
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const texto = query.trim()
    if (!texto) return

    searchAbortRef.current?.abort()
    const ac = new AbortController()
    searchAbortRef.current = ac

    setCargando(true)
    setError(null)
    setBuscado(true)

    try {
      const [data, claves] = await Promise.all([
        searchMulti(texto),
        listarClavesGuardadas(),
      ])
      if (ac.signal.aborted) return
      setResultados(data)
      setEnLista(claves)
    } catch (err) {
      if (ac.signal.aborted) return
      setResultados([])
      setError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      if (!ac.signal.aborted) setCargando(false)
    }
  }

  async function handleAgregar(
    item: ResultadoBusqueda,
    e?: MouseEvent,
  ) {
    e?.preventDefault()
    e?.stopPropagation()

    const clave = claveItem(item.tipo_contenido, item.tmdb_id)
    if (enLista.has(clave) || agregando) return

    setAgregando(clave)
    try {
      await agregar({
        tmdb_id: item.tmdb_id,
        tipo_contenido: item.tipo_contenido,
        titulo: item.titulo,
        poster_url: item.poster_url,
        estado: 'por_ver',
      })
      setEnLista((prev) => new Set(prev).add(clave))
      setRecienAgregados((prev) => new Set(prev).add(clave))
      setToast(`«${item.titulo}» agregada a tu lista`)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo agregar')
    } finally {
      setAgregando(null)
    }
  }

  function renderTarjetas(items: ResultadoBusqueda[], gridClass = 'grid-titulos') {
    return (
      <ul className={gridClass}>
        {items.map((item, i) => {
          const clave = claveItem(item.tipo_contenido, item.tmdb_id)
          const yaEsta = enLista.has(clave)
          const esNuevo = recienAgregados.has(clave)
          const rutaExplorar = `/explorar/${item.tipo_contenido}/${item.tmdb_id}`

          return (
            <TarjetaTitulo
              key={clave}
              titulo={item.titulo}
              posterUrl={item.poster_url}
              meta={item.anio ?? '—'}
              anio={item.anio}
              viewTransitionName={vtPosterTmdb(item.tmdb_id)}
              to={rutaExplorar}
              className={esNuevo ? 'tarjeta-agregada' : ''}
              delayMs={(i % 6) * 45}
              accion={
                yaEsta ? (
                  <span className="badge-en-lista">Ya en tu lista</span>
                ) : (
                  <Boton
                    type="button"
                    className="btn-agregar"
                    disabled={agregando === clave}
                    onClick={(e) => handleAgregar(item, e)}
                  >
                    {agregando === clave ? 'Agregando…' : 'Agregar a mi lista'}
                  </Boton>
                )
              }
            />
          )
        })}
      </ul>
    )
  }

  return (
    <section className="pagina-buscar">
      <div className="full-bleed">
        <HeroCartelera
          items={tendencias}
          collapsed={heroCollapsed}
          resetKey={heroResetKey}
        />
      </div>

      {!mostrandoBusqueda && <MarqueeScroll />}

      <section className="seccion-buscar papel">
        <form
          className={`form-buscar${searchFocused ? ' is-focused' : ''}`}
          onSubmit={handleSubmit}
        >
          <label htmlFor="query-buscar" className="form-buscar-label">
            Buscar
          </label>
          <input
            ref={inputRef}
            id="query-buscar"
            type="search"
            value={query}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(e) => {
              const valor = e.target.value
              setQuery(valor)
              if (!valor.trim()) {
                setBuscado(false)
                setResultados([])
                setError(null)
              }
            }}
            placeholder="Título, serie, director…"
            autoComplete="off"
          />
        </form>

        <ScrollHighlight>
          Películas y series en español vía TMDB. Escribe y proyecta tu propia
          cartelera personal.
        </ScrollHighlight>
      </section>

      {mostrandoBusqueda ? (
        <section className="seccion-resultados papel" aria-label="Resultados">
          {cargando && (
            <>
              <p className="mensaje-estado cinta">Buscando en cartelera…</p>
              <SkeletonPoster cantidad={8} />
            </>
          )}
          {error && <p className="error">{error}</p>}
          {!cargando && !error && resultados.length === 0 && (
            <div className="estado-vacio">
              <p>Sin resultados para esta búsqueda. Prueba otro título.</p>
            </div>
          )}
          {!cargando && resultados.length > 0 && (
            <>
              <RevealWords as="h2">Resultados</RevealWords>
              <p className="guia">{resultados.length} títulos</p>
              {renderTarjetas(resultados)}
            </>
          )}
        </section>
      ) : (
        <>
          {cargandoTendencias && (
            <section className="papel">
              <p className="mensaje-estado cinta">Cargando tendencias…</p>
              <SkeletonPoster cantidad={12} />
            </section>
          )}
          {errorTendencias && <p className="error">{errorTendencias}</p>}
          {!cargandoTendencias && !errorTendencias && tendencias.length === 0 && (
            <div className="estado-vacio papel">
              <p>No hay tendencias disponibles ahora.</p>
            </div>
          )}
          {!cargandoTendencias && tendencias.length > 0 && (
            <TendenciasRail ready>
              {tendencias.slice(0, 20).map((item, i) => {
                const clave = claveItem(item.tipo_contenido, item.tmdb_id)
                const yaEsta = enLista.has(clave)
                const esNuevo = recienAgregados.has(clave)
                const rutaExplorar = `/explorar/${item.tipo_contenido}/${item.tmdb_id}`

                return (
                  <TendenciaSlot key={clave} rank={i + 1}>
                    <TarjetaTitulo
                      as="div"
                      clipReveal={false}
                      titulo={item.titulo}
                      posterUrl={item.poster_url}
                      meta={item.anio ?? '—'}
                      anio={item.anio}
                      viewTransitionName={vtPosterTmdb(item.tmdb_id)}
                      to={rutaExplorar}
                      className={esNuevo ? 'tarjeta-agregada' : ''}
                      delayMs={0}
                      accion={
                        yaEsta ? (
                          <span className="badge-en-lista">Ya en tu lista</span>
                        ) : (
                          <Boton
                            type="button"
                            className="btn-agregar"
                            disabled={agregando === clave}
                            onClick={(e) => handleAgregar(item, e)}
                          >
                            {agregando === clave
                              ? 'Agregando…'
                              : 'Agregar a mi lista'}
                          </Boton>
                        )
                      }
                    />
                  </TendenciaSlot>
                )
              })}
            </TendenciasRail>
          )}
        </>
      )}

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
