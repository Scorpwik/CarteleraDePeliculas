import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Estrellas } from '../components/Estrellas'
import { Toast } from '../components/Toast'
import { actualizar, eliminar, listar } from '../lib/lista'
import { posterUrl } from '../lib/tmdb'
import type { Estado, ItemLista } from '../types'

type FiltroEstado = 'todos' | Estado
type Orden = 'fecha' | 'calificacion'

const ETIQUETAS_ESTADO: Record<Estado, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
}

export function MiLista() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ItemLista[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [orden, setOrden] = useState<Orden>('fecha')
  const [saliendo, setSaliendo] = useState<Set<string>>(new Set())
  const [actualizando, setActualizando] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const cerrarToast = useCallback(() => setToast(null), [])

  function marcarActualizando(id: string, activo: boolean) {
    setActualizando((prev) => {
      const next = new Set(prev)
      if (activo) next.add(id)
      else next.delete(id)
      return next
    })
  }

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const data = await listar()
        if (activo) setItems(data)
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : 'Error al cargar la lista')
        }
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [])

  const contadores = useMemo(() => {
    return {
      por_ver: items.filter((i) => i.estado === 'por_ver').length,
      viendo: items.filter((i) => i.estado === 'viendo').length,
      vista: items.filter((i) => i.estado === 'vista').length,
    }
  }, [items])

  const visibles = useMemo(() => {
    let lista =
      filtro === 'todos' ? [...items] : items.filter((i) => i.estado === filtro)

    lista.sort((a, b) => {
      if (orden === 'calificacion') {
        const ca = a.calificacion_personal ?? -1
        const cb = b.calificacion_personal ?? -1
        if (cb !== ca) return cb - ca
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return lista
  }, [items, filtro, orden])

  async function handleEstado(id: string, estado: Estado) {
    marcarActualizando(id, true)
    try {
      const actualizado = await actualizar(id, { estado })
      setItems((prev) => prev.map((i) => (i.id === id ? actualizado : i)))
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      marcarActualizando(id, false)
    }
  }

  async function handleCalificacion(id: string, calificacion_personal: number) {
    marcarActualizando(id, true)
    try {
      const actualizado = await actualizar(id, { calificacion_personal })
      setItems((prev) => prev.map((i) => (i.id === id ? actualizado : i)))
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      marcarActualizando(id, false)
    }
  }

  async function handleEliminar(item: ItemLista) {
    if (!window.confirm(`¿Eliminar «${item.titulo}» de tu lista?`)) return

    setSaliendo((prev) => new Set(prev).add(item.id))
    window.setTimeout(async () => {
      try {
        await eliminar(item.id)
        setItems((prev) => prev.filter((i) => i.id !== item.id))
        setToast('Eliminado de tu lista')
      } catch (err) {
        setSaliendo((prev) => {
          const next = new Set(prev)
          next.delete(item.id)
          return next
        })
        setToast(err instanceof Error ? err.message : 'No se pudo eliminar')
      }
    }, 280)
  }

  return (
    <section className="pagina-lista">
      <header className="page-header">
        <p className="eyebrow">Colección</p>
        <h1>Mi lista</h1>
        <p className="resumen-lista">
          Tienes {contadores.por_ver} por ver, {contadores.viendo} viendo,{' '}
          {contadores.vista} vistas
        </p>
      </header>

      <div className="controles-lista">
        <label>
          Estado
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as FiltroEstado)}
          >
            <option value="todos">Todos</option>
            <option value="por_ver">Por ver</option>
            <option value="viendo">Viendo</option>
            <option value="vista">Vista</option>
          </select>
        </label>
        <label>
          Orden
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
          >
            <option value="fecha">Fecha agregada</option>
            <option value="calificacion">Calificación personal</option>
          </select>
        </label>
      </div>

      {cargando && <p className="mensaje-estado">Cargando tu lista…</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && items.length === 0 && (
        <div className="estado-vacio">
          <p>Tu lista está vacía.</p>
          <Link to="/" className="btn-primario">
            Buscar
          </Link>
        </div>
      )}

      {!cargando && !error && items.length > 0 && visibles.length === 0 && (
        <p className="mensaje-estado">No hay títulos con este filtro.</p>
      )}

      <ul className="grid-lista" key={`${filtro}-${orden}`}>
        {visibles.map((item, i) => {
          const url = posterUrl(item.poster_path)
          const ocupado =
            actualizando.has(item.id) || saliendo.has(item.id)
          return (
            <li
              key={item.id}
              className={`tarjeta-lista ${saliendo.has(item.id) ? 'tarjeta-saliendo' : ''}`}
              style={{ animationDelay: `${i * 45}ms` }}
              onClick={() => navigate(`/titulo/${item.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/titulo/${item.id}`)
                }
              }}
              role="link"
              tabIndex={0}
            >
              {url ? (
                <img src={url} alt="" className="poster" />
              ) : (
                <div className="poster poster-vacio" aria-hidden="true">
                  Sin póster
                </div>
              )}
              <div className="tarjeta-lista-body">
                <h2 className="titulo-resultado">{item.titulo}</h2>
                <p className="meta-tipo">
                  {item.tipo_contenido === 'pelicula' ? 'Película' : 'Serie'}
                </p>
                <label className="campo-inline" onClick={(e) => e.stopPropagation()}>
                  <span className="sr-only">Estado</span>
                  <select
                    value={item.estado}
                    disabled={ocupado}
                    onChange={(e) =>
                      handleEstado(item.id, e.target.value as Estado)
                    }
                  >
                    {(Object.keys(ETIQUETAS_ESTADO) as Estado[]).map((est) => (
                      <option key={est} value={est}>
                        {ETIQUETAS_ESTADO[est]}
                      </option>
                    ))}
                  </select>
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  {actualizando.has(item.id) && (
                    <p className="mensaje-estado">Guardando…</p>
                  )}
                  <Estrellas
                    valor={item.calificacion_personal}
                    editable={!ocupado}
                    onChange={(n) => handleCalificacion(item.id, n)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-peligro"
                  disabled={ocupado}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEliminar(item)
                  }}
                >
                  {saliendo.has(item.id) ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
