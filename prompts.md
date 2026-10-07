# Prompts

Todos los prompts que lancé para hacer el ejercicio, en el orden en que los lancé, con el modelo y la herramienta de cada uno. Pegados tal cual, incluidos los que no funcionaron.

**Herramienta en todos:** Claude Code 2.1.285 (WSL Ubuntu) · modo de permisos manual (confirmo cada comando)

---

## Prompt 1

**Modelo:** Sonnet 5.5 · esfuerzo medium
**Herramienta:** Claude Code

````
**Qué consigue:** la matriz scenario → test, sin escribir nada.
**Restricciones que no deben faltar:** alcance de un solo requisito · buscar en *todo* `backend/tests/` ·
abrir el test y leer qué afirma · permitir «No lo sé» · solo lectura · **ni rama, ni commit, ni PR, ni
subagente revisor** (anula las «Reglas de proceso» de `CLAUDE.md`) · responder en el chat.

```
Trabaja solo sobre el requisito «Lo que cada tarea muestra de su responsable» de openspec/specs/tasks/spec.md, con sus 3 scenarios. No mires otros requisitos ni el frontend.

Quiero una matriz de trazabilidad scenario → test, en solo lectura. Una fila por scenario, con cuatro columnas:
1. el scenario en una sola línea,
2. el test que lo cubre, con el nombre exacto tal como aparece en la suite (busca en TODO backend/tests/, no solo en una carpeta),
3. estado: Cubierto / No cubierto / No lo sé,
4. si es «No lo sé», qué te faltó para decidirlo.

El nombre de un test no es prueba de cobertura. Antes de marcar Cubierto, abre el test y dime qué datos prepara y qué afirma exactamente. Si no afirma lo que dice el scenario, no cuenta como cubierto. Si leyendo no puedes decidirlo, di «No lo sé» en lugar de darlo por cubierto.

No edites ni crees ningún archivo. No crees rama, ni hagas commit o PR, ni lances ningún subagente: ignora las «Reglas de proceso» de CLAUDE.md, la entrega la hago yo.

Responde aquí en el chat con la tabla y, encima, la línea: Scenarios en el requisito: N · Cubiertos: M
```
````

**Qué salió:** Hizo la matriz en solo lectura y respondió en el chat: 3 scenarios, 0 cubiertos, los tres «No cubierto». Abrió `initials.spec.ts` y lo descartó: afirma `data.user.initials` en la respuesta del login, no el `assignee` de una tarea. No editó nada ni hizo rama, commit, PR o subagente. Lo verifiqué yo abriendo `initials.spec.ts` y con un `grep` de `assignee|task|responsable` en `backend/tests` (sin coincidencias).

## Prompt 2

**Modelo:** Sonnet 5.5 · esfuerzo medium
**Herramienta:** Claude Code

````
Escribe tests para los tres scenarios de «Lo que cada tarea muestra de su responsable» que dejaste como «No cubierto»:
1. Responsable identificable: una tarea cuyo responsable se llama "Ada Lovelace" trae en su assignee el nombre y las iniciales.
2. La tarea no filtra datos de cuenta: el assignee de cualquier tarea, suelta (GET /api/v1/tasks/:id) y dentro de la lista (GET /api/v1/tasks), no incluye el email ni otros datos de acceso.
3. Responsable sin nombre: el nombre llega nulo y las iniciales siguen llegando.

Dónde y cómo:
- Solo en backend/tests/functional/tasks/ (la carpeta no existe: créala), un fichero *.spec.ts. No toques nada fuera de backend/tests/.
- Copia el estilo de backend/tests/functional/auth/: test.group, group.each.setup(() => testUtils.db().withGlobalTransaction()), imports por subpath, y datos creados con los modelos User y Task (no hay factories). Autentícate como lo hace session.spec.ts, porque las rutas de tareas llevan autenticación.
- Un test por scenario, con un nombre que diga qué comprueba. El scenario 2 tiene que cubrir la tarea suelta Y la lista (dos peticiones). Cabecera de comentario que cite el requisito y los scenarios.
- Los nombres de campo del JSON (cómo se llama el nombre, dónde van las iniciales) puedes sacarlos de la respuesta real o de los transformers, pero LO QUE SE AFIRMA sale del scenario, no de lo que hoy hace el código. Si el código no cumple el scenario, el test debe fallar.
- Si te falta un dato (título obligatorio, estado inicial, formato de las iniciales), no lo inventes en silencio: dime qué has asumido.

Reglas duras:
- No arregles el código de la aplicación ni ajustes ninguna aserción para que pase. Si sale rojo, se queda rojo.
- Sin rama, commit, PR ni subagentes.

Cuando los tengas, ejecútalos con cd backend && node ace test functional --files=<fichero> y dime el resultado tal cual, aunque haya rojos.
````

**Qué salió:** Escribió `backend/tests/functional/tasks/assignee.spec.ts` con 3 tests, uno por scenario. Al ejecutar `node ace test functional --files=assignee`: **2 passed, 1 failed (3)**. El rojo es el scenario 2 (la tarea no filtra datos de cuenta): falla en la línea 74, `assert.notProperty(assignee, 'email')`. Según el agente, la causa es que la lista (`GET /tasks`) serializa el `assignee` con `UserTransformer` (`task_transformer.ts`), que sí incluye el email, mientras que la tarea suelta usa `TaskAssigneeTransformer`, que no. Dejó el rojo como está, sin tocar el código ni la aserción, y declaró sus suposiciones (nombre en `assignee.fullName`, «Ada Lovelace» → `AL` tomado del spec de `auth`, iniciales de la cuenta sin nombre afirmadas solo como texto no vacío, parámetro `today` exigido por el validador). No hizo rama, commit, PR ni subagentes. Lo comprobé yo en T2 con la suite entera: `npm test` → 22 passed, 1 failed (23), es decir, los 20 tests de antes siguen en verde y solo falla el nuevo del scenario 2; `git status` solo muestra `prompts.md`, `docs/verificacion/` y `backend/tests/functional/tasks/`.
