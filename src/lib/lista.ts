import { supabase } from './supabase'
import type { ActualizacionLista, ItemLista, NuevoItemLista, Tipo } from '../types'

function mensajeError(error: { code?: string; message: string }): string {
  if (error.code === '23505') {
    return 'Este título ya está en tu lista'
  }
  return error.message
}

export async function agregar(item: NuevoItemLista): Promise<ItemLista> {
  const { data, error } = await supabase
    .from('mi_lista')
    .insert({
      tmdb_id: item.tmdb_id,
      tipo_contenido: item.tipo_contenido,
      titulo: item.titulo,
      poster_url: item.poster_url,
      estado: item.estado ?? 'por_ver',
    })
    .select()
    .single()

  if (error) {
    throw new Error(mensajeError(error))
  }

  return data as ItemLista
}

export async function listar(): Promise<ItemLista[]> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('*')
    .order('fecha_agregado', { ascending: false })

  if (error) {
    throw new Error(mensajeError(error))
  }

  return (data ?? []) as ItemLista[]
}

export async function actualizar(
  id: number,
  campos: ActualizacionLista,
): Promise<ItemLista> {
  const { data, error } = await supabase
    .from('mi_lista')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(mensajeError(error))
  }

  return data as ItemLista
}

export async function eliminar(id: number): Promise<void> {
  const { error } = await supabase.from('mi_lista').delete().eq('id', id)

  if (error) {
    throw new Error(mensajeError(error))
  }
}

export async function obtener(id: number): Promise<ItemLista | null> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(mensajeError(error))
  }

  return (data as ItemLista | null) ?? null
}

export async function obtenerPorTmdb(
  tipo: Tipo,
  tmdbId: number,
): Promise<ItemLista | null> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('*')
    .eq('tipo_contenido', tipo)
    .eq('tmdb_id', tmdbId)
    .maybeSingle()

  if (error) {
    throw new Error(mensajeError(error))
  }

  return (data as ItemLista | null) ?? null
}

export async function listarClavesGuardadas(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('tmdb_id, tipo_contenido')

  if (error) {
    throw new Error(mensajeError(error))
  }

  return new Set(
    (data ?? []).map(
      (row: { tmdb_id: number; tipo_contenido: string }) =>
        `${row.tipo_contenido}:${row.tmdb_id}`,
    ),
  )
}

export function claveItem(tipo: string, tmdbId: number): string {
  return `${tipo}:${tmdbId}`
}
