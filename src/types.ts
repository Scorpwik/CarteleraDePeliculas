export type Estado = 'por_ver' | 'viendo' | 'vista'
export type Tipo = 'pelicula' | 'serie'

export interface ItemLista {
  id: string
  user_id: string
  tmdb_id: number
  tipo_contenido: Tipo
  titulo: string
  poster_path: string | null
  estado: Estado
  calificacion_personal: number | null
  comentario: string | null
  created_at: string
}

export interface NuevoItemLista {
  tmdb_id: number
  tipo_contenido: Tipo
  titulo: string
  poster_path: string | null
  estado?: Estado
}

export interface ActualizacionLista {
  estado?: Estado
  calificacion_personal?: number | null
  comentario?: string | null
}

export interface ResultadoBusqueda {
  tmdb_id: number
  titulo: string
  poster_path: string | null
  poster_url: string | null
  tipo_contenido: Tipo
  anio: string | null
}

export interface CreditoElenco {
  nombre: string
  personaje: string
}

export interface DetalleTmdb {
  titulo: string
  anio: string | null
  sinopsis: string
  calificacion_tmdb: number
  poster_url: string | null
  elenco: CreditoElenco[]
}
