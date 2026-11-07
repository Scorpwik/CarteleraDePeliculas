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
