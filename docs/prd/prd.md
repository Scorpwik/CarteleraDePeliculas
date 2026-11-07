# PRD — Mi Cartelera Personal

Producto: una cartelera personal. El usuario busca títulos reales, los guarda en su lista y les pone estado, nota y comentario. Noche de película es la segunda épica sobre ese producto, no un producto aparte.

## Problema

Cuando la lista «por ver» crece, el usuario no sabe qué le cabe en el rato que tiene. Empieza una película que no termina. El éxito de esta épica es que termine lo que empieza.

## Usuarios

La misma persona de Mi Cartelera: tiene cuenta y lista. No hay invitado, amigo ni perfil compartido.

## Épica E1 — Mi Cartelera (construida)

Acceso con correo y contraseña. Búsqueda de títulos. Alta, cambio de estado, calificación, comentario y baja en la lista propia. Ficha de un título. Un usuario no ve ni cambia la lista de otro.

Fuera de E1 para esta entrega: no se reescribe. Sigue funcionando igual.

## Épica E2 — Noche de película (nueva)

El usuario dice cuántos minutos tiene. Ve cuáles películas «por ver» de su lista caben, con su duración. Arma una sesión de una o varias, ve el total (con pausas) y el tiempo que le queda, y la guarda para esa noche. Después consulta las sesiones que guardó.

### Alcance

- Indicar tiempo disponible y validarlo.
- Mostrar qué películas «por ver» caben, cada una con duración.
- Mostrar las que no tienen duración como no disponibles, con el motivo.
- Mientras se piden duraciones: carga y error.
- Agregar y quitar películas de la sesión en curso.
- Si una no cabe en lo que queda, no se agrega y se explica.
- Guardar la sesión y ver las propias, con detalle.
- Un usuario no ve ni cambia las sesiones de otro.

### No-alcance

Series. Ver con amigos o compartir sesiones. Recordatorios y notificaciones. Sincronizar con plataformas de streaming o calendarios. Recomendar películas que no están en la lista. Editar una sesión ya guardada. Marcar la sesión como realizada o pasar sus títulos a «vista». Filtro por género. Autocompletar la noche con una combinación óptima.

## Reglas de negocio

R1. El tiempo disponible es un número entero de minutos, entre 30 y 600 inclusive. Fuera de ese rango no se arma sesión.

R2. Solo entran películas de la lista del usuario en estado «por ver». No series, no «viendo», no «vista».

R3. Entre una película y la siguiente hay 10 minutos de pausa. No hay pausa antes de la primera ni después de la última.

R4. Una sesión cabe si la suma de las duraciones más las pausas no supera el tiempo disponible. Si ocupa exactamente ese tiempo, sí cabe.

R5. La duración se toma de la ficha pública de la película. Si no hay duración conocida (ausente, cero o no positiva), no se puede agregar y la app dice por qué.

R6. Guardar una sesión no cambia el estado de esas películas: siguen «por ver».

R7. Una película puede estar en varias sesiones guardadas. En una misma sesión no se repite.

R8. Las películas que caben se muestran de menor a mayor duración; si empatan, por título. Las que no tienen duración van en otra lista, como no disponibles, no mezcladas con las que caben.

R9. Una sesión guardada no se modifica. El usuario puede borrarla y armar otra.

R10. Si el usuario quita de su lista una película que está en una sesión guardada, la sesión no cambia: guarda una copia del título, el póster y la duración de esa noche.

R11. Toda sesión tiene un nombre obligatorio (1 a 80 caracteres, sin ser solo espacios) y una fecha-hora de creación automática. No hay una fecha de «noche» aparte: el calendario está fuera de alcance.

R12. No se guarda una sesión vacía.

R13. Si falla la consulta de duración de un título, ese título se marca no disponible con el error; el resto sigue.

## Decisiones del estudiante (antes puntos abiertos)

Todas cerradas. No quedan puntos abiertos de la ficha.

**¿Una película en dos sesiones?** Sí (R7). Guardar no reserva el título: R6 dice que sigue «por ver», así que puede volver a armarse otra noche.

**¿En qué orden se muestran las que caben?** Duración ascendente, luego título (R8). El usuario elige con el tiempo que tiene, no por popularidad ni por fecha en la lista.

**¿Se puede modificar después?** No (R9). El flujo es armar → guardar → consultar. Cambiar una noche ya cerrada invita a desfasar duraciones y pausas; borrar y armar de nuevo es más claro.

**¿Si se elimina de la lista?** La sesión conservada no se rompe (R10). La lista y la noche son recuerdos distintos. No se ata la sesión a la lista para no tocar el modelo ya construido.

**¿Nombre o fecha?** Nombre que escribe el usuario y momento de guardado (R11). Una fecha de proyección sería calendario, y eso está en el no-alcance.

## Supuestos

S1. El usuario entiende minutos, no horas con decimales.

S2. La pausa de 10 minutos cubre un descanso corto entre títulos; no se configura.

S3. La duración oficial de la película es suficiente; no se pregunta «versión extendida».

S4. Hay red para pedir duraciones en el momento de armar. No se cachea duración dentro de la lista.

S5. Dos cuentas distintas demuestran que las sesiones son por usuario, igual que la lista.

## Éxito

El usuario indica su rato, arma algo que cabe (pausas incluidas) y lo recupera después sin que eso mueva el estado de su lista.
