export type Estado = 'por_ver' | 'viendo' | 'vista'
export type Tipo = 'pelicula' | 'serie'

export interface ItemLista {
  id: number
  user_id: string
  tmdb_id: number
  titulo: string
  poster_url: string | null
  tipo_contenido: Tipo
  estado: Estado
  calificacion_personal: number | null
  comentario: string | null
  fecha_agregado: string
}

export interface NuevoItemLista {
  tmdb_id: number
  tipo_contenido: Tipo
  titulo: string
  poster_url: string | null
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
  backdrop_url: string | null
  elenco: CreditoElenco[]
}
