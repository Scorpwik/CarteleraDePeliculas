# Criterios de aceptación — E2

DADO / CUANDO / ENTONCES. Sin implementación.

## H1 — Ver qué cabe

C1. DADO un usuario con sesión iniciada
CUANDO abre Noche de película
ENTONCES ve la pantalla y puede indicar su tiempo disponible.

C2. DADO un usuario sin sesión
CUANDO intenta ir a Noche de película
ENTONCES no ve esa pantalla y se le pide iniciar sesión.

C3. DADO un tiempo de 30 minutos o de 600
CUANDO lo confirma
ENTONCES la app lo acepta y busca qué cabe.

C4. DADO un tiempo menor a 30, mayor a 600, no entero o vacío
CUANDO lo confirma
ENTONCES la app no busca qué cabe y explica el rango permitido.

C5. DADO tiempo válido y películas «por ver» con duración conocida menor o igual a ese tiempo
CUANDO termina de consultar duraciones
ENTONCES cada una aparece con su duración, de menor a mayor, y si empatan por título.

C6. DADO una película «por ver» cuya duración supera el tiempo, o una serie «por ver»
CUANDO se muestran las que caben
ENTONCES esas no aparecen como candidatas.

C7. DADO una película «por ver» sin duración conocida
CUANDO se muestran resultados
ENTONCES aparece como no disponible, con el motivo, y no se puede agregar.

C8. DADO que se están pidiendo duraciones
CUANDO el usuario espera
ENTONCES ve un estado de carga.

C9. DADO un fallo al pedir duraciones de un título
CUANDO el resto ya respondió
ENTONCES ese título queda no disponible con el error y los demás se muestran.

C10. DADO un fallo general al pedir duraciones
CUANDO no se puede completar la consulta
ENTONCES ve un estado de error y puede reintentar.

## H2 — Armar la sesión

C11. DADO candidatas que caben solas
CUANDO el usuario agrega una
ENTONCES entra en la sesión, el total incluye su duración (sin pausa si es la única) y el restante baja.

C12. DADO una sesión con al menos una película
CUANDO agrega otra que aún cabe con la pausa de 10 minutos
ENTONCES el total suma duraciones más 10 minutos por cada hueco entre películas.

C13. DADO una sesión cuyo restante es menor que duración + pausa de una candidata
CUANDO intenta agregarla
ENTONCES no entra y la app explica que no cabe en lo que queda.

C14. DADO una película ya en la sesión
CUANDO intenta agregarla de nuevo
ENTONCES no se duplica.

C15. DADO una película en la sesión
CUANDO la quita
ENTONCES sale, el total y el restante se recalculan (sin pausa sobrante).

C16. DADO una sesión que ocupa exactamente el tiempo disponible
CUANDO el usuario la mira
ENTONCES se considera que cabe (restante 0) y puede seguir hacia guardar.

C17. DADO una película sin duración
CUANDO intenta agregar
ENTONCES no entra y ve el motivo.

## H3 — Guardar y consultar

C18. DADO una sesión con al menos una película que cabe, un nombre de 1 a 80 caracteres y tiempo válido
CUANDO guarda
ENTONCES la sesión queda persistida a su nombre y las películas siguen «por ver».

C19. DADO una sesión vacía, o un nombre vacío o de más de 80 caracteres
CUANDO intenta guardar
ENTONCES no se guarda y se explica por qué.

C20. DADO sesiones guardadas propias
CUANDO abre Noche de película
ENTONCES las ve con nombre, momento de creación y el detalle de sus películas y duraciones.

C21. DADO una sesión propia
CUANDO la borra
ENTONCES deja de verla y no puede editarla (nunca hubo edición).

C22. DADO el usuario A con sesiones
CUANDO el usuario B inicia sesión
ENTONCES B no ve ni puede borrar las de A.

C23. DADO una película que está en una sesión guardada
CUANDO el usuario la quita de su lista
ENTONCES la sesión sigue mostrando esa película con los datos que se guardaron.
