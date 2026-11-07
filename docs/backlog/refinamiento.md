# Refinamiento con la IA — E2

Cada caso borde propuesto, aceptado o rechazado, con razón. Las reglas viven en el PRD (R1–R13).

## De la ficha (ya decididos por el cliente)

| Caso | Decisión | Razón |
|------|----------|--------|
| Tiempo no entero u fuera de 30–600 | Aceptado: inválido | R1 |
| Solo «por ver» y solo películas | Aceptado | R2 |
| Pausa 10 min entre títulos, no al inicio ni al final | Aceptado | R3 |
| Ocupar exactamente el tiempo | Aceptado: cabe | R4 |
| Sin duración conocida | Aceptado: no se agrega, se explica | R5 |
| Guardar no cambia estado | Aceptado | R6 |

## Cinco puntos del estudiante

| Caso | Decisión | Razón |
|------|----------|--------|
| Una película en dos sesiones guardadas | Aceptado | R7: guardar no reserva el título |
| Orden de las que caben | Aceptado: duración ascendente, luego título | R8 |
| Editar sesión guardada | Rechazado | R9: borrar y armar otra |
| Quitar de la lista una película de una sesión | Aceptado: la sesión no cambia | R10: copia, no vínculo |
| Nombre o fecha de noche | Aceptado: nombre + creación automática | R11; calendario es no-alcance |

## Propuestos en el poke-holes

| Caso | Decisión | Razón |
|------|----------|--------|
| Sesión vacía | Aceptado: no se guarda | R12. No hay noche que recordar |
| Misma película dos veces en una sesión | Aceptado: no se duplica | R7 |
| Serie «por ver» | Aceptado: no entra | R2 y no-alcance de series |
| Duración 0 o negativa | Aceptado: se trata como desconocida | R5 |
| Un título falla al consultar duración | Aceptado: ese no disponible, el resto sigue | R13 |
| Borrar la sesión propia | Aceptado | Compensa la falta de edición (R9) |
| Tiempo con decimales (90.5) | Aceptado: inválido | R1 pide entero |
| Una sola película | Aceptado: cabe si su duración ≤ tiempo; 0 pausas | R3 |
| Agregar en un orden y mostrar otro | Aceptado: el armado conserva el orden en que se agregó; las candidatas siguen R8 | El total depende del número de pausas, no del título |
| Pausas configurables | Rechazado | El cliente fijó 10 minutos |
| Guardar duración dentro de la lista | Rechazado | No se alteran columnas del Proyecto 3; la copia va en la sesión |
| Recomendar fuera de la lista | Rechazado | No-alcance |
| Compartir sesión | Rechazado | No-alcance |
| Recordatorio | Rechazado | No-alcance |
| Pasar a «vista» al guardar o al marcar realizada | Rechazado | Contradice R6; el extra opcional exigiría otra historia |
| Autocompletar «llenar mi noche» | Rechazado en esta entrega | Extra opcional; haría falta historia y spec propias |
| Filtro por género | Rechazado en esta entrega | Extra opcional |
| Validar «cabe» también en la base | Rechazado en esta entrega | Extra opcional; el dominio cubre la regla en cliente |
