# Auditoría E2 — Noche de película

Cada criterio de la spec y del backlog. Estados: cumple / no cumple / sin verificar. Evidencia en repo o en `docs/VERIFICACION.md`.

Lo que no cumple o no se verificó se deja pendiente aquí, no se disimula. Corrección de arriba hacia abajo: primero el SQL en el proyecto de esta cartelera, después la pasada en el navegador con dos cuentas.

## Spec (S1–S19)

| Id | Estado | Evidencia |
|----|--------|-----------|
| S1 | cumple | `/noche` está dentro de `RutaProtegida`. C2: sin sesión redirige a login |
| S2 | cumple (dominio) | `tiempoDisponibleValido` y form `min/max/step=1`. UI del rechazo: sin verificar |
| S3 | cumple (código) | `consultar` returnea si el tiempo no es válido. UI: sin verificar |
| S4 | cumple (código) | Filtro `pelicula` + `por_ver`; orden duración luego título |
| S5 | cumple (código) | Las series no entran al filtro |
| S6 | cumple (código) | Motivo de TMDB vacío, 0, error o más larga que el rato |
| S7 | cumple (código) | Cinta de carga y `errorConsulta`. UI: sin verificar |
| S8 | cumple | `cabe` / `totalSesion`; tests 9/9 |
| S9 | cumple | Test ocupación exacta |
| S10 | cumple (código + test) | `agregar` usa `cabe` antes de mutar |
| S11 | cumple (código) | `sesion.some(tmdb_id)` |
| S12 | cumple (código) | `guardarSesion` rechaza vacío y nombre fuera de 1–80 |
| S13 | cumple (código) | Insert copia título, póster, tmdb_id, duración, orden |
| S14 | cumple (código) | `guardarSesion` no llama a `lista.ts` ni actualiza `mi_lista` |
| S15 | cumple (SQL en repo) | No hay política UPDATE. **Aplicación en el proyecto: no cumple aún** (`PGRST205`) |
| S16 | sin verificar | Políticas escritas; no se demostró con dos cuentas |
| S17 | cumple | `src/dominio/sesion.ts`, sin fetch ni supabase |
| S18 | cumple | Sin `any`. `NocheDePelicula.tsx` no importa `supabase.ts`; TMDB solo vía `getDuracionPelicula` |
| S19 | cumple (código) | D1–D10 en clases y componentes; sin Bootstrap. Aspecto con sesión: sin verificar |

## Backlog C1–C23

| Id | Estado | Evidencia |
|----|--------|-----------|
| C1 | sin verificar | Hace falta cuenta con correo confirmado |
| C2 | cumple | VERIFICACION.md, navegador 2026-11-07 |
| C3 | cumple (tests); UI sin verificar | `sesion.test.ts` |
| C4 | cumple (tests); UI sin verificar | ídem |
| C5–C15 | sin verificar en UI | Código alineado a la spec |
| C16 | cumple (tests) | ocupación exacta |
| C17 | cumple (tests) | duración desconocida |
| C18–C23 | sin verificar | Tabla `sesiones` no creada en el proyecto de la app |

## Diseño D1–D10

| Id | Estado | Evidencia |
|----|--------|-----------|
| D1 | cumple (código) | `.noche-page` fondo papel; `h1.noche-titulo` usa display global |
| D2 | cumple (código) | `campo-linea` para minutos y nombre |
| D3 | cumple (código) | `mensaje-estado cinta` |
| D4 | cumple (código) | clase `error` |
| D5 | cumple (código) | `sello` «Sin duración» + motivo |
| D6 | cumple (código) | `Boton` primario / peligro |
| D7 | cumple (código) | `estado-vacio` |
| D8 | cumple | grep: no hay clases Bootstrap en `src/` |
| D9 | cumple (código) | enlace en nav escritorio y móvil |
| D10 | cumple (código) | `.noche-totales` con `--display` |

## Harness y proceso

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| AGENTS.md ≤ 40 líneas, ninguna funcionalidad sin spec | cumple | 17 líneas |
| CLAUDE.md importa AGENTS.md | cumple | `@AGENTS.md` |
| Skill `/commit` con `disable-model-invocation` | cumple | `.claude/skills/commit/SKILL.md` |
| Hook PostToolUse Prettier | cumple | `.claude/settings.json` + hook node; ignora `src/index.css` |
| Historial docs → código | cumple | commits harness → estado → DESIGN → PRD → backlog → spec → T1…T6 → verificación |
| `.env` no en git | cumple | `git check-ignore`; historial sin claves |
| E1 no reescrito | cumple | Login/Buscar/MiLista/Titulo siguen; `getDetalle` igual |
| SQL aplicado en Supabase de la cartelera | no cumple | `sesiones` no está en el schema cache |
| RLS demostrado con dos cuentas | sin verificar | — |
| Rotación de claves en paneles | sin verificar | Acción de Joshua; historial git ya estaba limpio |

## Pendientes (con razón)

1. **Aplicar `supabase/sesiones.sql`** en el SQL Editor del proyecto que usa `VITE_SUPABASE_URL`. No se aplicó porque el MCP autenticado es otro proyecto (PaginaWebMaribel) y no hay CLI. No se tocó ese otro proyecto.
2. **Pasada en el navegador con sesión** (C1, C5–C15, C18–C21, C23) cuando el correo se pueda confirmar o se desactive Confirm email.
3. **C22 con dos cuentas**, después del punto 1.
4. **Rotar anon/TMDB y secrets de Actions** si Joshua sigue sospechando la cuenta; el repo público no tenía `.env`.

Hasta esos cuatro, la épica está especificada e implementada en código; no está demostrada de punta a punta contra la base viva.
