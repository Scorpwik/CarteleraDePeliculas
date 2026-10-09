import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { Estrellas } from '../components/Estrellas'
import { Toast } from '../components/Toast'
import { actualizar, obtener } from '../lib/lista'
import { getDetalle, posterUrl } from '../lib/tmdb'
import type { DetalleTmdb, Estado, ItemLista } from '../types'

const ETIQUETAS_ESTADO: Record<Estado, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
}

export function Titulo() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<ItemLista | null>(null)
  const [detalle, setDetalle] = useState<DetalleTmdb | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inexistente, setInexistente] = useState(false)

  const [estado, setEstado] = useState<Estado>('por_ver')
  const [calificacion, setCalificacion] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const cerrarToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!id) return
    let activo = true

    ;(async () => {
      setCargando(true)
      setError(null)
      setInexistente(false)

      try {
        const fila = await obtener(id)
        if (!activo) return

        if (!fila) {
          setInexistente(true)
          setCargando(false)
          return
        }

        setItem(fila)
        setEstado(fila.estado)
        setCalificacion(fila.calificacion_personal)
        setComentario(fila.comentario ?? '')

        const tmdb = await getDetalle(fila.tmdb_id, fila.tipo_contenido)
        if (!activo) return
        setDetalle(tmdb)
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : 'Error al cargar')
        }
      } finally {
        if (activo) setCargando(false)
      }
    })()

    return () => {
      activo = false
    }
  }, [id])

  async function handleGuardar(e: FormEvent) {
    e.preventDefault()
    if (!item) return

    setGuardando(true)
    try {
      const actualizado = await actualizar(item.id, {
        estado,
        calificacion_personal: calificacion,
        comentario: comentario.trim() || null,
      })
      setItem(actualizado)
      setToast('Cambios guardados')
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <p className="mensaje-estado">Cargando título…</p>
  }

  if (inexistente) {
    return (
      <section className="pagina-detalle">
        <p className="error">Este título no existe en tu lista.</p>
        <Link to="/mi-lista" className="btn-secundario">
          Volver a Mi lista
        </Link>
      </section>
    )
  }

  if (error || !item || !detalle) {
    return (
      <section className="pagina-detalle">
        <p className="error">{error ?? 'No se pudo cargar el detalle.'}</p>
        <Link to="/mi-lista" className="btn-secundario">
          Volver a Mi lista
        </Link>
      </section>
    )
  }

  const heroPoster = detalle.poster_url ?? posterUrl(item.poster_path)

  return (
    <section className="pagina-detalle">
      <Link to="/mi-lista" className="enlace-volver">
        ← Volver a Mi lista
      </Link>

      <div
        className="detalle-hero"
        style={
          heroPoster
            ? ({ '--hero-img': `url(${heroPoster})` } as CSSProperties)
            : undefined
        }
      >
        <div className="detalle-hero-inner">
          {heroPoster ? (
            <img src={heroPoster} alt="" className="poster-grande" />
          ) : (
            <div className="poster-grande poster-vacio">Sin póster</div>
          )}
          <div className="detalle-hero-texto">
            <p className="eyebrow">
              {item.tipo_contenido === 'pelicula' ? 'Película' : 'Serie'}
            </p>
            <h1>{detalle.titulo}</h1>
            <p className="detalle-meta">
              <span>{detalle.anio ?? '—'}</span>
              <span className="meta-sep">·</span>
              <span>TMDB {detalle.calificacion_tmdb}/10</span>
            </p>
          </div>
        </div>
      </div>

      <div className="detalle-cuerpo">
        <section className="bloque">
          <h2>Sinopsis</h2>
          <p className="sinopsis">{detalle.sinopsis}</p>
        </section>

        <section className="bloque">
          <h2>Elenco</h2>
          {detalle.elenco.length === 0 ? (
            <p className="mensaje-estado">Sin información de elenco.</p>
          ) : (
            <ul className="lista-elenco">
              {detalle.elenco.map((c) => (
                <li key={`${c.nombre}-${c.personaje}`}>
                  <strong>{c.nombre}</strong>
                  <span>{c.personaje || '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bloque bloque-editable">
          <h2>Tu valoración</h2>
          <form className="form-valoracion" onSubmit={handleGuardar}>
            <label>
              Estado
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as Estado)}
              >
                {(Object.keys(ETIQUETAS_ESTADO) as Estado[]).map((est) => (
                  <option key={est} value={est}>
                    {ETIQUETAS_ESTADO[est]}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="label-texto">Calificación personal</span>
              <Estrellas
                valor={calificacion}
                editable
                onChange={setCalificacion}
              />
            </div>

            <label>
              Comentario
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder="Notas personales…"
              />
            </label>

            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </form>
        </section>
      </div>

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
