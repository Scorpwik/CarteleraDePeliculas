import { cabe } from '../dominio/sesion'
import type { PeliculaEnSesion, PeliculaParaSesion, SesionGuardada } from '../types'
import { supabase } from './supabase'

interface SesionRow {
  id: number
  user_id: string
  nombre: string
  tiempo_disponible_min: number
  creada_en: string
}

interface SesionPeliculaRow {
  id: number
  sesion_id: number
  tmdb_id: number
  titulo: string
  poster_url: string | null
  duracion_min: number
  orden: number
}

function mensajeError(error: { code?: string; message: string }): string {
  if (error.code === '42501') {
    return 'No puedes ver ni cambiar las sesiones de otro usuario'
  }
  return error.message
}

function filaPelicula(row: SesionPeliculaRow): PeliculaEnSesion {
  return {
    id: row.id,
    sesion_id: row.sesion_id,
    tmdb_id: row.tmdb_id,
    titulo: row.titulo,
    poster_url: row.poster_url,
    duracion_min: row.duracion_min,
    orden: row.orden,
  }
}

export async function guardarSesion(input: {
  nombre: string
  tiempoDisponibleMin: number
  peliculas: PeliculaParaSesion[]
}): Promise<SesionGuardada> {
  const nombre = input.nombre.trim()
  if (nombre.length < 1 || nombre.length > 80) {
    throw new Error('El nombre debe tener entre 1 y 80 caracteres')
  }
  if (input.peliculas.length === 0) {
    throw new Error('No se puede guardar una sesión vacía')
  }

  const duraciones = input.peliculas.map((p) => p.duracion_min)
  const resultado = cabe(input.tiempoDisponibleMin, duraciones)
  if (!resultado.cabe) {
    throw new Error(resultado.motivo ?? 'La sesión no cabe en el tiempo disponible')
  }

  const { data: sesion, error: errorSesion } = await supabase
    .from('sesiones')
    .insert({
      nombre,
      tiempo_disponible_min: input.tiempoDisponibleMin,
    })
    .select()
    .single()

  if (errorSesion || !sesion) {
    throw new Error(mensajeError(errorSesion ?? { message: 'No se pudo guardar la sesión' }))
  }

  const fila = sesion as SesionRow
  const filas = input.peliculas.map((peli, orden) => ({
    sesion_id: fila.id,
    tmdb_id: peli.tmdb_id,
    titulo: peli.titulo,
    poster_url: peli.poster_url,
    duracion_min: peli.duracion_min,
    orden,
  }))

  const { data: peliculas, error: errorPelis } = await supabase
    .from('sesion_peliculas')
    .insert(filas)
    .select()

  if (errorPelis) {
    await supabase.from('sesiones').delete().eq('id', fila.id)
    throw new Error(mensajeError(errorPelis))
  }

  return {
    id: fila.id,
    user_id: fila.user_id,
    nombre: fila.nombre,
    tiempo_disponible_min: fila.tiempo_disponible_min,
    creada_en: fila.creada_en,
    peliculas: ((peliculas ?? []) as SesionPeliculaRow[])
      .map(filaPelicula)
      .sort((a, b) => a.orden - b.orden),
  }
}

export async function listarSesiones(): Promise<SesionGuardada[]> {
  const { data, error } = await supabase
    .from('sesiones')
    .select('*, sesion_peliculas(*)')
    .order('creada_en', { ascending: false })

  if (error) {
    throw new Error(mensajeError(error))
  }

  const filas = (data ?? []) as Array<SesionRow & { sesion_peliculas?: SesionPeliculaRow[] }>

  return filas.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    nombre: row.nombre,
    tiempo_disponible_min: row.tiempo_disponible_min,
    creada_en: row.creada_en,
    peliculas: (row.sesion_peliculas ?? [])
      .map(filaPelicula)
      .sort((a, b) => a.orden - b.orden),
  }))
}

export async function eliminarSesion(id: number): Promise<void> {
  const { error } = await supabase.from('sesiones').delete().eq('id', id)
  if (error) {
    throw new Error(mensajeError(error))
  }
}
