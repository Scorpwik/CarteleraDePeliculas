import { useCallback, useState, type FormEvent } from 'react'
import { Toast } from '../components/Toast'
import { agregar, claveItem, listarClavesGuardadas } from '../lib/lista'
import { searchMulti } from '../lib/tmdb'
import type { ResultadoBusqueda } from '../types'

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
        poster_path: item.poster_path,
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

  return (
    <section className="pagina-buscar">
      <header className="page-header">
        <p className="eyebrow">Explorar</p>
        <h1>Buscar</h1>
        <p className="page-sub">Películas y series en español vía TMDB.</p>
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
          placeholder="Buscar películas o series…"
          autoComplete="off"
        />
      </form>

      {cargando && <p className="mensaje-estado">Buscando…</p>}
      {error && <p className="error">{error}</p>}
      {!cargando && !error && buscado && resultados.length === 0 && (
        <p className="mensaje-estado">Sin resultados</p>
      )}

      {!cargando && resultados.length > 0 && (
        <ul className="grid-resultados">
          {resultados.map((item, i) => {
            const clave = claveItem(item.tipo_contenido, item.tmdb_id)
            const yaEsta = enLista.has(clave)
            const esNuevo = recienAgregados.has(clave)

            return (
              <li
                key={clave}
                className={`tarjeta-resultado ${esNuevo ? 'tarjeta-agregada' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {item.poster_url ? (
                  <img src={item.poster_url} alt="" className="poster" />
                ) : (
                  <div className="poster poster-vacio" aria-hidden="true">
                    Sin póster
                  </div>
                )}
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
              </li>
            )
          })}
        </ul>
      )}

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
