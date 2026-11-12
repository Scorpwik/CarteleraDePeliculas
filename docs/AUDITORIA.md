# Auditoría E2 — Noche de película

Cada criterio de la spec y del backlog. Estados: cumple / no cumple / sin verificar. Evidencia en repo o en `docs/VERIFICACION.md`.

Pasada 2026-11-07 19:19 con SQL aplicado, Confirm email desactivado y dos cuentas en el navegador.

Revisión de código el 2026-11-11, sin navegador: `npm test` 9/9, `npm run lint` y `npm run build` en verde. El detalle está en `docs/VERIFICACION.md`.

Arreglos del 2026-11-10, entonces sin navegador: `npm test` 13/13, `npm run lint` y `npm run build` en verde. RLS repetido por API con dos cuentas.

Pasada en el sitio publicado el 2026-11-11, sobre el commit `346a08b`. Joshua confirmó que todo pasó: vacío, 29, 601 y 90.5 muestran el aviso en español; con un valor válido aparecen los sellos «No cabe» y «Sin duración»; en Buscar la barra queda visible al escribir. Tests actuales: 17/17 (T10 cubre C7, C9 y C10).

## Spec (S1–S19)

| Id | Estado | Evidencia |
|----|--------|-----------|
| S1 | cumple | `/noche` está dentro de `RutaProtegida`. C2: sin sesión redirige a login |
| S2 | cumple | `tiempoDisponibleValido` con `noValidate`. Sitio publicado, 2026-11-11, commit `346a08b`: vacío, 29, 601 y 90.5 muestran el aviso en español. |
| S3 | cumple (código) | Con `noValidate` el submit llega a `consultar` y sale antes si el tiempo no es válido. No consulta. |
| S4 | cumple | C5: películas por ver, orden 121 / 138 / 139 |
| S5 | cumple | C6: Breaking Bad no entra a Cabida |
| S6 | cumple | Tests de T10 (sin duración, 0, negativa, error de un título, más larga que el rato). Sitio publicado, 2026-11-11: sellos «Sin duración» y «No cabe». |
| S7 | cumple | C8: cinta «Consultando duraciones…» |
| S8 | cumple | `cabe` / `totalSesion`; tests de dominio en verde (13/13 en total); C11–C13 en UI |
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
| C4 | cumple | Sitio publicado, 2026-11-11, commit `346a08b`: vacío, 29, 601 y 90.5 muestran el aviso en español. |
| C5–C6 | cumple | Cabida ordenada; serie excluida |
| C7 | cumple | Tests de T10 y sello «Sin duración» en el sitio publicado el 2026-11-11. |
| C8 | cumple | Cinta de carga |
| C9–C10 | cumple (tests T10) | Se fuerza el fallo de un título y el fallo general; mensajes y clasificación comprobados. |
| C11–C15 | cumple | Armado, pausa, rechazo, duplicado, quitar |
| C16 | cumple (tests) | ocupación exacta |
| C17 | cumple (tests T10) | Sin duración no entra a cabida; `cabe` la rechaza. Sello visto el 2026-11-11. |
| C18–C23 | cumple | Guardar, listar, borrar, RLS dos cuentas, snapshot |

## Diseño D1–D10

| Id | Estado | Evidencia |
|----|--------|-----------|
| D1 | cumple | `.noche-page` fondo papel; display en h1 |
| D2 | cumple | `campo-linea` minutos y nombre |
| D3 | cumple | `mensaje-estado cinta` |
| D4 | cumple | clase `error` en el rechazo de cabida (visto el 2026-11-07) y en el aviso de minutos (código, 2026-11-11) |
| D5 | cumple | Candidatas: sello de minutos, 2026-11-07. No disponibles: «Sin duración» y «No cabe · N min» vistos en el sitio publicado el 2026-11-11 (commit `346a08b`). |
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
| Historial docs → código | cumple | commits harness → estado → DESIGN → PRD → backlog → spec → T1…T6 → verificación. T7–T13 quedan registrados en `docs/backlog/tickets.md`; T10 añade tests de C7, C9 y C10 |
| README explica épica, pruebas y harness | cumple | Sección «Harness del agente»: `AGENTS.md`, `CLAUDE.md` importa `@AGENTS.md`, `/commit` con `disable-model-invocation`, hook `PostToolUse` en `.claude/settings.json`, `npm test` y `npm run lint` |
| `.env` no en git | cumple | `git check-ignore`; historial sin claves |
| E1 no reescrito | cumple | Login/Buscar/MiLista/Titulo siguen; `getDetalle` igual. Layout resetea `cerrando` en el render si no hay sesión |
| SQL aplicado en Supabase de la cartelera | cumple | tablas existen; save/list/delete en UI |
| RLS demostrado con dos cuentas | cumple | C22 en navegador (2026-11-07) y por API (2026-11-10) |
| Rotación de claves en paneles | sin verificar | Acción de Joshua; historial git ya estaba limpio |

## Arreglos posteriores a la épica

Quedaron registrados después, con ticket retroactivo (el id no está en el commit original porque el arreglo se hizo antes de abrir el ticket):

| Ticket | Commit | Qué arregla | Estado |
|--------|--------|-------------|--------|
| T7 | `93ff445` | Errores de login y registro en español (`src/dominio/mensajesAuth.ts` con tests) | cumple (tests); no se miró en pantalla. No tiene spec de épica: es un arreglo de E1 |
| T8 | `40517a2` | La sesión deja de cargar si Supabase no responde en 5 s | cumple (código) |
| T9 | `3cad644` | En Buscar, la barra queda a la vista al escribir | cumple. Sitio publicado, 2026-11-11, commit `346a08b` |
| T11 | `6846565` | El sello de no disponibles distingue «Sin duración» y «No cabe · N min» | cumple. Sitio publicado, 2026-11-11 |
| T12 | `143db02` | El tiempo disponible se valida en español (`noValidate`) | cumple. Sitio publicado, 2026-11-11 |
| T13 | `054ecb7` | Evitar setState síncrono que rompía el lint | cumple (`npm run lint`) |
| T10 | (este cierre) | Tests que fuerzan C7, C9 y C10, con la clasificación en el dominio | cumple: 17/17 en `npm test` |

## Pendientes (con razón)

1. **C16 en la UI** no se armó un caso que cierre exactamente en 0 minutos restantes. Está cubierto por tests de dominio.
2. **Rotar anon/TMDB y secrets de Actions** si Joshua sigue sospechando la cuenta; el repo público no tenía `.env`.
3. **Errores de login y registro en español (T7) y el timeout de Auth (T8)** están cubiertos por tests o código; no se reabrieron en el navegador el 2026-11-11.

La épica está especificada e implementada. La pasada del 2026-11-07 la demostró contra la base viva. El 2026-11-11, en el sitio publicado (commit `346a08b`), Joshua confirmó el aviso de minutos, los sellos de no disponibles y el scroll de Buscar. C7, C9 y C10 quedaron forzados en los tests de T10.
