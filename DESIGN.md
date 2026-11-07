# Sistema de diseño — Mi Cartelera

Fuente de verdad visual: `src/index.css`. La consigna de E2 menciona Bootstrap; este proyecto no lo usa y no se instala. E2 se viste con lo que ya existe. El tablero está en `docs/diseno/brand-board.html`.

Idea: cartel de estreno impreso sobre papel crema, tinta casi negra y un naranja de taquilla. Radios de superficie en cero. Botones pastilla (excepción deliberada).

## Cómo se personaliza

No hay framework CSS. Los tokens viven en `:root`. Las pantallas nuevas usan esas variables y las clases de abajo. Si hace falta un bloque de E2, se añade al final de `src/index.css` con el prefijo `.noche-`. No se reescribe el CSS de E1. Prettier no formatea `src/index.css`.

## Tokens (nombres, no copiar hex en la spec)

Color: `--papel`, `--tinta`, `--sala`, `--acento`, `--acento-ink`, `--mantequilla`, `--muted-light`, `--ok`, `--error`, `--danger`.

Tipo: `--display` (Anton, títulos en mayúsculas), `--serif` (Instrument Serif, cursiva de énfasis), `--sans` (DM Sans, cuerpo y UI).

Espacio: `--space-1` … `--space-8`, `--page-x`, `--page-max`.

Borde y sombra: `--border-ink`, `--shadow-hard`. `--radius-*` es 0 en superficies; `.btn` es pastilla.

## Componentes que se reutilizan

- `Boton` — `primario`, `secundario`, `peligro`. Primario con flecha por defecto.
- Navegación — `nav-link` en `Layout` para la ruta nueva.
- `TarjetaTitulo` — póster de candidato si aplica; si no, el mismo marco (borde tinta, sello).
- `sello` — estado o duración. Variantes `sello-amarillo`, `sello-estado`.
- `eyebrow` — rótulo chico sobre el título.
- `campo-linea` — tiempo disponible y nombre de sesión.
- `mensaje-estado cinta` — carga («Proyectando…», «Consultando duraciones…»).
- `error` — validación y fallos de red.
- `estado-vacio` — sin películas por ver, o sin sesiones.
- `Toast` — confirmación al guardar.

## Prohibido

- Bootstrap, Tailwind u otro framework CSS.
- Paleta o tipografía distintas a `:root`.
- `border-radius` en tarjetas, paneles y sellos (siguen en 0).
- Sombras suaves tipo Material; solo `--shadow-hard` o ninguna.
- Llamar a Supabase o TMDB desde un componente.
- Copiar hex o nombres de fuente dentro de `docs/specs/`; la spec cita este archivo.

## Criterios verificables

| Id | Criterio |
|----|----------|
| D1 | La pantalla Noche de película usa `--papel` de fondo de contenido y `--display` en el título de página. |
| D2 | El tiempo disponible y el nombre de sesión usan `campo-linea` (o equivalente visual: label que sube, subrayado tinta). |
| D3 | Carga de duraciones se muestra con `mensaje-estado cinta`, no con un spinner genérico. |
| D4 | Error de validación o de red usa la clase `error` (borde tinta, acento a la izquierda). |
| D5 | Película sin duración lleva `sello` con el motivo, no se oculta. |
| D6 | Agregar / guardar usan `Boton` primario; quitar de la sesión usa `peligro` o secundario, nunca un enlace azul por defecto. |
| D7 | Lista vacía (nada por ver o nada guardado) usa `estado-vacio`. |
| D8 | No hay clases Bootstrap (`container`, `row`, `col-*`, `btn-primary` de Bootstrap) en archivos de E2. |
| D9 | El enlace «Noche de película» está en `nav-principal` y en el menú móvil, mismo estilo que «Buscar» y «Mi lista». |
| D10 | Total y tiempo restante de la sesión se leen en el mismo bloque, con números en `--display` o `--sans` bold, sin una tipografía nueva. |
