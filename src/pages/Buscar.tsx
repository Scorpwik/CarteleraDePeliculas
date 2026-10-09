import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Reveal } from '../components/Reveal'
import { SkeletonPoster } from '../components/SkeletonPoster'
import { Toast } from '../components/Toast'
import { useParallaxOffset } from '../hooks/useParallaxOffset'
import { agregar, claveItem, listarClavesGuardadas } from '../lib/lista'
import { searchMulti } from '../lib/tmdb'
import type { ResultadoBusqueda } from '../types'

function padIndex(n: number): string {
  return String(n).padStart(2, '0')
}

export function Buscar() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [enLista, setEnLista] = useState<Set<string>>(new Set())
  const [agregando, setAgregando] = useState<string | null>(null)
  const [recienAgregados, setRecienAgregados] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const heroRef = useRef<HTMLElement>(null)
  const heroOffset = useParallaxOffset(heroRef, 0.12)

  const cerrarToast = useCallback(() => setToast(null), [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const texto = query.trim()
    if (!texto) return

    setCargando(true)
    setError(null)
    setBuscado(true)

    try {
      const [data, claves] = await Promise.all([
        searchMulti(texto),
        listarClavesGuardadas(),
      ])
      setResultados(data)
      setEnLista(claves)
    } catch (err) {
      setResultados([])
      setError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      setCargando(false)
    }
  }

  async function handleAgregar(item: ResultadoBusqueda) {
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

  const postersFondo = resultados
    .map((r) => r.poster_url)
    .filter((u): u is string => Boolean(u))
    .slice(0, 12)

  return (
    <section className="pagina-buscar">
      <header
        ref={heroRef}
        className="buscar-hero full-bleed"
        style={
          heroOffset
            ? { ['--hero-y' as string]: `${heroOffset}px` }
            : undefined
        }
      >
        <div className="buscar-hero-bg" aria-hidden="true">
          {postersFondo.length > 0 ? (
            <div className="buscar-poster-cols parallax-bg">
              {[0, 1, 2].map((col) => (
                <div key={col} className="buscar-poster-col" data-col={col + 1}>
                  {postersFondo
                    .filter((_, i) => i % 3 === col)
                    .map((src, i) => (
                      <img key={`${col}-${i}`} src={src} alt="" />
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="buscar-hero-tipo">CARTELERA</p>
          )}
        </div>
        <div className="buscar-hero-fade" aria-hidden="true" />

        <div className="buscar-hero-copy page-header">
          <span className="page-header-num" aria-hidden="true">
            01
          </span>
          <div className="page-header-copy">
            <p className="eyebrow">Explorar</p>
            <h1>Buscar</h1>
            <p className="page-sub">Películas y series en español vía TMDB.</p>
          </div>
        </div>
      </header>

      <form className="form-buscar" onSubmit={handleSubmit}>
        <label htmlFor="query-buscar" className="sr-only">
          Buscar películas o series
        </label>
        <input
          id="query-buscar"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título, serie, director…"
          autoComplete="off"
        />
      </form>

      {cargando && (
        <>
          <p className="mensaje-estado cinta">Buscando en cartelera…</p>
          <SkeletonPoster cantidad={8} />
        </>
      )}
      {error && <p className="error">{error}</p>}
      {!cargando && !error && buscado && resultados.length === 0 && (
        <div className="estado-vacio">
          <p>Sin resultados para esta búsqueda. Prueba otro título.</p>
        </div>
      )}

      {!cargando && resultados.length > 0 && (
        <>
          <p className="guia">{padIndex(resultados.length)} títulos</p>
          <ul className="grid-resultados">
            {resultados.map((item, i) => {
              const clave = claveItem(item.tipo_contenido, item.tmdb_id)
              const yaEsta = enLista.has(clave)
              const esNuevo = recienAgregados.has(clave)

              return (
                <Reveal
                  as="li"
                  key={clave}
                  className={`tarjeta-resultado ${esNuevo ? 'tarjeta-agregada' : ''}`}
                  delayMs={(i % 6) * 45}
                  data-col={String((i % 4) + 1)}
                >
                  <span className="tarjeta-indice" aria-hidden="true">
                    {padIndex(i + 1)}
                  </span>
                  <div className="poster-wrap">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt="" className="poster" />
                    ) : (
                      <div className="poster poster-vacio" aria-hidden="true">
                        Sin póster
                      </div>
                    )}
                  </div>
                  <div className="tarjeta-meta">
                    <h2 className="titulo-resultado">{item.titulo}</h2>
                    <p className="anio-resultado">{item.anio ?? '—'}</p>
                    {yaEsta ? (
                      <span className="badge-en-lista">Ya en tu lista</span>
                    ) : (
                      <button
                        type="button"
                        className="btn-primario btn-agregar"
                        disabled={agregando === clave}
                        onClick={() => handleAgregar(item)}
                      >
                        {agregando === clave ? 'Agregando…' : 'Agregar a mi lista'}
                      </button>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </>
      )}

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
