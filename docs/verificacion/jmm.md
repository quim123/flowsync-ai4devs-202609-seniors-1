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

## Nota posterior a la revisión (08/10/2026)

Tras la revisión recibida en el PR, releo los scenarios 1 y 3. **La matriz de arriba se mantiene tal como se entregó** (y `Cubiertos: 0` no cambia): ningún test pasa por una tarea. Pero la sugerencia de usar «No lo sé» tiene fundamento en un matiz que no recogí en su momento: `initials.spec.ts` sí ejerce la lógica de iniciales que reutiliza el `assignee` (la propiedad `initials` del modelo `User`, la misma en el login y en `TaskAssigneeTransformer`). Lo que no prueba ningún test es que la **tarea** exponga esos datos.

| Scenario | Estado entregado | Lectura tras la revisión | Por qué `Auth \| iniciales` no bastaba |
|---|---|---|---|
| 1 · Responsable identificable | No cubierto | No lo sé (la lógica está probada de forma indirecta) | Prueba «Ada Lovelace» → `AL` en la respuesta del login; no que `GET /tasks/:id` ponga nombre e iniciales en el `assignee` |
| 2 · No filtra datos de cuenta | No cubierto | No cubierto | Ningún test lo toca. Además, mi test cubre la tarea suelta y la lista, pero no la respuesta de `POST /tasks`, que también usa `TaskTransformer` |
| 3 · Responsable sin nombre | No cubierto | No lo sé (la lógica está probada de forma indirecta) | Prueba que sin nombre las iniciales salen del email (`AE`) en el login; no que la tarea llegue con nombre nulo e iniciales |
