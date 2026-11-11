# Verificación E2 — Noche de película

Fecha: 2026-11-07. App local: `http://localhost:5173/cartelera-de-peliculas/`. Tests: `npm test` (9/9).

Pasada en navegador 19:13–19:19 (Confirm email desactivado; dos cuentas de prueba):

- `npm test`: **9/9 verde**.
- Lista de A: Star Wars (121), Matrix (138), Fight Club (139) por ver; Breaking Bad serie.
- Guardó «Maratón de sábado» (300 min, Star Wars + Matrix). Películas siguieron «por ver».
- Borró Matrix de mi lista: la sesión guardada siguió con Matrix 138 min.
- Cuenta B en `/#/noche`: «Aún no hay noches guardadas.»

Ajuste de código el 2026-11-11, sin pasada nueva en el navegador. Comandos de ese día: `npm test` 9/9, `npm run lint` sin errores y `npm run build` correcto. El build usó `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_TMDB_API_KEY` de relleno; no se llamó a Supabase ni a TMDB.

- Sello de «No disponibles»: «Sin duración» solo si no hay runtime. Si la película dura más que el rato, el sello dice «No cabe · N min» y el párrafo de abajo sigue con el motivo. No se miró en pantalla.
- Minutos: el formulario lleva `noValidate`. Vacío, 29, 601 y 90.5 los rechaza `tiempoDisponibleValido`, con el texto «Indica un número entero de minutos entre 30 y 600.», y no consultan. El 2026-11-07 el 29 mostraba el globo del navegador en inglés.
- Lint: `Layout` pone `cerrando` en falso durante el render si ya no hay sesión. La lista de noches guardadas se pide al montar y el estado cambia cuando la consulta responde. No se reprobó el logout ni esa lista en el navegador.

| Id | Qué se prueba | Resultado esperado | Resultado obtenido |
|----|---------------|--------------------|--------------------|
| C1 | Logueado abre Noche de película | Ve la pantalla y el campo de minutos | **Cumple.** Título, lead, minutos (120 por defecto), Qué cabe, sesiones |
| C2 | Sin sesión va a `/#/noche` | Redirige a login; no hay nav de Noche | **Cumple.** 2026-11-07, Chromium: URL `/#/login` |
| C3 | Tiempo 30 y 600 | Acepta y consulta | **Cumple en dominio** (tests). UI: 300 acepta y consulta |
| C4 | 29, 601, 90.5, vacío | No consulta; explica rango 30–600 | **Cumple en código (2026-11-11).** `noValidate` y `tiempoDisponibleValido`: aviso en español y no consulta. La pasada del 2026-11-07 vio el globo nativo en inglés para 29. No se reabrió en el navegador. |
| C5 | Películas por ver que caben | Salen con duración, orden ascendente | **Cumple.** 121 / 138 / 139 min (Star Wars, Matrix, Fight Club) |
| C6 | Serie o película más larga que el rato | No salen como candidatas | **Cumple.** Breaking Bad no aparece en Cabida |
| C7 | Sin duración TMDB | No disponible, con motivo, no se agrega | **Cumple en dominio.** UI del 2026-11-07: no había título sin runtime. El sello ya no dice «Sin duración» si el runtime existe y la película no cabe. No se volvió a abrir en el navegador. |
| C8 | Mientras pide TMDB | Cinta «Consultando duraciones…» | **Cumple.** Texto y botón Consultando… |
| C9 | Un título falla TMDB | Ese no disponible; el resto sigue | Sin forzar fallo de red. Código: catch por título |
| C10 | Fallo general | Error y se puede reintentar | Sin forzar fallo de `listar()`. Código: `errorConsulta` |
| C11 | Agregar una | Total = su duración, 0 pausas | **Cumple.** Star Wars: 121 ocupados · 0 pausas · 179 quedan |
| C12 | Agregar segunda | Total suma + 10 min de pausa | **Cumple.** 269 ocupados · 10 pausas · 31 quedan |
| C13 | No cabe en lo que queda | No agrega y explica | **Cumple.** Fight Club: «La suma de duraciones y pausas supera el tiempo disponible.» |
| C14 | Agregar duplicada | No se duplica | **Cumple.** Botón «En la sesión» deshabilitado |
| C15 | Quitar | Recalcula total y restante | **Cumple.** Quitar Matrix → 121 · 0 pausas · 179 |
| C16 | Ocupa exactamente el tiempo | Cabe, restante 0 | **Cumple en dominio.** Test «exactamente el tiempo» |
| C17 | Agregar sin duración | No entra, hay motivo | **Cumple en dominio.** UI no ejercida |
| C18 | Guardar sesión válida | Persiste; películas siguen por ver | **Cumple.** Toast; «Maratón de sábado» en listado. Mi lista: 4 por ver |
| C19 | Vacía o nombre inválido | No guarda | **Cumple.** Nombre `required`: no envía el form |
| C20 | Listar propias | Nombre, fecha, detalle | **Cumple.** Nombre, 300 min, fecha, Star Wars 121 + Matrix 138 |
| C21 | Borrar propia | Desaparece; no hay edición | **Cumple.** «Noche prueba A» desaparece; no hay editar |
| C22 | Usuario B no ve las de A | RLS aísla | **Cumple.** B: «Aún no hay noches guardadas.» Cliente B: `sesiones []` |
| C23 | Quitar de mi lista una de la sesión | La sesión guardada sigue igual | **Cumple.** Matrix fuera de mi lista; sesión sigue con Matrix 138 |
| D1–D10 | DESIGN.md | Ver criterios de diseño | **Cumple en pantalla.** Papel, display, botones, sello 121 MIN, vacío VACÍO, sin Bootstrap |
| E1 | Login, buscar, mi lista | Siguen existiendo | **Cumple.** Login, buscar, mi lista, detalle. Layout: `cerrando` se resetea al quedar sin sesión |

Criterios no forzados en UI (C7, C9, C10, C16 exacto, C17): cubiertos por tests de dominio o por código; no se simuló TMDB caído. El aviso en español de C4 y el sello de «No disponibles» se revisaron en código el 2026-11-11, no en el navegador.
