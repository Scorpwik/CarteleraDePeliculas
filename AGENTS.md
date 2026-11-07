# Mi Cartelera — reglas del agente

Ninguna funcionalidad nueva sin spec en `docs/specs/`. Documentos antes que el código.

No reescribir E1 (login, registro, buscar, mi lista, detalle). Solo se añade un enlace y una ruta para E2.

Claves (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`) solo en variables de entorno. Nunca en el repo, commits ni README. No commitear `.env`. Nunca `service_role` en el frontend.

Lógica de negocio nueva en `src/dominio/`: funciones puras, sin red ni Supabase. Tests con Vitest.

Los componentes no llaman a Supabase ni a TMDB; lo hacen servicios en `src/lib/`. TypeScript sin `any`.

Estilos según `DESIGN.md`. No instalar Bootstrap. No reformatear `src/index.css`.

UI en español. Commits: la persona invoca `/commit`; un documento o ticket por commit; no push si no lo piden.

No alterar columnas de `mi_lista`.
