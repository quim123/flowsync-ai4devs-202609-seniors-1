# Prompts

Todos los prompts que lancé para hacer el ejercicio, en orden, con modelo y herramienta.

**Modelo en todos:** Opus 5, esfuerzo medio · **Herramienta en todos:** Claude Code 2.1.283 (WSL Ubuntu)

---

## Prompt 1

**Modelo:** Opus 5 Medio
**Herramienta:** Claude Code

```
Escribe la spec de lo que cuentas y acceso hace hoy. El código ya está escrito y funciona. No propongas mejoras, no arregles nada y no cambies ni una línea.

Solo este vertical: registro, inicio de sesión, sesión y perfil. Las dos capas, backend y frontend. No leas docs/backlog para sacar requisitos. Si ves tareas o actividad de equipo, no las documentes.

Antes de escribir, lee el código de las dos capas. No llames a la API y no crees usuarios. Cada requisito tiene que salir de algo que hayas leído. Si no lo has visto en el código, no lo escribas.

Observable, y solo eso. En la API: método, ruta, campos y código de respuesta. En pantalla: lo que una persona ve y puede hacer. Ni un nombre de clase, ni de archivo, ni una ruta de código.

Escríbelo en docs/spec-viva/jmm.md. La carpeta no existe: créala. La spec va en el archivo, no en el chat.

Formato, tal cual:
- Arriba, ## Purpose: una o dos frases de para qué existe esta capability.
- Debajo, ## Requirements.
- Cada comportamiento es un ### Requirement: con un SHALL.
- Bajo cada requisito, al menos un #### Scenario: (cuatro almohadillas) y, dentro, solo estas dos viñetas: - **WHEN** ... y - **THEN** ...
- Sin GIVEN. La precondición va dentro del WHEN.
- Castellano, salvo SHALL y MUST en mayúsculas.

No pongas secciones ADDED, MODIFIED ni REMOVED. Esto es lo que el sistema hace ahora, no un cambio.

Cuando termines, en el chat: cuántos ### Requirement: hay, más un método+ruta y un campo de respuesta copiados de lo que has escrito.
```

**Qué salió:** la primera vez ni llegó a ejecutarse, porque la sesión de Claude Code estaba caducada
y saltó un aviso de login. Tras reautenticar lo relancé tal cual. Exploró las dos capas y escribió
17 requisitos con 44 escenarios, con el formato correcto y sin nombres de archivo. Pero al terminar
anunció por su cuenta que iba a hacer el commit, abrir el PR y pasar la revisión adversarial "como
pide el proceso del repo": siguió el CLAUDE.md del repo del curso en vez de pararse. Hubo que
cortarlo con el Prompt 2.

## Prompt 2

**Modelo:** Opus 5 Medio
**Herramienta:** Claude Code

```
No hagas commit, ni PR, ni revisión adversarial. Ignora el proceso de entrega del repo: la entrega la hago yo al final.
```

**Qué salió:** se detuvo. Es el prompt más útil de los que lancé, porque el agente estaba a punto de
abrir un PR con la spec sin comprobar y sin las tres listas.

## Prompt 3

**Modelo:** Opus 5 Medio
**Herramienta:** Claude Code

```
Vamos a contrastar la spec contra el código, requisito a requisito. No edites ni la spec ni el código.

Para cada ### Requirement: de docs/spec-viva/jmm.md dime, en una línea:
- en qué archivo se decide ese comportamiento,
- si el código hace literalmente lo que dice el requisito, o si hay matiz.

Empieza por los de la API. Si un requisito no lo puedes contrastar leyendo el código, dilo en vez de darlo por bueno.
```

**Qué salió:** lo más útil del ejercicio. Devolvió los 17 con su archivo y su matiz, y —esto es lo
que buscaba— marcó explícitamente dos afirmaciones que no podía respaldar leyendo el código: que las
respuestas sean "siempre JSON" y que un email desconocido y una contraseña incorrecta den exactamente
la misma respuesta. De ahí salieron casi todas las entradas de las listas 2 y 3.

## Prompt 4

**Modelo:** Opus 5 Medio
**Herramienta:** Claude Code

```
Quita las barras invertidas que escapan los ## y los - al final del archivo docs/spec-viva/jmm.md. No cambies ni una palabra del texto.
```

**Qué salió:** las quitó, y además avisó de otra barra que no estaba al final, dentro de un bloque de
código en la línea 30, preguntando si la quitaba también.

## Prompt 5

**Modelo:** Opus 5 Medio
**Herramienta:** Claude Code

```
sí, quítala también
```

**Qué salió:** la quitó.

---

## Nota sobre el modo de trabajo

No usé el modo auto en ningún momento: aprobé cada comando de uno en uno. Cuesta unos clics de reloj,
pero la regla dura del ejercicio es no tocar el código, y esas confirmaciones eran la única red para
enterarme si el agente intentaba escribir en un `.ts`. De hecho sirvió: fue el aviso de que iba a
hacer `git add` lo que dejó ver que se había ido a hacer el commit por su cuenta.

Tampoco conecté el MCP de Atlassian que propone el `.mcp.json` del repo. Para esta tarea no hace
falta Jira, y son 41 herramientas ocupando ventana de contexto en un ejercicio de 45 minutos donde
el agente tiene que leer dos capas de código.
