import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Boton } from '../components/Boton'
import { Toast } from '../components/Toast'
import {
  PAUSA_ENTRE_MIN,
  TIEMPO_MAX_PERMITIDO,
  TIEMPO_MIN_PERMITIDO,
  cabe,
  clasificarPorCabida,
  duracionConocida,
  evaluarFichaDuracion,
  mensajeFalloConsultaGeneral,
  textoSelloNoDisponible,
  tiempoDisponibleValido,
  type FichaDuracion,
} from '../dominio/sesion'
import { listar } from '../lib/lista'
import { eliminarSesion, guardarSesion, listarSesiones } from '../lib/sesiones'
import { getDuracionPelicula } from '../lib/tmdb'
import type { ItemLista, PeliculaParaSesion, SesionGuardada } from '../types'

interface Candidata {
  item: ItemLista
  duracion: number | null
  motivo: string | null
}

export function NocheDePelicula() {
  const [tiempoTexto, setTiempoTexto] = useState('120')
  const [tiempo, setTiempo] = useState<number | null>(null)
  const [errorTiempo, setErrorTiempo] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null)
  const [consultado, setConsultado] = useState(false)
  const [cabida, setCabida] = useState<Candidata[]>([])
  const [noDisponibles, setNoDisponibles] = useState<Candidata[]>([])
  const [sesion, setSesion] = useState<PeliculaParaSesion[]>([])
  const [avisoArmado, setAvisoArmado] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)
  const [guardadas, setGuardadas] = useState<SesionGuardada[]>([])
  const [errorListado, setErrorListado] = useState<string | null>(null)
  const [cargandoGuardadas, setCargandoGuardadas] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const cerrarToast = useCallback(() => setToast(null), [])

  const cargarGuardadas = useCallback(async () => {
    setErrorListado(null)
    try {
      const rows = await listarSesiones()
      setGuardadas(rows)
    } catch (err) {
      setErrorListado(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las sesiones.',
      )
    } finally {
      setCargandoGuardadas(false)
    }
  }, [])

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const rows = await listarSesiones()
        if (!activo) return
        setGuardadas(rows)
      } catch (err) {
        if (!activo) return
        setErrorListado(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las sesiones.',
        )
      } finally {
        if (activo) setCargandoGuardadas(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [])

  const resultado = useMemo(() => {
    if (tiempo === null) return null
    return cabe(
      tiempo,
      sesion.map((p) => p.duracion_min),
      PAUSA_ENTRE_MIN,
    )
  }, [tiempo, sesion])

  const consultar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setErrorTiempo(null)
      setErrorConsulta(null)
      setAvisoArmado(null)

      const minutos = Number(tiempoTexto)
      if (!tiempoDisponibleValido(minutos)) {
        setTiempo(null)
        setConsultado(false)
        setErrorTiempo(
          `Indica un número entero de minutos entre ${TIEMPO_MIN_PERMITIDO} y ${TIEMPO_MAX_PERMITIDO}.`,
        )
        return
      }

      setTiempo(minutos)
      setCargando(true)
      setConsultado(false)

      try {
        const lista = await listar()
        const porVer = lista.filter(
          (item) =>
            item.tipo_contenido === 'pelicula' && item.estado === 'por_ver',
        )

        const evaluadas = await Promise.all(
          porVer.map(async (item): Promise<Candidata> => {
            let ficha: FichaDuracion
            try {
              ficha = {
                estado: 'ok',
                duracion: await getDuracionPelicula(item.tmdb_id),
              }
            } catch {
              ficha = { estado: 'error' }
            }
            const ev = evaluarFichaDuracion(ficha, minutos)
            return { item, duracion: ev.duracion, motivo: ev.motivo }
          }),
        )

        const { cabida: si, noDisponibles: no } = clasificarPorCabida(
          evaluadas,
          (c) => c.item.titulo,
        )

        setCabida(si)
        setNoDisponibles(no)
        setSesion((actual) =>
          actual.filter((p) => si.some((c) => c.item.tmdb_id === p.tmdb_id)),
        )
        setConsultado(true)
      } catch (err) {
        setErrorConsulta(mensajeFalloConsultaGeneral(err))
      } finally {
        setCargando(false)
      }
    },
    [tiempoTexto],
  )

  function agregar(c: Candidata) {
    const duracion = c.duracion
    if (tiempo === null || !duracionConocida(duracion)) {
      setAvisoArmado(c.motivo ?? 'Esta película no tiene duración conocida.')
      return
    }
    if (sesion.some((p) => p.tmdb_id === c.item.tmdb_id)) {
      setAvisoArmado('Esta película ya está en la sesión.')
      return
    }
    const intento = [...sesion.map((p) => p.duracion_min), duracion]
    const prueba = cabe(tiempo, intento, PAUSA_ENTRE_MIN)
    if (!prueba.cabe) {
      setAvisoArmado(
        prueba.motivo ??
          'No cabe en el tiempo que queda, con la pausa incluida.',
      )
      return
    }
    setAvisoArmado(null)
    setSesion((actual) => [
      ...actual,
      {
        tmdb_id: c.item.tmdb_id,
        titulo: c.item.titulo,
        poster_url: c.item.poster_url,
        duracion_min: duracion,
      },
    ])
  }

  function quitar(tmdbId: number) {
    setAvisoArmado(null)
    setSesion((actual) => actual.filter((p) => p.tmdb_id !== tmdbId))
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setErrorGuardar(null)
    if (tiempo === null || !resultado?.cabe) {
      setErrorGuardar('Arma una sesión que quepa antes de guardar.')
      return
    }
    setGuardando(true)
    try {
      await guardarSesion({
        nombre,
        tiempoDisponibleMin: tiempo,
        peliculas: sesion,
      })
      setSesion([])
      setNombre('')
      setAvisoArmado(null)
      setErrorGuardar(null)
      setToast('Sesión guardada. Las películas siguen «por ver».')
      await cargarGuardadas()
    } catch (err) {
      setErrorGuardar(
        err instanceof Error ? err.message : 'No se pudo guardar la sesión.',
      )
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(id: number) {
    setErrorListado(null)
    try {
      await eliminarSesion(id)
      setToast('Sesión borrada.')
      await cargarGuardadas()
    } catch (err) {
      setErrorListado(
        err instanceof Error ? err.message : 'No se pudo borrar la sesión.',
      )
    }
  }

  return (
    <section className="noche-page">
      <p className="eyebrow">Función</p>
      <h1 className="noche-titulo">Noche de película</h1>
      <p className="noche-lead">
        Di cuántos minutos tienes. Solo entran películas «por ver» de tu lista.
        Entre una y la siguiente hay {PAUSA_ENTRE_MIN} minutos de pausa.
      </p>

      <form className="noche-tiempo" noValidate onSubmit={consultar}>
        <label
          className={`campo-linea noche-tiempo-caja${tiempoTexto ? ' has-value' : ''}`}
        >
          <span>Minutos libres</span>
          <span className="noche-tiempo-valor">
            <input
              type="number"
              inputMode="numeric"
              min={TIEMPO_MIN_PERMITIDO}
              max={TIEMPO_MAX_PERMITIDO}
              step={1}
              value={tiempoTexto}
              onChange={(e) => setTiempoTexto(e.target.value)}
              required
              aria-invalid={errorTiempo ? true : undefined}
              aria-describedby={errorTiempo ? 'error-tiempo' : undefined}
            />
            <span className="sello sello-amarillo" aria-hidden="true">
              min
            </span>
          </span>
        </label>
        <Boton type="submit" disabled={cargando}>
          {cargando ? 'Consultando…' : 'Qué cabe'}
        </Boton>
      </form>

      {errorTiempo ? (
        <p className="error" role="alert" id="error-tiempo">
          {errorTiempo}
        </p>
      ) : null}
      {cargando ? (
        <p className="mensaje-estado cinta">Consultando duraciones…</p>
      ) : null}
      {errorConsulta ? (
        <p className="error" role="alert">
          {errorConsulta}
        </p>
      ) : null}

      {consultado && tiempo !== null ? (
        <div className="noche-grid">
          <div>
            <h2>Cabida</h2>
            {cabida.length === 0 ? (
              <div className="estado-vacio">
                <p>
                  No hay películas «por ver» que quepan solas en {tiempo} min.
                </p>
              </div>
            ) : (
              <ul className="noche-lista">
                {cabida.map((c) => {
                  const enSesion = sesion.some(
                    (p) => p.tmdb_id === c.item.tmdb_id,
                  )
                  return (
                    <li key={c.item.id} className="noche-fila">
                      {c.item.poster_url ? (
                        <img src={c.item.poster_url} alt="" />
                      ) : (
                        <span className="noche-sin-poster" />
                      )}
                      <div>
                        <p className="noche-nombre">{c.item.titulo}</p>
                        <span className="sello sello-amarillo">
                          {c.duracion} min
                        </span>
                      </div>
                      <Boton
                        variante="primario"
                        disabled={enSesion}
                        onClick={() => agregar(c)}
                      >
                        {enSesion ? 'En la sesión' : 'Agregar'}
                      </Boton>
                    </li>
                  )
                })}
              </ul>
            )}

            {noDisponibles.length > 0 ? (
              <>
                <h2>No disponibles</h2>
                <ul className="noche-lista">
                  {noDisponibles.map((c) => (
                    <li key={c.item.id} className="noche-fila is-off">
                      {c.item.poster_url ? (
                        <img src={c.item.poster_url} alt="" />
                      ) : (
                        <span className="noche-sin-poster" />
                      )}
                      <div>
                        <p className="noche-nombre">{c.item.titulo}</p>
                        <span className="sello">
                          {textoSelloNoDisponible(c.duracion)}
                        </span>
                        <p className="noche-motivo">{c.motivo}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <aside className="noche-armado" aria-live="polite">
            <h2>Esta noche</h2>
            {resultado ? (
              <p className="noche-totales">
                <strong>{resultado.totalMin}</strong> min ocupados
                <span> · {resultado.pausasMin} min de pausas</span>
                <span> · quedan {resultado.restanteMin} min</span>
              </p>
            ) : null}
            {avisoArmado ? (
              <p className="error" role="alert">
                {avisoArmado}
              </p>
            ) : null}
            {sesion.length === 0 ? (
              <div className="estado-vacio">
                <p>Agrega una o varias películas que caben.</p>
              </div>
            ) : (
              <ol className="noche-lista">
                {sesion.map((p) => (
                  <li key={p.tmdb_id} className="noche-fila">
                    <div>
                      <p className="noche-nombre">{p.titulo}</p>
                      <span className="sello sello-amarillo">
                        {p.duracion_min} min
                      </span>
                    </div>
                    <Boton variante="peligro" onClick={() => quitar(p.tmdb_id)}>
                      Quitar
                    </Boton>
                  </li>
                ))}
              </ol>
            )}

            <form className="noche-guardar" onSubmit={guardar}>
              <label className={`campo-linea${nombre ? ' has-value' : ''}`}>
                <span>Nombre de la sesión</span>
                <input
                  type="text"
                  maxLength={80}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </label>
              {errorGuardar ? (
                <p className="error" role="alert">
                  {errorGuardar}
                </p>
              ) : null}
              <Boton type="submit" disabled={guardando || sesion.length === 0}>
                {guardando ? 'Guardando…' : 'Guardar noche'}
              </Boton>
            </form>
          </aside>
        </div>
      ) : null}

      <section className="noche-guardadas">
        <h2>Sesiones guardadas</h2>
        {cargandoGuardadas ? (
          <p className="mensaje-estado cinta">Cargando noches…</p>
        ) : null}
        {errorListado ? (
          <p className="error" role="alert">
            {errorListado}
          </p>
        ) : null}
        {!cargandoGuardadas && guardadas.length === 0 ? (
          <div className="estado-vacio">
            <p>Aún no hay noches guardadas.</p>
          </div>
        ) : (
          <ul className="noche-lista">
            {guardadas.map((s) => (
              <li key={s.id} className="noche-sesion">
                <div className="noche-sesion-cab">
                  <div>
                    <p className="noche-nombre">{s.nombre}</p>
                    <p className="noche-motivo">
                      {s.tiempo_disponible_min} min ·{' '}
                      {new Date(s.creada_en).toLocaleString('es-EC')}
                    </p>
                  </div>
                  <Boton variante="peligro" onClick={() => void borrar(s.id)}>
                    Borrar
                  </Boton>
                </div>
                <ol>
                  {s.peliculas.map((p) => (
                    <li key={p.id}>
                      {p.titulo} · {p.duracion_min} min
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </section>
  )
}
