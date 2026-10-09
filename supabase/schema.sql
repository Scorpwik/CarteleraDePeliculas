-- Esquema de referencia: tabla mi_lista + políticas RLS
-- Ejecutar en el SQL Editor de Supabase (o via CLI) al configurar el proyecto.

create table public.mi_lista (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  tipo_contenido text not null check (tipo_contenido in ('pelicula', 'serie')),
  titulo text not null,
  poster_path text,
  estado text not null default 'por_ver' check (estado in ('por_ver', 'viendo', 'vista')),
  calificacion_personal integer check (
    calificacion_personal is null
    or (calificacion_personal between 1 and 5)
  ),
  comentario text,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, tipo_contenido)
);

alter table public.mi_lista enable row level security;

create policy "mi_lista_select_own"
  on public.mi_lista
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mi_lista_insert_own"
  on public.mi_lista
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mi_lista_update_own"
  on public.mi_lista
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mi_lista_delete_own"
  on public.mi_lista
  for delete
  to authenticated
  using (auth.uid() = user_id);
