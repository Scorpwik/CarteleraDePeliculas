# Mi Cartelera Personal

Aplicación web para buscar películas y series (TMDB), guardarlas en una lista personal y llevar el seguimiento de su estado, calificación y comentarios. La autenticación y la persistencia se gestionan con Supabase; el aislamiento de datos por usuario se aplica con Row Level Security (RLS).

## Tecnologías y herramientas

### Core

| Uso | Tecnología |
|-----|------------|
| UI | React 19 |
| Tipado | TypeScript |
| Bundler / dev server | Vite 8 |
| Enrutamiento | React Router DOM 7 |
| Auth + base de datos | Supabase (`@supabase/supabase-js`) |
| Catálogo de cine/TV | API TMDB v3 |
| Estilos | CSS plano (`src/index.css`), tokens en `:root` |
| Tipografías | Google Fonts — **Anton** (titulares condensados), **Instrument Serif** (cursiva de acento), **DM Sans** (texto) |
| Motion | **GSAP** + `@gsap/react` (`useGSAP`, ScrollTrigger, Flip) |
| Scroll suave | **Lenis** (integrado con ScrollTrigger) |

### Dependencias de producción

- `react` / `react-dom`
- `react-router-dom`
- `@supabase/supabase-js`
- `gsap` / `@gsap/react`
- `lenis`

### Dependencias de desarrollo

- `vite`, `@vitejs/plugin-react`
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- `eslint`, `@eslint/js`, `typescript-eslint`
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `globals`

### APIs y servicios externos

- **Supabase Auth** — registro / login / sesión / logout (`signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange`)
- **Supabase Postgres** — tabla `mi_lista` con RLS
- **TMDB v3**
  - `GET /search/multi` — búsqueda
  - `GET /trending/all/week` — tendencias (home)
  - `GET /movie/:id` o `/tv/:id` con `append_to_response=credits` — detalle, elenco, póster, backdrop y `profile_path`
  - Imágenes: `w500` (póster), `w1280` (backdrop), `w185` (perfil de elenco)

### APIs del navegador (complemento a GSAP / Lenis)

- **View Transitions API** — transiciones de ruta y póster compartido (`viewTransition` en React Router)
- **IntersectionObserver** — revelados al entrar en viewport
- **`matchMedia`** — `prefers-reduced-motion`, `(hover: hover)` y breakpoints
- **Pointer Events** — drag con inercia en el carrusel de elenco
- **`requestAnimationFrame`** — progreso de scroll, contador animado, marquee reactivo

## Instalación

```bash
npm install
```

Crea un archivo `.env` a partir de `.env.example` y completa las variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TMDB_API_KEY=
```

> Nunca uses la clave `service_role` en el frontend. Solo la clave anónima (`anon` / publishable).  
> El `.env` está en `.gitignore`; no subas credenciales al repositorio.

### Scripts npm

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | `tsc -b` + build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | ESLint |

Arranca el servidor de desarrollo:

```bash
npm run dev
```

### Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el SQL Editor, ejecuta el esquema de referencia: [`supabase/schema.sql`](./supabase/schema.sql).
3. Copia la URL del proyecto y la clave `anon` al `.env`.
4. Activa Auth por email/password.

### Configurar TMDB

1. Crea una cuenta en [TMDB](https://www.themoviedb.org/) y solicita una API key (v3).
2. Ponla en `VITE_TMDB_API_KEY`.

## Funcionalidades

- **Acceso controlado** — Login, Registro; rutas protegidas; logout visible con sesión
- **Búsqueda TMDB** — resultados con póster, título y año; estados de carga / error / vacío
- **Tendencias** — hero rotativo + rail horizontal pinned (desktop) / snap (móvil)
- **Agregar a mi lista** — insert en Supabase `mi_lista` (no en TMDB)
- **CRUD** — leer, actualizar (estado, calificación 1–5, comentario) y eliminar
- **Estados tipados** — `Estado`: `'por_ver' \| 'viendo' \| 'vista'`; `Tipo`: `'pelicula' \| 'serie'`
- **Detalle** — póster, backdrop, sinopsis pinned, elenco arrastrable, boleto de valoración
- **Extras** — filtro segmentado, orden toggle, FLIP al reordenar, contador resumen animado
- **RLS** — el frontend no filtra ni envía `user_id`; lo asigna `auth.uid()` en la BD

### UI / motion

- Dirección de arte **«cartel de estreno impreso»**: papel hueso, tinta, sala oscura, acento naranja-tomate y amarillo mantequilla
- Tipografía de alto contraste: Anton + Instrument Serif + DM Sans
- Lenis + ScrollTrigger (scroll suave, pin, parallax, scrub)
- GSAP Flip en Mi lista; Ken Burns / clip-path en hero; tilt 3D y duotono en tarjetas
- Preloader de sesión, cortina de ruta, cursor personalizado (solo `hover: hover`)
- Marquee reactivo al scroll; footer con crédito TMDB obligatorio
- Respeto a `prefers-reduced-motion` y reducción de efectos en móvil (≤390px)

## Estructura del proyecto

```
cartelera/
├── .env.example
├── index.html                 # Anton + Instrument Serif + DM Sans
├── package.json
├── supabase/
│   └── schema.sql             # tabla + políticas RLS (referencia)
├── docs/capturas/             # imágenes del README
└── src/
    ├── main.tsx               # StrictMode + LenisRoot
    ├── App.tsx                # rutas
    ├── index.css              # tokens + estilos + motion
    ├── types.ts               # Estado, Tipo, ItemLista, TMDB, etc.
    ├── context/
    │   └── AuthContext.tsx
    ├── lib/
    │   ├── supabase.ts
    │   ├── tmdb.ts            # searchMulti, getTendencias, getDetalle
    │   └── lista.ts
    ├── hooks/
    │   ├── useScrollProgress.ts
    │   ├── useInView.ts
    │   ├── useParallaxOffset.ts
    │   ├── useMotionPrefs.ts
    │   └── useCanHover.ts
    ├── components/
    │   ├── Layout.tsx         # nav, progreso, footer, cleanup ST
    │   ├── LenisRoot.tsx
    │   ├── Preloader.tsx
    │   ├── CustomCursor.tsx
    │   ├── RouteCurtain.tsx
    │   ├── FooterCartelera.tsx
    │   ├── HeroCartelera.tsx
    │   ├── MarqueeScroll.tsx
    │   ├── TendenciasRail.tsx
    │   ├── TarjetaTitulo.tsx
    │   ├── ElencoCarousel.tsx
    │   ├── TextEffects.tsx
    │   ├── ScrambleLink.tsx
    │   ├── AuthPosterWall.tsx
    │   ├── RutaProtegida.tsx
    │   ├── Estrellas.tsx
    │   ├── Toast.tsx
    │   ├── ContadorAnimado.tsx
    │   ├── SkeletonPoster.tsx
    │   └── Reveal.tsx
    └── pages/
        ├── Login.tsx
        ├── Registro.tsx
        ├── Buscar.tsx         # /
        ├── MiLista.tsx        # /mi-lista
        └── Titulo.tsx         # /titulo/:id y /explorar/:tipo/:tmdbId
```

### Rutas

| Ruta | Pantalla | Acceso |
|------|----------|--------|
| `/login` | Login | Público (redirige si hay sesión) |
| `/registro` | Registro | Público (redirige si hay sesión) |
| `/` | Buscar / Home | Autenticado |
| `/mi-lista` | Mi lista | Autenticado |
| `/titulo/:id` | Detalle (id de `mi_lista`) | Autenticado |
| `/explorar/:tipo/:tmdbId` | Detalle lectura TMDB | Autenticado |
| `*` | Redirige a `/` | — |

## Esquema de la tabla `mi_lista`

Referencia completa en [`supabase/schema.sql`](./supabase/schema.sql).

```sql
create table public.mi_lista (
  id bigint generated by default as identity primary key,
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  tmdb_id integer,
  titulo text,
  poster_url text,
  tipo_contenido text check (tipo_contenido in ('pelicula', 'serie')),
  estado text check (estado in ('por_ver', 'viendo', 'vista')),
  calificacion_personal integer check (
    calificacion_personal is null
    or (calificacion_personal between 1 and 5)
  ),
  comentario text,
  fecha_agregado timestamptz default now(),
  unique (user_id, tmdb_id, tipo_contenido)
);
```

## Políticas RLS

```sql
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
```

El cliente no filtra por `user_id`: la seguridad la garantiza RLS. En los `insert`, `user_id` lo asigna la base de datos con `auth.uid()`.

## App publicada

[URL de la app publicada — placeholder]

## Capturas de pantalla

### Login

![Captura de login](./docs/capturas/login.png)

### Buscador

![Captura del buscador](./docs/capturas/buscador.png)

### Mi lista

![Captura de mi lista](./docs/capturas/mi-lista.png)

### Detalle

![Captura del detalle](./docs/capturas/detalle.png)
