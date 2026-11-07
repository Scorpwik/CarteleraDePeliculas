import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Boton } from '../components/Boton'
import {
  PAUSA_ENTRE_MIN,
  TIEMPO_MAX_PERMITIDO,
  TIEMPO_MIN_PERMITIDO,
  cabe,
  duracionConocida,
  tiempoDisponibleValido,
} from '../dominio/sesion'
import { listar } from '../lib/lista'
import { getDuracionPelicula } from '../lib/tmdb'
import type { ItemLista, PeliculaParaSesion } from '../types'

interface Candidata {
  item: ItemLista
  duracion: number | null
  motivo: string | null
}

function compararCandidatas(a: Candidata, b: Candidata): number {
  const da = a.duracion ?? Number.POSITIVE_INFINITY
  const db = b.duracion ?? Number.POSITIVE_INFINITY
  if (da !== db) return da - db
  return a.item.titulo.localeCompare(b.item.titulo, 'es')
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
            try {
              const duracion = await getDuracionPelicula(item.tmdb_id)
              if (!duracionConocida(duracion)) {
                return {
                  item,
                  duracion: null,
                  motivo: 'TMDB no tiene duración para este título.',
                }
              }
              if (duracion > minutos) {
                return {
                  item,
                  duracion,
                  motivo: `Dura ${duracion} min: no cabe en ${minutos} min.`,
                }
              }
              return { item, duracion, motivo: null }
            } catch {
              return {
                item,
                duracion: null,
                motivo: 'No se pudo consultar la duración en TMDB.',
              }
            }
          }),
        )

        const si = evaluadas
          .filter((c) => c.motivo === null && duracionConocida(c.duracion))
          .sort(compararCandidatas)
        const no = evaluadas.filter((c) => c.motivo !== null).sort(compararCandidatas)

        setCabida(si)
        setNoDisponibles(no)
        setSesion((actual) =>
          actual.filter((p) =>
            si.some((c) => c.item.tmdb_id === p.tmdb_id),
          ),
        )
        setConsultado(true)
      } catch (err) {
        setErrorConsulta(
          err instanceof Error
            ? err.message
            : 'No se pudieron consultar las duraciones.',
        )
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
        prueba.motivo ?? 'No cabe en el tiempo que queda, con la pausa incluida.',
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

  return (
    <section className="noche-page">
      <p className="eyebrow">E2</p>
      <h1 className="noche-titulo">Noche de película</h1>
      <p className="noche-lead">
        Di cuántos minutos tienes. Solo entran películas «por ver» de tu lista.
        Entre una y la siguiente hay {PAUSA_ENTRE_MIN} minutos de pausa.
      </p>

      <form className="noche-tiempo" onSubmit={consultar}>
        <label className={`campo-linea${tiempoTexto ? ' has-value' : ''}`}>
          <span>Minutos libres</span>
          <input
            type="number"
            inputMode="numeric"
            min={TIEMPO_MIN_PERMITIDO}
            max={TIEMPO_MAX_PERMITIDO}
            step={1}
            value={tiempoTexto}
            onChange={(e) => setTiempoTexto(e.target.value)}
            required
          />
        </label>
        <Boton type="submit" disabled={cargando}>
          {cargando ? 'Consultando…' : 'Qué cabe'}
        </Boton>
      </form>

      {errorTiempo ? <p className="error">{errorTiempo}</p> : null}
      {cargando ? (
        <p className="mensaje-estado cinta">Consultando duraciones…</p>
      ) : null}
      {errorConsulta ? <p className="error">{errorConsulta}</p> : null}

      {consultado && tiempo !== null ? (
        <div className="noche-grid">
          <div>
            <h2>Cabida</h2>
            {cabida.length === 0 ? (
              <div className="estado-vacio">
                <p>No hay películas «por ver» que quepan solas en {tiempo} min.</p>
              </div>
            ) : (
              <ul className="noche-lista">
                {cabida.map((c) => {
                  const enSesion = sesion.some((p) => p.tmdb_id === c.item.tmdb_id)
                  return (
                    <li key={c.item.id} className="noche-fila">
                      {c.item.poster_url ? (
                        <img src={c.item.poster_url} alt="" />
                      ) : (
                        <span className="noche-sin-poster" />
                      )}
                      <div>
                        <p className="noche-nombre">{c.item.titulo}</p>
                        <span className="sello sello-amarillo">{c.duracion} min</span>
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
                        <span className="sello">Sin duración</span>
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
            {avisoArmado ? <p className="error">{avisoArmado}</p> : null}
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
                      <span className="sello sello-amarillo">{p.duracion_min} min</span>
                    </div>
                    <Boton variante="peligro" onClick={() => quitar(p.tmdb_id)}>
                      Quitar
                    </Boton>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      ) : null}
    </section>
  )
}
