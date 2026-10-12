import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { Boton } from '../components/Boton'
import { ContadorAnimado } from '../components/ContadorAnimado'
import { Estrellas } from '../components/Estrellas'
import { SkeletonPoster } from '../components/SkeletonPoster'
import { TarjetaTitulo } from '../components/TarjetaTitulo'
import { Toast } from '../components/Toast'
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { actualizar, eliminar, listar } from '../lib/lista'
import type { Estado, ItemLista } from '../types'

gsap.registerPlugin(Flip)

type FiltroEstado = 'todos' | Estado
type Orden = 'fecha' | 'calificacion'

const ETIQUETAS_ESTADO: Record<Estado, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
}

const SELLOS_ESTADO: Record<Estado, string> = {
  por_ver: 'POR VER',
  viendo: 'VIENDO',
  vista: 'VISTA',
}

const FILTROS: { id: FiltroEstado; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'por_ver', label: 'Por ver' },
  { id: 'viendo', label: 'Viendo' },
  { id: 'vista', label: 'Vistas' },
]

function vtPosterName(id: number): string {
  return `poster-${id}`
}

function TituloHoverLetras() {
  const partes: { texto: string; serif?: boolean }[] = [
    { texto: 'MI' },
    { texto: ' ' },
    { texto: 'LISTA', serif: true },
  ]

  return (
    <h1 className="lista-hero-titulo" aria-label="Mi lista">
      {partes.map((p, pi) =>
        p.texto === ' ' ? (
          <span key={pi} className="lista-space">
            {' '}
          </span>
        ) : (
          <span
            key={pi}
            className={`lista-word${p.serif ? ' is-serif' : ''}`}
          >
            {p.texto.split('').map((ch, i) => (
              <span key={`${pi}-${i}`} className="lista-letter">
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </h1>
  )
}

export function MiLista() {
  const navigate = useNavigate()
  const reduce = usePrefersReducedMotion()
  const { y } = useScrollProgress()
  const [items, setItems] = useState<ItemLista[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [orden, setOrden] = useState<Orden>('fecha')
  const [saliendo, setSaliendo] = useState<Set<number>>(new Set())
  const [actualizando, setActualizando] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const gridRef = useRef<HTMLUListElement>(null)
  const listaShellRef = useRef<HTMLDivElement>(null)
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const gridHeightRef = useRef(0)
  const segRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLSpanElement>(null)
  const headerCompacta = y > 120

  const cerrarToast = useCallback(() => setToast(null), [])

  function marcarActualizando(id: number, activo: boolean) {
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

  const total = Math.max(1, items.length)
  const pct = {
    por_ver: (contadores.por_ver / total) * 100,
    viendo: (contadores.viendo / total) * 100,
    vista: (contadores.vista / total) * 100,
  }

  const visibles = useMemo(() => {
    const lista =
      filtro === 'todos' ? [...items] : items.filter((i) => i.estado === filtro)

    lista.sort((a, b) => {
      if (orden === 'calificacion') {
        const ca = a.calificacion_personal ?? -1
        const cb = b.calificacion_personal ?? -1
        if (cb !== ca) return cb - ca
      }
      return (
        new Date(b.fecha_agregado).getTime() -
        new Date(a.fecha_agregado).getTime()
      )
    })

    return lista
  }, [items, filtro, orden])

  function captureFlip() {
    if (reduce) return
    const shell = listaShellRef.current
    const grid = gridRef.current
    if (grid) {
      flipState.current = Flip.getState(grid.querySelectorAll('[data-flip-id]'))
    }
    // Guarda la altura del bloque de lista: si Flip usaba absolute o el
    // grid se vaciaba, el footer (franja naranja) saltaba al centro.
    if (shell) gridHeightRef.current = shell.offsetHeight
  }

  function cambiarFiltro(next: FiltroEstado) {
    if (next === filtro) return
    captureFlip()
    setFiltro(next)
  }

  function cambiarOrden(next: Orden) {
    if (next === orden) return
    captureFlip()
    setOrden(next)
  }

  useLayoutEffect(() => {
    if (reduce || (!flipState.current && gridHeightRef.current === 0)) return

    const shell = listaShellRef.current
    const fromHeight = gridHeightRef.current

    if (shell && fromHeight > 0) {
      gsap.set(shell, { minHeight: fromHeight })
    }

    if (flipState.current && gridRef.current) {
      Flip.from(flipState.current, {
        duration: 0.55,
        ease: 'power2.inOut',
        stagger: 0.02,
        onComplete: () => {
          flipState.current = null
        },
      })
    } else {
      flipState.current = null
    }

    if (shell && fromHeight > 0) {
      const toHeight = shell.scrollHeight
      gsap.to(shell, {
        minHeight: Math.max(toHeight, 1),
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(shell, { clearProps: 'minHeight' })
        },
      })
    }

    gridHeightRef.current = 0
  }, [visibles, reduce])

  useLayoutEffect(() => {
    const root = segRef.current
    const ind = indRef.current
    if (!root || !ind) return
    const active = root.querySelector<HTMLButtonElement>('.seg-btn.is-active')
    if (!active) return
    const r = root.getBoundingClientRect()
    const a = active.getBoundingClientRect()
    ind.style.width = `${a.width}px`
    ind.style.transform = `translate3d(${a.left - r.left}px, 0, 0)`
  }, [filtro, items.length])

  async function handleEstado(id: number, estado: Estado) {
    marcarActualizando(id, true)
    try {
      const actualizado = await actualizar(id, { estado })
      captureFlip()
      setItems((prev) => prev.map((i) => (i.id === id ? actualizado : i)))
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      marcarActualizando(id, false)
    }
  }

  async function handleCalificacion(id: number, calificacion_personal: number) {
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
    const li = gridRef.current?.querySelector(`[data-flip-id="item-${item.id}"]`)
    if (li && !reduce) {
      await gsap.to(li, {
        scale: 0.85,
        opacity: 0,
        duration: 0.32,
        ease: 'power2.in',
      })
    } else {
      await new Promise((r) => window.setTimeout(r, 280))
    }

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
      if (li) gsap.set(li, { clearProps: 'all' })
      setToast(err instanceof Error ? err.message : 'No se pudo eliminar')
    }
  }

  return (
    <section className="pagina-lista">
      <header
        className={`lista-hero page-header papel${headerCompacta ? ' lista-hero-compacta' : ''}`}
      >
        <div className="page-header-copy">
          <p className="eyebrow">Colección</p>
          <span className="sello sello-rotate-c">EN CARTELERA</span>
          <TituloHoverLetras />
          <p className="lista-hero-count">
            <ContadorAnimado valor={items.length} /> títulos en sala
          </p>
        </div>
      </header>

      <div className={`resumen-sticky${headerCompacta ? ' compacta' : ''}`}>
        <div
          className="barra-estados"
          role="img"
          aria-label={`Por ver ${contadores.por_ver}, viendo ${contadores.viendo}, vistas ${contadores.vista}`}
        >
          <span
            className="barra-seg barra-por-ver"
            style={{ width: `${pct.por_ver}%` }}
          />
          <span
            className="barra-seg barra-viendo"
            style={{ width: `${pct.viendo}%` }}
          />
          <span
            className="barra-seg barra-vista"
            style={{ width: `${pct.vista}%` }}
          />
        </div>
        <p className="resumen-lista">
          Tienes <ContadorAnimado valor={contadores.por_ver} /> por ver,{' '}
          <ContadorAnimado valor={contadores.viendo} /> viendo,{' '}
          <ContadorAnimado valor={contadores.vista} /> vistas
        </p>
      </div>

      <div className="controles-lista-sticky">
        <div
          ref={segRef}
          className="seg-control"
          role="tablist"
          aria-label="Filtrar por estado"
        >
          <span ref={indRef} className="seg-indicator" aria-hidden="true" />
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              className={`seg-btn${filtro === f.id ? ' is-active' : ''}`}
              onClick={() => cambiarFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="orden-toggle" role="group" aria-label="Ordenar">
          <button
            type="button"
            className={`orden-btn${orden === 'fecha' ? ' is-active' : ''}`}
            onClick={() => cambiarOrden('fecha')}
            aria-pressed={orden === 'fecha'}
          >
            Fecha
          </button>
          <button
            type="button"
            className={`orden-btn${orden === 'calificacion' ? ' is-active' : ''}`}
            onClick={() => cambiarOrden('calificacion')}
            aria-pressed={orden === 'calificacion'}
          >
            Calificación
          </button>
        </div>
      </div>

      {cargando && (
        <>
          <p className="mensaje-estado cinta">Rebobinando lista…</p>
          <SkeletonPoster cantidad={6} />
        </>
      )}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && items.length === 0 && (
        <div className="estado-vacio estado-vacio-lista">
          <p className="vacio-display">
            SALA <em>vacía</em>
          </p>
          <p>Tu lista espera el primer título. Empieza a proyectar.</p>
          <Boton to="/" viewTransition>
            Ir a Buscar
          </Boton>
        </div>
      )}

      {!cargando && !error && items.length > 0 && (
        <div ref={listaShellRef} className="lista-shell">
          {visibles.length === 0 ? (
            <p className="mensaje-estado cinta">No hay títulos con este filtro.</p>
          ) : (
            <section className="seccion-lista" aria-label="Títulos en tu lista">
              <p className="guia">{visibles.length} títulos</p>
              <ul className="grid-titulos" ref={gridRef}>
                {visibles.map((item, i) => {
                  const ocupado =
                    actualizando.has(item.id) || saliendo.has(item.id)
                  return (
                    <TarjetaTitulo
                      key={item.id}
                      dataFlipId={`item-${item.id}`}
                      titulo={item.titulo}
                      posterUrl={item.poster_url}
                      meta={
                        item.tipo_contenido === 'pelicula'
                          ? 'Película'
                          : 'Serie'
                      }
                      estadoSello={SELLOS_ESTADO[item.estado]}
                      viewTransitionName={vtPosterName(item.id)}
                      onActivate={() =>
                        navigate(`/titulo/${item.id}`, {
                          viewTransition: true,
                        })
                      }
                      className={
                        saliendo.has(item.id) ? 'tarjeta-saliendo' : ''
                      }
                      delayMs={(i % 4) * 40}
                      ariaLabel={`Ver detalle de ${item.titulo}`}
                      accion={
                        <>
                          <label className="campo-inline">
                            <span className="sr-only">Estado</span>
                            <select
                              value={item.estado}
                              disabled={ocupado}
                              onChange={(e) =>
                                handleEstado(
                                  item.id,
                                  e.target.value as Estado,
                                )
                              }
                            >
                              {(
                                Object.keys(ETIQUETAS_ESTADO) as Estado[]
                              ).map((est) => (
                                <option key={est} value={est}>
                                  {ETIQUETAS_ESTADO[est]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div>
                            {actualizando.has(item.id) && (
                              <p className="mensaje-estado">Guardando…</p>
                            )}
                            <Estrellas
                              valor={item.calificacion_personal}
                              editable={!ocupado}
                              onChange={(n) =>
                                handleCalificacion(item.id, n)
                              }
                            />
                          </div>
                          <Boton
                            type="button"
                            variante="peligro"
                            conFlecha={false}
                            disabled={ocupado}
                            onClick={() => handleEliminar(item)}
                          >
                            {saliendo.has(item.id)
                              ? 'Eliminando…'
                              : 'Eliminar'}
                          </Boton>
                        </>
                      }
                    />
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
