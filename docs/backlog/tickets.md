# Tickets — E2

Un commit por ticket, id en el mensaje. Código después de la spec.

## T1 — Dominio: cabe

- Tipo: dominio / test
- Depende de: spec
- DoD: función pura en `src/dominio/` que recibe tiempo, duraciones y pausa; sin red ni Supabase. Vitest en verde para ocupación exacta, una sola película (sin pausa), película sin duración, tiempo fuera de rango. TypeScript sin `any`.

## T2 — Persistencia de sesiones y RLS

- Tipo: datos
- Depende de: spec
- DoD: SQL aplicado en el proyecto Supabase (tablas de sesión y de películas de la sesión, RLS de select/insert/delete propias). No hay política de update. No se tocan columnas de `mi_lista`. El archivo SQL del repo coincide con lo aplicado.

## T3 — Duración desde TMDB

- Tipo: servicio
- Depende de: T1
- DoD: servicio que pide el detalle de película y expone `runtime`. Clave solo por `VITE_TMDB_API_KEY`. `getDetalle` no cambia de contrato. Duración ausente o no positiva se trata como desconocida.

## T4 — Servicio de sesiones

- Tipo: servicio
- Depende de: T2
- DoD: alta, listado con detalle y baja de sesiones del usuario. Los componentes no importan el cliente de Supabase. Guardar no escribe en `mi_lista`.

## T5 — Pantalla: qué cabe y armar

- Tipo: interfaz
- Depende de: T1, T3, T4 (T4 solo para no romper imports de tipos; la persistencia se usa en T6)
- DoD: ruta protegida `/noche`, enlace en la nav. Tiempo validado. Candidatas y no disponibles. Carga y error. Agregar/quitar, total con pausas, restante. Si no cabe, no agrega y explica. Fiel a DESIGN.md (D1–D10). Sin llamadas directas a Supabase ni TMDB desde el JSX más allá de los servicios.

## T6 — Guardar y consultar

- Tipo: interfaz
- Depende de: T4, T5
- DoD: guardar con nombre, listar sesiones propias con detalle, borrar la propia. Películas siguen «por ver». Criterios C18–C23 cubiertos en verificación posterior.

## T7 — Errores de login y registro en español

- Tipo: dominio / test
- Depende de: E1 (ya construida)
- Problema: los errores de Supabase salían en inglés o con textos técnicos.
- Criterio: la interfaz va en español (AGENTS.md). No es un ticket de E2; es un arreglo de E1.
- Commit que lo resolvió: `93ff445`
- Definition of Done: `mensajeErrorAuth` en `src/dominio/mensajesAuth.ts`, usado por login y registro. Tests en verde.
- Evidencia: `src/dominio/mensajesAuth.test.ts` (4 tests).

## T8 — La sesión deja de cargar si Supabase no responde

- Tipo: interfaz
- Depende de: E1 (ya construida)
- Problema: si Supabase no respondía, la app se quedaba cargando la sesión.
- Criterio: el usuario puede seguir (queda sin sesión) en vez de un cargando infinito.
- Commit que lo resolvió: `40517a2`
- Definition of Done: `AuthContext` corta la espera a 5 segundos y trata al usuario como sin sesión.
- Evidencia: `src/context/AuthContext.tsx`.

## T9 — En Buscar, la barra queda a la vista al escribir

- Tipo: interfaz
- Depende de: E1 (ya construida)
- Problema: al enfocar o enviar la búsqueda, el scroll ocultaba la barra.
- Criterio: el usuario tiene que ver lo que escribe en el buscador.
- Commit que lo resolvió: `3cad644`
- Definition of Done: al enfocar o enviar, la página baja para dejar el formulario bajo el menú fijo.
- Evidencia: `src/pages/Buscar.tsx`. Pasada en el sitio publicado el 2026-11-11 (commit `346a08b`): la barra queda visible al escribir.

## T10 — Forzar en tests C7, C9 y C10

- Tipo: dominio / test
- Depende de: T1, T5
- Problema: C7, C9 y C10 no se habían forzado con un caso de error automatizado: C7 en la UI del 7 de noviembre no tuvo un título sin duración; C9 y C10 no se simularon con TMDB caído.
- Criterio: C7, C9, C10 y S6, S7. Una película sin duración queda no disponible con motivo y no se agrega. El fallo de un título no tumba al resto. Un fallo general muestra error y se puede reintentar.
- Definition of Done: la clasificación de cabida vive en `src/dominio/sesion.ts` (sin red). Vitest cubre los tres casos, incluidos los mensajes. La pantalla usa esas funciones.
- Evidencia: `src/dominio/sesion.test.ts`.

## T11 — El sello de no disponibles dice el motivo

- Tipo: interfaz
- Depende de: T5
- Problema: el sello de no disponibles decía «Sin duración» también cuando la película sí tenía runtime y no cabía.
- Criterio: C7 y D5. El sello muestra «Sin duración» solo si no hay runtime; si dura más que el rato, dice «No cabe · N min».
- Commit que lo resolvió: `6846565`
- Definition of Done: `textoSelloNoDisponible` distingue ambos casos. La pasada del 2026-11-11 en el sitio publicado (`346a08b`) vio los dos sellos con un tiempo válido.
- Evidencia: `src/dominio/sesion.ts`, tests de T10, y la pasada en el navegador del 2026-11-11.

## T12 — El tiempo disponible se valida en español

- Tipo: interfaz
- Depende de: T1, T5
- Problema: 29, 601, 90.5 o el campo vacío podían mostrar el aviso nativo del navegador, en inglés.
- Criterio: C4. El tiempo inválido no consulta y se explica el rango 30–600, en español.
- Commit que lo resolvió: `143db02`
- Definition of Done: el formulario lleva `noValidate` y `tiempoDisponibleValido`. Pasada del 2026-11-11 en el sitio publicado (`346a08b`): vacío, 29, 601 y 90.5 muestran el aviso en español.
- Evidencia: `src/pages/NocheDePelicula.tsx`, tests de dominio, y esa pasada en el navegador.

## T13 — Evitar setState síncrono que rompía el lint

- Tipo: interfaz
- Depende de: E1
- Problema: un `setState` síncrono en el render de `Layout` rompía el lint.
- Criterio: el lint del proyecto tiene que pasar, sin cambiar el comportamiento de E1.
- Commit que lo resolvió: `054ecb7`
- Definition of Done: `Layout` pone `cerrando` en falso durante el render si ya no hay sesión. `npm run lint` queda en verde.
- Evidencia: `src/components/Layout.tsx` y `npm run lint`.

