# Verificación E2 — Noche de película

Fecha de la primera pasada: 2026-11-07. App local: `http://localhost:5173/cartelera-de-peliculas/`. Tests de ese día: 9/9.

Pasada en el sitio publicado el 2026-11-11, sobre el commit `346a08b` (https://scorpwik.github.io/cartelera-de-peliculas/). Joshua confirmó que todo pasó:

- El campo de minutos, con vacío, 29, 601 y 90.5, muestra el aviso en español.
- Con un valor válido aparecen los sellos «No cabe» y «Sin duración».
- En Buscar, la barra queda visible al escribir.

Tests actuales: `npm test` 17/17 (entran 4 tests de T10 para C7, C9 y C10).

Pasada en navegador 19:13–19:19 (Confirm email desactivado; dos cuentas de prueba):

- `npm test`: **9/9 verde**.
- Lista de A: Star Wars (121), Matrix (138), Fight Club (139) por ver; Breaking Bad serie.
- Guardó «Maratón de sábado» (300 min, Star Wars + Matrix). Películas siguieron «por ver».
- Borró Matrix de mi lista: la sesión guardada siguió con Matrix 138 min.
- Cuenta B en `/#/noche`: «Aún no hay noches guardadas.»

Ajuste de código el 2026-11-11, sin pasada nueva en el navegador. Comandos de ese día: `npm test` 9/9, `npm run lint` sin errores y `npm run build` correcto. El build usó `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_TMDB_API_KEY` de relleno; no se llamó a Supabase ni a TMDB.

- Sello de «No disponibles»: «Sin duración» solo si no hay runtime. Si la película dura más que el rato, el sello dice «No cabe · N min» y el párrafo de abajo sigue con el motivo. Confirmado en el sitio publicado el 2026-11-11 (commit `346a08b`).
- Minutos: el formulario lleva `noValidate`. Vacío, 29, 601 y 90.5 los rechaza `tiempoDisponibleValido`, con el texto «Indica un número entero de minutos entre 30 y 600.», y no consultan. Confirmado en el sitio publicado el 2026-11-11. El 2026-11-07 el 29 mostraba el globo del navegador en inglés.
- Lint: `Layout` pone `cerrando` en falso durante el render si ya no hay sesión. La lista de noches guardadas se pide al montar y el estado cambia cuando la consulta responde. No se reprobó el logout ni esa lista en el navegador.

Arreglos posteriores del 2026-11-10, sin pasada nueva en el navegador. Comandos: `npm test` 13/13 (entran 4 tests de `mensajesAuth`), `npm run lint` sin errores y `npm run build` correcto.

- `93ff445`: login y registro muestran los errores de Supabase en español con `mensajeErrorAuth` (credenciales incorrectas, correo ya registrado, fallo de conexión). Cubierto por tests; no se miró en pantalla.
- `40517a2`: si Supabase no responde en 5 s, `AuthContext` deja de cargar y trata al usuario como sin sesión. Revisado en código.
- `3cad644`: en Buscar, al enfocar la barra el hero se encoge; al terminar esa transición la página baja para dejar la barra bajo el menú fijo. Confirmado en el sitio publicado el 2026-11-11 (commit `346a08b`): la barra queda visible al escribir.
- Prueba por API contra la base viva (no en navegador): con dos cuentas de prueba, B no pudo leer, cambiar ni borrar `mi_lista`, `sesiones` ni `sesion_peliculas` de A, y su insert en la sesión de A dio 403. `anon` leyó 0 filas. A no pudo hacer UPDATE de su sesión, porque no hay política UPDATE. Las filas temporales se borraron.

| Id | Qué se prueba | Resultado esperado | Resultado obtenido |
|----|---------------|--------------------|--------------------|
| C1 | Logueado abre Noche de película | Ve la pantalla y el campo de minutos | **Cumple.** Título, lead, minutos (120 por defecto), Qué cabe, sesiones |
| C2 | Sin sesión va a `/#/noche` | Redirige a login; no hay nav de Noche | **Cumple.** 2026-11-07, Chromium: URL `/#/login` |
| C3 | Tiempo 30 y 600 | Acepta y consulta | **Cumple en dominio** (tests). UI: 300 acepta y consulta |
| C4 | 29, 601, 90.5, vacío | No consulta; explica rango 30–600 | **Cumple.** Sitio publicado, 2026-11-11, commit `346a08b`: vacío, 29, 601 y 90.5 muestran el aviso en español. |
| C5 | Películas por ver que caben | Salen con duración, orden ascendente | **Cumple.** 121 / 138 / 139 min (Star Wars, Matrix, Fight Club) |
| C6 | Serie o película más larga que el rato | No salen como candidatas | **Cumple.** Breaking Bad no aparece en Cabida |
| C7 | Sin duración TMDB | No disponible, con motivo, no se agrega | **Cumple.** Tests de T10: sin duración (también 0 o negativa) queda no disponible con motivo y no se agrega; sello «Sin duración». Sitio publicado, 2026-11-11, commit `346a08b`: con un valor válido aparece el sello «Sin duración». |
| C8 | Mientras pide TMDB | Cinta «Consultando duraciones…» | **Cumple.** Texto y botón Consultando… |
| C9 | Un título falla TMDB | Ese no disponible; el resto sigue | **Cumple en tests (T10).** Se fuerza el fallo de un título: queda no disponible con «No se pudo consultar la duración en TMDB.» y el resto sigue en cabida. |
| C10 | Fallo general | Error y se puede reintentar | **Cumple en tests (T10).** Un fallo general (p. ej. `listar`) devuelve el mensaje de error y no clasifica títulos. La pantalla muestra `errorConsulta` y el formulario sigue disponible para reintentar. |
| C11 | Agregar una | Total = su duración, 0 pausas | **Cumple.** Star Wars: 121 ocupados · 0 pausas · 179 quedan |
| C12 | Agregar segunda | Total suma + 10 min de pausa | **Cumple.** 269 ocupados · 10 pausas · 31 quedan |
| C13 | No cabe en lo que queda | No agrega y explica | **Cumple.** Fight Club: «La suma de duraciones y pausas supera el tiempo disponible.» |
| C14 | Agregar duplicada | No se duplica | **Cumple.** Botón «En la sesión» deshabilitado |
| C15 | Quitar | Recalcula total y restante | **Cumple.** Quitar Matrix → 121 · 0 pausas · 179 |
| C16 | Ocupa exactamente el tiempo | Cabe, restante 0 | **Cumple en dominio.** Test «exactamente el tiempo» |
| C17 | Agregar sin duración | No entra, hay motivo | **Cumple en tests (T10 y dominio).** Sin duración no entra a cabida y `cabe` la rechaza con motivo. El sello «Sin duración» se vio en el sitio publicado el 2026-11-11. |
| C18 | Guardar sesión válida | Persiste; películas siguen por ver | **Cumple.** Toast; «Maratón de sábado» en listado. Mi lista: 4 por ver |
| C19 | Vacía o nombre inválido | No guarda | **Cumple.** Nombre `required`: no envía el form |
| C20 | Listar propias | Nombre, fecha, detalle | **Cumple.** Nombre, 300 min, fecha, Star Wars 121 + Matrix 138 |
| C21 | Borrar propia | Desaparece; no hay edición | **Cumple.** «Noche prueba A» desaparece; no hay editar |
| C22 | Usuario B no ve las de A | RLS aísla | **Cumple.** B: «Aún no hay noches guardadas.» Cliente B: `sesiones []`. Repetido por API el 2026-11-10 con `mi_lista`, `sesiones` y `sesion_peliculas` |
| C23 | Quitar de mi lista una de la sesión | La sesión guardada sigue igual | **Cumple.** Matrix fuera de mi lista; sesión sigue con Matrix 138 |
| D1–D10 | DESIGN.md | Ver criterios de diseño | **Cumple en pantalla.** Papel, display, botones, sello 121 MIN (7 nov) y sellos «No cabe» / «Sin duración» (11 nov, sitio publicado), vacío VACÍO, sin Bootstrap |
| E1 | Login, buscar, mi lista | Siguen existiendo | **Cumple.** Login, buscar, mi lista, detalle. Layout: `cerrando` se resetea al quedar sin sesión |

C16 (ocupación exacta) sigue cubierto por tests de dominio; no se armó en la UI un caso que cierre en 0. C9 y C10 se fuerzan en los tests de T10, no en el navegador (haría falta cortar TMDB o `listar`).

El 2026-11-11, en el sitio publicado (commit `346a08b`), Joshua confirmó el aviso en español de los minutos (C4), los sellos «No cabe» y «Sin duración», y que en Buscar la barra queda visible al escribir.
