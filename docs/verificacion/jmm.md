# Verificación · Lo que cada tarea muestra de su responsable (JMM)

Scenarios en el requisito: 3 · Cubiertos: 0

|Scenario (una línea)|Test que lo cubre (nombre exacto)|Estado|Qué te faltó (si «No lo sé»)|
|-|-|-|-|
|Una tarea cuyo responsable se llama «Ada Lovelace» trae en su `assignee` el nombre y las iniciales|Ninguno (candidato descartado: `Auth \| iniciales`, solo prueba `user.initials` en la respuesta del login)|No cubierto|—|
|El `assignee` de cualquier tarea, suelta o en lista, no incluye el email ni otros datos de acceso|Ninguno (sin coincidencias de `assignee`, `task` ni `responsable` en `backend/tests`)|No cubierto|—|
|Si el responsable se registró sin nombre, su nombre llega nulo y las iniciales siguen llegando|Ninguno (candidato descartado: «sin nombre, las iniciales salen del email», solo prueba el login)|No cubierto|—|

## Parte B

1. **Cubiertos antes de mirar → cubiertos en realidad:** 3 → 0
2. **Scenario donde no supe si faltaba un test o faltaba la regla en la spec, y qué me hizo dudar:** El scenario 2 (la tarea no filtra datos de cuenta): la regla del email existe y la lista la incumple (el test sale en rojo), pero dudé de qué cuenta como «datos de acceso», porque el requisito dice «ningún otro dato de esa cuenta» y el scenario solo «datos de acceso», y la lista devuelve también `createdAt` y `updatedAt`.
3. **Algo que el scenario no determinaba y tuve que decidir al escribir el test:** Las iniciales de la cuenta sin nombre: el scenario solo dice que «siguen llegando», así que el test afirma únicamente que son un texto no vacío y no un valor concreto como `AE`.

