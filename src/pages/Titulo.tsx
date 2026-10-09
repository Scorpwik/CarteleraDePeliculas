import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { Estrellas } from '../components/Estrellas'
import { Reveal, TituloLineas } from '../components/Reveal'
import { Toast } from '../components/Toast'
import { useParallaxOffset } from '../hooks/useParallaxOffset'
import { actualizar, obtener } from '../lib/lista'
import { getDetalle } from '../lib/tmdb'
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

  const heroRef = useRef<HTMLElement>(null)
  const backdropOffset = useParallaxOffset(heroRef, 0.22)
  const posterOffset = useParallaxOffset(heroRef, 0.08)

  const cerrarToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    const idNum = Number(id)
    if (!id || Number.isNaN(idNum)) {
      setInexistente(true)
      setCargando(false)
      return
    }

    let activo = true

    ;(async () => {
      setCargando(true)
      setError(null)
      setInexistente(false)

      try {
        const fila = await obtener(idNum)
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
    return <p className="mensaje-estado cinta">Cargando título…</p>
  }

  if (inexistente) {
    return (
      <section className="pagina-detalle">
        <p className="error">Este título no existe en tu lista.</p>
        <Link to="/mi-lista" className="btn-secundario" viewTransition>
          Volver a Mi lista
        </Link>
      </section>
    )
  }

  if (error || !item || !detalle) {
    return (
      <section className="pagina-detalle">
        <p className="error">{error ?? 'No se pudo cargar el detalle.'}</p>
        <Link to="/mi-lista" className="btn-secundario" viewTransition>
          Volver a Mi lista
        </Link>
      </section>
    )
  }

  const heroPoster = detalle.poster_url ?? item.poster_url
  const backdrop = detalle.backdrop_url ?? heroPoster
  const vtName = `poster-${item.id}`

  return (
    <section className="pagina-detalle">
      <Link to="/mi-lista" className="enlace-volver" viewTransition>
        ← Volver a Mi lista
      </Link>

      <header
        ref={heroRef}
        className="detalle-hero-full full-bleed"
        style={
          {
            '--hero-backdrop': backdrop ? `url(${backdrop})` : 'none',
          } as CSSProperties
        }
      >
        <div
          className="detalle-backdrop parallax-bg"
          aria-hidden="true"
          style={
            backdropOffset
              ? { transform: `translate3d(0, ${backdropOffset}px, 0)` }
              : undefined
          }
        />
        <div className="detalle-hero-fade" aria-hidden="true" />

        <div className="detalle-hero-inner">
          <div
            className="poster-float parallax-poster"
            style={
              posterOffset
                ? { transform: `translate3d(0, ${posterOffset}px, 0)` }
                : undefined
            }
          >
            {heroPoster ? (
              <img
                src={heroPoster}
                alt=""
                className="poster-grande"
                style={{ viewTransitionName: vtName }}
              />
            ) : (
              <div
                className="poster-grande poster-vacio"
                style={{ viewTransitionName: vtName }}
              >
                Sin póster
              </div>
            )}
          </div>

          <div className="detalle-hero-texto">
            <p className="eyebrow">
              {item.tipo_contenido === 'pelicula' ? 'Película' : 'Serie'} · 03
            </p>
            <TituloLineas texto={detalle.titulo} />
            <p className="detalle-meta">
              <span>{detalle.anio ?? '—'}</span>
              <span className="meta-sep">·</span>
              <span>TMDB {detalle.calificacion_tmdb}/10</span>
            </p>
          </div>
        </div>
      </header>

      <div className="detalle-cuerpo">
        <Reveal as="section" className="bloque" data-num="01">
          <h2>Sinopsis</h2>
          <p className="sinopsis">{detalle.sinopsis}</p>
        </Reveal>

        <section className="bloque bloque-elenco" data-num="02">
          <h2>Elenco</h2>
          {detalle.elenco.length === 0 ? (
            <p className="mensaje-estado">Sin información de elenco.</p>
          ) : (
            <ul className="lista-elenco-scroll">
              {detalle.elenco.map((c, i) => (
                <Reveal
                  as="li"
                  key={`${c.nombre}-${c.personaje}`}
                  className="elenco-card"
                  delayMs={i * 55}
                >
                  <strong>{c.nombre}</strong>
                  <span>{c.personaje || '—'}</span>
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        <Reveal as="section" className="bloque bloque-editable" data-num="03" delayMs={60}>
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
        </Reveal>
      </div>

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
