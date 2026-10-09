import type { DetalleTmdb, ResultadoBusqueda, Tipo } from '../types'

const BASE_URL = 'https://api.themoviedb.org/3'
export const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'
export const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185'

interface TmdbMultiItem {
  id: number
  media_type: string
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
}

interface TmdbSearchResponse {
  results: TmdbMultiItem[]
}

interface TmdbCastMember {
  name: string
  character: string
  profile_path?: string | null
}

interface TmdbDetalleResponse {
  title?: string
  name?: string
  overview?: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  credits?: {
    cast?: TmdbCastMember[]
  }
}

function apiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) {
    throw new Error('Falta VITE_TMDB_API_KEY en las variables de entorno')
  }
  return key
}

function mapaTipo(mediaType: string): Tipo | null {
  if (mediaType === 'movie') return 'pelicula'
  if (mediaType === 'tv') return 'serie'
  return null
}

function extraerAnio(fecha?: string): string | null {
  if (!fecha || fecha.length < 4) return null
  return fecha.slice(0, 4)
}

export function posterUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}${path}`
}

export function backdropUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BACKDROP_BASE}${path}`
}

export function profileUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${PROFILE_BASE}${path}`
}

function mapearMultiItem(item: TmdbMultiItem): ResultadoBusqueda | null {
  const tipo = mapaTipo(item.media_type)
  if (!tipo) return null

  const titulo = (item.title ?? item.name ?? '').trim()
  if (!titulo) return null

  const anio =
    tipo === 'pelicula'
      ? extraerAnio(item.release_date)
      : extraerAnio(item.first_air_date)

  return {
    tmdb_id: item.id,
    titulo,
    poster_url: posterUrl(item.poster_path),
    tipo_contenido: tipo,
    anio,
  }
}

export async function searchMulti(query: string): Promise<ResultadoBusqueda[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({
    api_key: apiKey(),
    language: 'es-ES',
    query: trimmed,
  })

  const res = await fetch(`${BASE_URL}/search/multi?${params}`)
  if (!res.ok) {
    throw new Error('No se pudo completar la búsqueda en TMDB')
  }

  const data: TmdbSearchResponse = await res.json()

  return data.results
    .map(mapearMultiItem)
    .filter((item): item is ResultadoBusqueda => item !== null)
}

export async function getTendencias(): Promise<ResultadoBusqueda[]> {
  const params = new URLSearchParams({
    api_key: apiKey(),
    language: 'es-ES',
  })

  const res = await fetch(`${BASE_URL}/trending/all/week?${params}`)
  if (!res.ok) {
    throw new Error('No se pudieron cargar las tendencias de TMDB')
  }

  const data: TmdbSearchResponse = await res.json()

  const mapped: ResultadoBusqueda[] = []
  for (const raw of data.results) {
    const item = mapearMultiItem(raw)
    if (!item) continue
    mapped.push({
      ...item,
      backdrop_url: backdropUrl(raw.backdrop_path),
    })
    if (mapped.length >= 12) break
  }
  return mapped
}

export async function getDetalle(
  tmdbId: number,
  tipo: Tipo,
): Promise<DetalleTmdb> {
  const segmento = tipo === 'pelicula' ? 'movie' : 'tv'
  const params = new URLSearchParams({
    api_key: apiKey(),
    language: 'es-ES',
    append_to_response: 'credits',
  })

  const res = await fetch(`${BASE_URL}/${segmento}/${tmdbId}?${params}`)
  if (!res.ok) {
    throw new Error('No se pudo cargar el detalle desde TMDB')
  }

  const data: TmdbDetalleResponse = await res.json()
  const titulo = (data.title ?? data.name ?? '').trim() || 'Sin título'
  const anio =
    tipo === 'pelicula'
      ? extraerAnio(data.release_date)
      : extraerAnio(data.first_air_date)

  const elenco = (data.credits?.cast ?? []).slice(0, 10).map((c) => ({
    nombre: c.name,
    personaje: c.character,
    foto_url: profileUrl(c.profile_path),
  }))

  return {
    titulo,
    anio,
    sinopsis: data.overview?.trim() || 'Sin sinopsis disponible.',
    calificacion_tmdb: Number((data.vote_average ?? 0).toFixed(1)),
    poster_url: posterUrl(data.poster_path),
    backdrop_url: backdropUrl(data.backdrop_path),
    elenco,
  }
}
