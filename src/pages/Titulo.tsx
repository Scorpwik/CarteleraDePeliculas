import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Boton } from '../components/Boton'
import { ElencoCarousel } from '../components/ElencoCarousel'
import { Estrellas } from '../components/Estrellas'
import { Reveal, TituloLineas } from '../components/Reveal'
import { RevealWords, ScrollHighlight } from '../components/TextEffects'
import { Toast } from '../components/Toast'
import { useCanHover } from '../hooks/useCanHover'
import { useIsNarrow, usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { useParallaxOffset } from '../hooks/useParallaxOffset'
import { actualizar, agregar, obtener, obtenerPorTmdb } from '../lib/lista'
import { getDetalle } from '../lib/tmdb'
import type { DetalleTmdb, Estado, ItemLista, Tipo } from '../types'

gsap.registerPlugin(ScrollTrigger)

const ETIQUETAS_ESTADO: Record<Estado, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
}

type ModoDetalle = 'editable' | 'lectura'

interface TituloProps {
  modo?: ModoDetalle
}

interface DetalleInmersivoProps {
  detalle: DetalleTmdb
  tipo: Tipo
  posterFallback?: string | null
  vtName: string
  volverTo: string
  volverLabel: string
  children: ReactNode
}

function esTipoValido(valor: string | undefined): valor is Tipo {
  return valor === 'pelicula' || valor === 'serie'
}

function DetalleInmersivo({
  detalle,
  tipo,
  posterFallback,
  vtName,
  volverTo,
  volverLabel,
  children,
}: DetalleInmersivoProps) {
  const reduce = usePrefersReducedMotion()
  const narrow = useIsNarrow(760)
  const canHover = useCanHover()
  const heroRef = useRef<HTMLElement>(null)
  const kenRef = useRef<HTMLImageElement>(null)
  const posterTiltRef = useRef<HTMLDivElement>(null)
  const sinopsisRef = useRef<HTMLElement>(null)
  const backdropOffset = useParallaxOffset(heroRef, reduce ? 0 : 0.22)
  const posterOffset = useParallaxOffset(heroRef, reduce ? 0 : 0.08)

  const heroPoster = detalle.poster_url ?? posterFallback ?? null
  const backdrop = detalle.backdrop_url ?? heroPoster

  useGSAP(
    () => {
      if (reduce || !kenRef.current) return
      const tween = gsap.fromTo(
        kenRef.current,
        { scale: 1.08, xPercent: -2 },
        { scale: 1.2, xPercent: 3, duration: 14, ease: 'none', repeat: -1, yoyo: true },
      )
      return () => {
        tween.kill()
      }
    },
    {
      scope: heroRef,
      dependencies: [backdrop, reduce],
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (reduce || narrow || !sinopsisRef.current) return
      const st = ScrollTrigger.create({
        trigger: sinopsisRef.current,
        pin: true,
        start: 'top top+=64',
        end: '+=90%',
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })
      return () => {
        st.kill()
      }
    },
    {
      scope: sinopsisRef,
      dependencies: [detalle.sinopsis, reduce, narrow],
      revertOnUpdate: true,
    },
  )

  function onPosterMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!canHover || reduce || !posterTiltRef.current) return
    const rect = posterTiltRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 14
    const ry = (x - 0.5) * 14
    const baseY = posterOffset || 0
    posterTiltRef.current.style.transform = `translate3d(0, ${baseY}px, 0) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }

  function onPosterLeave() {
    if (!posterTiltRef.current) return
    const baseY = posterOffset || 0
    posterTiltRef.current.style.transform = `translate3d(0, ${baseY}px, 0) perspective(900px) rotateX(0) rotateY(0)`
  }

  return (
    <section className="pagina-detalle">
      <header
        ref={heroRef}
        className="detalle-hero-full full-bleed"
        style={
          {
            '--hero-backdrop': backdrop ? `url(${backdrop})` : 'none',
          } as CSSProperties
        }
      >
        <Link to={volverTo} className="enlace-volver" viewTransition>
          ← {volverLabel}
        </Link>

        <div
          className="detalle-backdrop parallax-bg"
          aria-hidden="true"
          style={
            backdropOffset
              ? { transform: `translate3d(0, ${backdropOffset}px, 0)` }
              : undefined
          }
        >
          {backdrop ? (
            <img ref={kenRef} src={backdrop} alt="" className="detalle-kenburns" />
          ) : null}
        </div>
        <div className="detalle-hero-fade" aria-hidden="true" />

        <div className="detalle-hero-inner">
          <div
            ref={posterTiltRef}
            className="poster-float parallax-poster"
            onMouseMove={onPosterMove}
            onMouseLeave={onPosterLeave}
            style={
              posterOffset
                ? { transform: `translate3d(0, ${posterOffset}px, 0)` }
                : undefined
            }
          >
            <div className="img-reveal poster-grande-wrap">
              {heroPoster ? (
                <>
                  <img src={heroPoster} alt="" className="img-ambient" aria-hidden="true" />
                  <div className="img-parallax-frame">
                    <img
                      src={heroPoster}
                      alt=""
                      className="img-parallax-inner"
                      style={{ viewTransitionName: vtName }}
                    />
                  </div>
                </>
              ) : (
                <div
                  className="poster-vacio"
                  style={{ viewTransitionName: vtName }}
                >
                  Sin póster
                </div>
              )}
            </div>
          </div>

          <div className="detalle-hero-texto">
            <div className="detalle-sellos">
              <span className="sello sello-rotate-a">
                {tipo === 'pelicula' ? 'Película' : 'Serie'}
              </span>
              {detalle.anio ? (
                <span className="sello sello-rotate-b sello-amarillo">
                  {detalle.anio}
                </span>
              ) : null}
              <span className="sello sello-rotate-c">
                TMDB {detalle.calificacion_tmdb}
              </span>
            </div>
            <TituloLineas texto={detalle.titulo} />
          </div>
        </div>
      </header>

      <div className="detalle-cuerpo">
        <section ref={sinopsisRef} className="bloque bloque-sinopsis-pin">
          <RevealWords as="h2">Sinopsis</RevealWords>
          <ScrollHighlight className="sinopsis">{detalle.sinopsis}</ScrollHighlight>
        </section>

        <section className="bloque bloque-elenco">
          <RevealWords as="h2">Elenco</RevealWords>
          <ElencoCarousel elenco={detalle.elenco} />
        </section>

        {children}
      </div>
    </section>
  )
}

export function Titulo({ modo = 'editable' }: TituloProps) {
  const params = useParams<{ id?: string; tipo?: string; tmdbId?: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<ItemLista | null>(null)
  const [detalle, setDetalle] = useState<DetalleTmdb | null>(null)
  const [tipoLectura, setTipoLectura] = useState<Tipo | null>(null)
  const [tmdbIdLectura, setTmdbIdLectura] = useState<number | null>(null)
  const [redirigirA, setRedirigirA] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inexistente, setInexistente] = useState(false)

  const [estado, setEstado] = useState<Estado>('por_ver')
  const [calificacion, setCalificacion] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)
  const [agregando, setAgregando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const saveBtnRef = useRef<HTMLButtonElement>(null)

  const cerrarToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    let activo = true

    ;(async () => {
      setCargando(true)
      setError(null)
      setInexistente(false)
      setRedirigirA(null)
      setItem(null)
      setDetalle(null)

      try {
        if (modo === 'editable') {
          const idNum = Number(params.id)
          if (!params.id || Number.isNaN(idNum)) {
            if (activo) {
              setInexistente(true)
              setCargando(false)
            }
            return
          }

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
        } else {
          if (!esTipoValido(params.tipo)) {
            if (activo) {
              setInexistente(true)
              setCargando(false)
            }
            return
          }

          const tmdbId = Number(params.tmdbId)
          if (!params.tmdbId || Number.isNaN(tmdbId)) {
            if (activo) {
              setInexistente(true)
              setCargando(false)
            }
            return
          }

          setTipoLectura(params.tipo)
          setTmdbIdLectura(tmdbId)

          const existente = await obtenerPorTmdb(params.tipo, tmdbId)
          if (!activo) return

          if (existente) {
            setRedirigirA(`/titulo/${existente.id}`)
            setCargando(false)
            return
          }

          const tmdb = await getDetalle(tmdbId, params.tipo)
          if (!activo) return
          setDetalle(tmdb)
        }
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
  }, [modo, params.id, params.tipo, params.tmdbId])

  async function handleGuardar(e: FormEvent) {
    e.preventDefault()
    if (!item) return

    setGuardando(true)
    setGuardadoOk(false)
    try {
      const actualizado = await actualizar(item.id, {
        estado,
        calificacion_personal: calificacion,
        comentario: comentario.trim() || null,
      })
      setItem(actualizado)
      setToast('Cambios guardados')
      setGuardadoOk(true)
      if (saveBtnRef.current) {
        gsap.fromTo(
          saveBtnRef.current,
          { scale: 1 },
          { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' },
        )
      }
      window.setTimeout(() => setGuardadoOk(false), 1600)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function handleAgregar() {
    if (!detalle || !tipoLectura || tmdbIdLectura == null || agregando) return

    setAgregando(true)
    try {
      const nuevo = await agregar({
        tmdb_id: tmdbIdLectura,
        tipo_contenido: tipoLectura,
        titulo: detalle.titulo,
        poster_url: detalle.poster_url,
        estado: 'por_ver',
      })
      navigate(`/titulo/${nuevo.id}`, { viewTransition: true })
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo agregar')
      setAgregando(false)
    }
  }

  if (redirigirA) {
    return <Navigate to={redirigirA} replace />
  }

  if (cargando) {
    return <p className="mensaje-estado cinta">Cargando título…</p>
  }

  const volverTo = modo === 'editable' ? '/mi-lista' : '/'
  const volverLabel = modo === 'editable' ? 'Volver a Mi lista' : 'Volver a Buscar'

  if (inexistente) {
    return (
      <section className="pagina-detalle">
        <p className="error">
          {modo === 'editable'
            ? 'Este título no existe en tu lista.'
            : 'No encontramos este título.'}
        </p>
        <Boton to={volverTo} variante="secundario" viewTransition conFlecha={false}>
          {volverLabel}
        </Boton>
      </section>
    )
  }

  if (error || !detalle || (modo === 'editable' && !item) || (modo === 'lectura' && !tipoLectura)) {
    return (
      <section className="pagina-detalle">
        <p className="error">{error ?? 'No se pudo cargar el detalle.'}</p>
        <Boton to={volverTo} variante="secundario" viewTransition conFlecha={false}>
          {volverLabel}
        </Boton>
      </section>
    )
  }

  const tipo = modo === 'editable' && item ? item.tipo_contenido : tipoLectura!
  const vtName =
    modo === 'editable' && item
      ? `poster-${item.id}`
      : `poster-tmdb-${tmdbIdLectura}`

  return (
    <>
      <DetalleInmersivo
        detalle={detalle}
        tipo={tipo}
        posterFallback={item?.poster_url}
        vtName={vtName}
        volverTo={volverTo}
        volverLabel={volverLabel}
      >
        {modo === 'editable' ? (
          <Reveal as="section" className="ticket-panel" delayMs={60}>
            <p className="ticket-stub">BOLETO · TU CALIFICACIÓN</p>
            <RevealWords as="h2">Tu calificación</RevealWords>
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

              <Boton
                ref={saveBtnRef}
                type="submit"
                className={`btn-guardar${guardadoOk ? ' is-ok' : ''}`}
                disabled={guardando}
              >
                {guardando ? 'Guardando…' : guardadoOk ? '¡Guardado!' : 'Guardar'}
              </Boton>
            </form>
          </Reveal>
        ) : (
          <Reveal as="section" className="ticket-panel" delayMs={60}>
            <p className="ticket-stub">BOLETO · AGREGAR</p>
            <RevealWords as="h2">Agregar</RevealWords>
            <ScrollHighlight className="sinopsis">
              Guarda este título en tu cartelera para marcarlo y valorarlo.
            </ScrollHighlight>
            <Boton type="button" disabled={agregando} onClick={handleAgregar}>
              {agregando ? 'Agregando…' : 'Agregar a mi lista'}
            </Boton>
          </Reveal>
        )}
      </DetalleInmersivo>

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </>
  )
}
