# Estado inicial — Mi Cartelera Personal

Documento escrito antes de la épica E2 (Noche de película). Describe el Proyecto 3 tal como está. La deuda se registra; no se corrige aquí.

## Qué hace hoy

Una SPA para llevar una cartelera personal de películas y series. El usuario se registra o inicia sesión, busca títulos reales en TMDB, los guarda en su lista y les pone estado (`por_ver`, `viendo`, `vista`), calificación 1–5 y comentario. Nadie ve ni modifica la lista de otro: la tabla `mi_lista` tiene RLS.

Pantallas:

| Ruta | Qué es | Acceso |
|------|--------|--------|
| `/login`, `/registro` | Correo y contraseña (Supabase Auth) | Público |
| `/` | Home: hero de tendencias, búsqueda TMDB, muro de carteles | Protegido |
| `/mi-lista` | Lista propia: filtro por estado, orden, contadores | Protegido |
| `/titulo/:id` | Detalle editable de un ítem de la lista | Protegido |
| `/explorar/:tipo/:tmdbId` | Detalle de lectura desde TMDB | Protegido |

El enrutado es `HashRouter` (`src/App.tsx`) para GitHub Pages. Las rutas privadas pasan por `RutaProtegida`. La sesión vive en `AuthContext`.

## Stack real (no el de la consigna de E2)

- React 19.2 + TypeScript + Vite 8.3
- react-router-dom 7.18 (`HashRouter`, `base: /cartelera-de-peliculas/`)
- TMDB v3 en `src/lib/tmdb.ts`: `searchMulti`, `getTendencias`, `getDetalle` (sinopsis, elenco, póster; **no** `runtime`)
- Supabase Auth + PostgreSQL. Cliente en `src/lib/supabase.ts`. Lista en `src/lib/lista.ts`
- Estilos: CSS plano en `src/index.css`. **No hay Bootstrap.** Tipografías Anton, DM Sans, Instrument Serif
- Animación: GSAP 3.15, Lenis, preloader, grain, cursor custom
- Tests: ninguno. No hay Vitest ni carpeta `src/dominio/`
- Prettier: no estaba; el harness lo añade sin reformatear el CSS legado
- Publicación: GitHub Pages (Actions + secrets `VITE_*`)

La consigna de E2 asume Bootstrap. Este proyecto no lo usa. E2 reutiliza los tokens y componentes actuales (`DESIGN.md`).

## Datos

Tabla `public.mi_lista` (referencia en `supabase/schema.sql`; la tabla viva está en el proyecto Supabase y **no se le cambian columnas**):

- `id`, `user_id` (uuid, default `auth.uid()`), `tmdb_id`, `titulo`, `poster_url`
- `tipo_contenido`: `pelicula` | `serie`
- `estado`: `por_ver` | `viendo` | `vista` (default `por_ver`)
- `calificacion_personal` 1–5 o null, `comentario`, `fecha_agregado`
- único `(user_id, tmdb_id, tipo_contenido)`
- RLS: select/insert/update/delete solo si `auth.uid() = user_id`

El frontend no filtra por `user_id` en las consultas: confía en RLS.

## Inconsistencias

1. **Capas mezcladas.** `Login.tsx` llama a `supabase.auth` directo. `Buscar`, `MiLista` y `Titulo` importan `lista.ts` y `tmdb.ts`. No hay frontera componente / servicio. E2 no copia este patrón.
2. **Sin dominio puro.** La regla de «cabe» no existe. No hay tests.
3. **`getDetalle` no trae duración.** TMDB sí la tiene (`runtime` en película). Hoy no se mapea.
4. **Series y películas conviven.** E2 solo usa películas `por_ver`. Las series de la lista no entran en una noche.
5. **Casts `as ItemLista`** en `lista.ts`. No hay `any`, pero el cliente de Supabase no está tipado con filas generadas.
6. **Tokens de radio en 0 y botones pastilla.** `--radius-*` es 0 (cartel impreso); `.btn` usa `border-radius: 999px`. No es un bug; hay que respetar ambos.
7. **`schema.sql` es copia**, no la fuente de verdad de producción.

## Riesgos

- Repo público: [Scorpwik/cartelera-de-peliculas](https://github.com/Scorpwik/cartelera-de-peliculas). Historial revisado: `.env` nunca se commiteó; no hay JWT ni `service_role` en git. Las claves `VITE_*` sí viajan en el bundle de Pages; la defensa de datos es RLS, no esconder la `anon`.
- Borrar el repo de GitHub no se hace con la clave `anon`. Eso pide la cuenta de GitHub. Rotar `anon`/publishable, TMDB y revisar sesiones de GitHub es acción de Joshua en los paneles, fuera de git. Actualizar `.env` local y los secrets de Actions. Nunca `service_role` en el frontend.
- Si RLS se desactiva, cualquiera con la `anon` del bundle lee `mi_lista`.
- Rate limit de TMDB si E2 pide el detalle de muchos `por_ver` a la vez.
- GitHub Pages es estático: no hay backend propio.

## Deuda (pendiente, no se corrige ahora)

- [ ] Extraer las llamadas de Auth fuera de las páginas de login/registro
- [ ] Tipar el cliente de Supabase (sin `as ItemLista`)
- [ ] `getDetalle` no expone `runtime` (E2 lo cubre con una función nueva, sin cambiar el contrato actual)
- [ ] No hay tests del Proyecto 3
- [ ] La consigna pide Bootstrap; el proyecto usa CSS propio
- [ ] `schema.sql` puede divergir de la tabla viva
- [ ] Login y registro no tienen confirmación de correo (desactivada para desarrollo)
- [ ] Claves `VITE_*` visibles en el JS publicado; rotación pendiente en paneles

## Qué no se toca al construir E2

Login, registro, buscar, mi lista, detalle, `mi_lista`, el contrato de `getDetalle`, el CSS legado y las animaciones de E1 siguen igual. Solo se suma la pantalla Noche de película.
