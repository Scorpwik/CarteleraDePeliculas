# Verificación E2 — Noche de película

Fecha: 2026-11-07. App local: `http://localhost:5173/CarteleraDePeliculas/`. Tests: `npm test` (9/9).

Pendiente de Joshua en paneles (no se puede hacer desde el repo):

1. Pegar `supabase/sesiones.sql` en el SQL Editor del proyecto de **esta** cartelera. Desde aquí se comprobó `PGRST205`: `public.sesiones` aún no existe. El MCP de Supabase de esta máquina apunta a otro proyecto y no se usó.
2. Confirmar correo (o desactivar Confirm email) para poder entrar con una cuenta de prueba. El registro de `nocheverif.a.1107@gmail.com` respondió «Email not confirmed».
3. Repetir C1 y C5–C23 con sesión iniciada, y C22 con una segunda cuenta.

| Id | Qué se prueba | Resultado esperado | Resultado obtenido |
|----|---------------|--------------------|--------------------|
| C1 | Logueado abre Noche de película | Ve la pantalla y el campo de minutos | Sin verificar: hace falta cuenta confirmada |
| C2 | Sin sesión va a `/#/noche` | Redirige a login; no hay nav de Noche | **Cumple.** 2026-11-07, Chromium del agente: URL acaba en `/#/login`. Formulario «Iniciar sesión». Sin enlace Noche |
| C3 | Tiempo 30 y 600 | Acepta y consulta | Parcial: dominio `tiempoDisponibleValido(30/600)` true (`npm test`). UI sin verificar |
| C4 | 29, 601, 90.5, vacío | No consulta; explica rango 30–600 | Parcial: tests de dominio en verde. UI sin verificar |
| C5 | Películas por ver que caben | Salen con duración, orden ascendente | Sin verificar (hace falta lista + TMDB + login) |
| C6 | Serie o película más larga que el rato | No salen como candidatas | Sin verificar |
| C7 | Sin duración TMDB | No disponible, con motivo, no se agrega | Parcial: test «película sin duración». UI sin verificar |
| C8 | Mientras pide TMDB | Cinta «Consultando duraciones…» | Sin verificar en navegador |
| C9 | Un título falla TMDB | Ese no disponible; el resto sigue | Sin verificar |
| C10 | Fallo general | Error y se puede reintentar | Sin verificar |
| C11 | Agregar una | Total = su duración, 0 pausas | Parcial: test una sola película. UI sin verificar |
| C12 | Agregar segunda | Total suma + 10 min de pausa | Parcial: test exacto 60+50+10=120. UI sin verificar |
| C13 | No cabe en lo que queda | No agrega y explica | Parcial: test suma+pausas > tiempo. UI sin verificar |
| C14 | Agregar duplicada | No se duplica | Sin verificar (lógica en la página) |
| C15 | Quitar | Recalcula total y restante | Sin verificar |
| C16 | Ocupa exactamente el tiempo | Cabe, restante 0 | **Cumple en dominio.** Test «exactamente el tiempo». UI sin verificar |
| C17 | Agregar sin duración | No entra, hay motivo | **Cumple en dominio.** UI sin verificar |
| C18 | Guardar sesión válida | Persiste; películas siguen por ver | Sin verificar: tabla `sesiones` no existe aún |
| C19 | Vacía o nombre inválido | No guarda | Parcial: el servicio rechaza vacío y nombre; UI/SQL sin verificar |
| C20 | Listar propias | Nombre, fecha, detalle | Sin verificar (tabla ausente) |
| C21 | Borrar propia | Desaparece; no hay edición | Sin verificar |
| C22 | Usuario B no ve las de A | RLS aísla | Sin verificar: hacen falta dos cuentas confirmadas y el SQL aplicado |
| C23 | Quitar de mi lista una de la sesión | La sesión guardada sigue igual | Sin verificar |
| D1–D10 | DESIGN.md | Ver criterios de diseño | Parcial: código usa `noche-page` sobre papel, `campo-linea`, `mensaje-estado cinta`, `error`, `sello`, `Boton`, `estado-vacio`, nav gemela, totales en display. Sin clases Bootstrap. Comprobado en código; aspecto con sesión, pendiente |
| E1 | Login, buscar, mi lista | Siguen existiendo | **Cumple.** Login y registro se ven. Rutas de E1 no se borraron |

## Cómo terminar la columna

Con el SQL aplicado y una cuenta que pueda entrar: abrir `/#/noche`, probar 29 y 120, consultar, armar, guardar, cerrar sesión, entrar con otra cuenta y confirmar que la noche de A no aparece.
