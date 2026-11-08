# Auditoría E2 — Noche de película

Cada criterio de la spec y del backlog. Estados: cumple / no cumple / sin verificar. Evidencia en repo o en `docs/VERIFICACION.md`.

Pasada 2026-11-07 19:19 con SQL aplicado, Confirm email desactivado y dos cuentas en el navegador.

## Spec (S1–S19)

| Id | Estado | Evidencia |
|----|--------|-----------|
| S1 | cumple | `/noche` está dentro de `RutaProtegida`. C2: sin sesión redirige a login |
| S2 | cumple | `tiempoDisponibleValido` y form `min/max/step=1`. C4: 29 bloqueado |
| S3 | cumple | `consultar` no corre si el tiempo no es válido. C4 en UI |
| S4 | cumple | C5: películas por ver, orden 121 / 138 / 139 |
| S5 | cumple | C6: Breaking Bad no entra a Cabida |
| S6 | cumple (código) | Motivo de TMDB vacío, 0, error o más larga que el rato |
| S7 | cumple | C8: cinta «Consultando duraciones…» |
| S8 | cumple | `cabe` / `totalSesion`; tests 9/9; C11–C13 en UI |
| S9 | cumple | Test ocupación exacta |
| S10 | cumple | C13: Fight Club no entra; aviso de suma+pausas |
| S11 | cumple | C14: «En la sesión» |
| S12 | cumple | C19: nombre vacío no envía; servicio rechaza 1–80 |
| S13 | cumple | C20: título, duración y orden en la sesión guardada |
| S14 | cumple | C18: mi lista sigue en «por ver» tras guardar |
| S15 | cumple | SQL aplicado. Sin política UPDATE. C21 borra; no hay editar |
| S16 | cumple | C22: B no ve «Maratón de sábado» de A |
| S17 | cumple | `src/dominio/sesion.ts`, sin fetch ni supabase |
| S18 | cumple | Sin `any`. `NocheDePelicula.tsx` no importa `supabase.ts` |
| S19 | cumple | D1–D10 en pantalla con sesión; sin Bootstrap |

## Backlog C1–C23

| Id | Estado | Evidencia |
|----|--------|-----------|
| C1 | cumple | VERIFICACION.md, 2026-11-07 19:13 |
| C2 | cumple | VERIFICACION.md |
| C3 | cumple (tests + UI 300) | `sesion.test.ts` + consulta 300 min |
| C4 | cumple (29 en UI; resto dominio) | Native min=30 |
| C5–C6 | cumple | Cabida ordenada; serie excluida |
| C7 | cumple (dominio); UI sin título huérfano | — |
| C8 | cumple | Cinta de carga |
| C9–C10 | código alineado; no se forzó fallo de red | — |
| C11–C15 | cumple | Armado, pausa, rechazo, duplicado, quitar |
| C16 | cumple (tests) | ocupación exacta |
| C17 | cumple (tests) | duración desconocida |
| C18–C23 | cumple | Guardar, listar, borrar, RLS dos cuentas, snapshot |

## Diseño D1–D10

| Id | Estado | Evidencia |
|----|--------|-----------|
| D1 | cumple | `.noche-page` fondo papel; display en h1 |
| D2 | cumple | `campo-linea` minutos y nombre |
| D3 | cumple | `mensaje-estado cinta` |
| D4 | cumple | clase `error` en el rechazo de cabida |
| D5 | cumple | sello de minutos en candidatas |
| D6 | cumple | `Boton` primario / peligro |
| D7 | cumple | `estado-vacio` «Aún no hay noches guardadas» |
| D8 | cumple | grep: no hay clases Bootstrap en `src/` |
| D9 | cumple | enlace en nav escritorio y móvil |
| D10 | cumple | `.noche-totales` con `--display` |

## Harness y proceso

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| AGENTS.md ≤ 40 líneas, ninguna funcionalidad sin spec | cumple | 17 líneas |
| CLAUDE.md importa AGENTS.md | cumple | `@AGENTS.md` |
| Skill `/commit` con `disable-model-invocation` | cumple | `.claude/skills/commit/SKILL.md` |
| Hook PostToolUse Prettier | cumple | `.claude/settings.json` + hook node; ignora `src/index.css` |
| Historial docs → código | cumple | commits harness → estado → DESIGN → PRD → backlog → spec → T1…T6 → verificación |
| `.env` no en git | cumple | `git check-ignore`; historial sin claves |
| E1 no reescrito | cumple | Login/Buscar/MiLista/Titulo siguen; `getDetalle` igual. Layout solo resetea `cerrando` si no hay sesión |
| SQL aplicado en Supabase de la cartelera | cumple | tablas existen; save/list/delete en UI |
| RLS demostrado con dos cuentas | cumple | C22 en navegador |
| Rotación de claves en paneles | sin verificar | Acción de Joshua; historial git ya estaba limpio |

## Pendientes (con razón)

1. **C9/C10/C7/C16 en UI** no se forzaron (haría falta TMDB caído o un título sin runtime, o un tiempo que cierre exacto). Dominio cubierto.
2. **Rotar anon/TMDB y secrets de Actions** si Joshua sigue sospechando la cuenta; el repo público no tenía `.env`.

La épica está especificada, implementada y demostrada de punta a punta contra la base viva.
