# Auditoría E2 — Noche de película

Cada criterio de la spec (S1–S19), del backlog (C1–C23), de diseño (D1–D10) y de los 7 de la rúbrica. Estados: cumple / no cumple / sin verificar. Evidencia en repo o en `docs/VERIFICACION.md`. Lo que no se cerró del todo está en «Pendientes (con razón)».

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
| S8 | cumple | `cabe` / `totalSesion`; tests de dominio en verde (17/17 en total); C11–C13 en UI |
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

Cada criterio, con su evidencia. El detalle de la pasada está en `docs/VERIFICACION.md`.

| Id | Estado | Evidencia |
|----|--------|-----------|
| C1 | cumple | 2026-11-07: logueado ve la pantalla y el campo de minutos |
| C2 | cumple | 2026-11-07, sin sesión: redirige a `/#/login` |
| C3 | cumple | Tests de dominio (30 y 600). UI: 300 el 2026-11-07; un valor válido el 2026-11-11 en el sitio publicado |
| C4 | cumple | Sitio publicado, 2026-11-11, commit `346a08b`: vacío, 29, 601 y 90.5 muestran el aviso en español |
| C5 | cumple | 2026-11-07: cabida ordenada 121 / 138 / 139 min |
| C6 | cumple | 2026-11-07: Breaking Bad (serie) no entra a Cabida |
| C7 | cumple | Tests de T10 y sello «Sin duración» en el sitio publicado el 2026-11-11 |
| C8 | cumple | 2026-11-07: cinta «Consultando duraciones…» |
| C9 | cumple (tests T10) | Se fuerza el fallo de un título: queda no disponible y el resto sigue |
| C10 | cumple (tests T10) | Un fallo general devuelve el mensaje de error y no clasifica títulos; el formulario sigue para reintentar |
| C11 | cumple | 2026-11-07: una película, 0 pausas (Star Wars 121) |
| C12 | cumple | 2026-11-07: al agregar la segunda se suman 10 min de pausa (269 ocupados) |
| C13 | cumple | 2026-11-07: Fight Club no entra; aviso de suma + pausas |
| C14 | cumple | 2026-11-07: botón «En la sesión» deshabilitado, no se duplica |
| C15 | cumple | 2026-11-07: al quitar Matrix el total vuelve a 121, 0 pausas |
| C16 | cumple (tests) | Ocupación exacta en `sesion.test.ts`. No se armó en la UI un caso con restante 0; ver Pendientes |
| C17 | cumple (tests T10) | Sin duración no entra a cabida; `cabe` la rechaza. Sello «Sin duración» el 2026-11-11 |
| C18 | cumple | 2026-11-07: guardó «Maratón de sábado»; las películas siguieron «por ver» |
| C19 | cumple | 2026-11-07: nombre vacío no envía el formulario |
| C20 | cumple | 2026-11-07: listado con nombre, 300 min, fecha y detalle (Star Wars 121 + Matrix 138) |
| C21 | cumple | 2026-11-07: borrar la propia la quita; no hay editar |
| C22 | cumple | 2026-11-07 en navegador (B no ve las de A) y 2026-11-10 por API, dos cuentas |
| C23 | cumple | 2026-11-07: Matrix fuera de mi lista; la sesión guardada sigue con Matrix 138 |

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

## Rúbrica del profesor (7 criterios)

Cada criterio de la rúbrica, con evidencia en este documento o en el repo.

| Criterio | Puntos | Estado | Evidencia |
|----------|--------|--------|-----------|
| Harness y entendimiento del proyecto | 10 | cumple | `AGENTS.md` tiene 17 líneas, apunta a la spec y registra las reglas de claves. `ESTADO-INICIAL.md` describe el Proyecto 3 y la deuda heredada. Skill `/commit` y hook de Prettier presentes. Ver «Harness y proceso». |
| Especificación: PRD, historias y criterios | 20 | cumple | `docs/prd/prd.md` cubre E1 y E2, con no-alcance y los cinco puntos decididos y justificados. Historias INVEST en `docs/backlog/historias.md`. Criterios DADO / CUANDO / ENTONCES (C1–C23). Refinamiento con aceptados y rechazados. |
| Specs y tickets | 15 | cumple | `docs/specs/e2-noche-de-pelicula.md`: datos, RLS, dominio, servicios, componentes, DEBE / NO DEBE y las dos tablas de trazabilidad. Tickets T1–T13 con tipo, DoD y dependencias. Cada criterio tiene verificación asignada. |
| Funcionalidad de la épica y seguridad | 25 | cumple | Requisitos de la sección C en C1–C23 y S1–S16. La regla «cabe» respeta las decisiones del cliente (tests y pasadas del 7 y el 11 de noviembre). RLS con dos cuentas. Claves solo en variables de entorno. E1 sigue funcionando. |
| Dominio, tests y calidad de código | 10 | cumple | Función pura en `src/dominio/sesion.ts`. `npm test` 17/17, con los bordes pedidos y T10 (C7, C9, C10). Sin `any`. En E2 los componentes no importan el cliente de Supabase; usan servicios. |
| Diseño: DESIGN.md e interfaz | 10 | cumple | `DESIGN.md` documenta el sistema real (CSS propio, sin Bootstrap; eso está justificado en ESTADO-INICIAL). Brand board en `docs/diseno/brand-board.html`. D1–D10 cumplidos; la pantalla es coherente con el resto de la app. |
| Verificación, auditoría y proceso | 10 | cumple | `docs/VERIFICACION.md` llenado por el estudiante (pasadas del 7 y del 11 de noviembre). Esta auditoría tiene evidencia. El historial va documentos antes que código y un commit por ticket (T1–T6; T7–T13 quedan registrados). La demo responde la pausa: C11 (0 pausas) y C12 (10 minutos al agregar la segunda). |

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
