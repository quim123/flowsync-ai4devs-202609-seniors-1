# Cuentas y acceso

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, y consulte su perfil. La API emite un token de acceso que identifica a la persona en las peticiones protegidas, y la aplicación web mantiene la sesión entre recargas de página.

## Requirements

### Requirement: Registro de cuenta en la API

La API SHALL crear una cuenta mediante `POST /api/v1/auth/signup` con los campos `fullName`, `email`, `password` y `passwordConfirmation`, y SHALL responder con código 200 y un cuerpo `{ "data": { "user": {...}, "token": "..." } }`, donde `user` contiene `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, y `token` es un token de acceso ya válido.

#### Scenario: Registro correcto con nombre

- **WHEN** se envía `POST /api/v1/auth/signup` con `fullName` "Ada Lovelace", un `email` válido no registrado, un `password` de entre 8 y 32 caracteres y un `passwordConfirmation` idéntico
- **THEN** la respuesta es 200 con `data.user.fullName` igual a "Ada Lovelace", `data.user.email` igual al enviado y un `data.token` no vacío

#### Scenario: Registro correcto sin nombre

- **WHEN** se envía `POST /api/v1/auth/signup` con `fullName` a `null` y el resto de campos válidos
- **THEN** la respuesta es 200 con `data.user.fullName` igual a `null`

#### Scenario: La respuesta no expone la contraseña

- **WHEN** se completa un registro correcto
- **THEN** el objeto `data.user` no incluye ningún campo con la contraseña

### Requirement: Validación del registro

La API SHALL rechazar el registro con código 422 y un cuerpo `{ "errors": [...] }`, donde cada error indica `field` y `rule`, cuando algún campo no cumple sus reglas: `fullName` debe estar presente (puede ser `null`); `email` debe tener formato de email, un máximo de 254 caracteres y no estar ya registrado; `password` debe tener entre 8 y 32 caracteres; `passwordConfirmation` debe tener entre 8 y 32 caracteres y coincidir con `password`.

#### Scenario: Email ya registrado

- **WHEN** se envía `POST /api/v1/auth/signup` con un `email` que ya pertenece a una cuenta existente
- **THEN** la respuesta es 422 con un error sobre el campo `email` y regla `database.unique`, y no se crea ninguna cuenta

#### Scenario: Email con formato inválido

- **WHEN** se envía `POST /api/v1/auth/signup` con `email` "no-es-un-email"
- **THEN** la respuesta es 422 con un error sobre el campo `email` y regla `email`

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía `POST /api/v1/auth/signup` con un `password` de 7 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `password` y regla `minLength`

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía `POST /api/v1/auth/signup` con un `password` de 33 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `password` y regla `maxLength`

#### Scenario: Confirmación distinta

- **WHEN** se envía `POST /api/v1/auth/signup` con un `passwordConfirmation` distinto de `password`
- **THEN** la respuesta es 422 con un error sobre el campo `passwordConfirmation` y regla `sameAs`

#### Scenario: Falta el nombre en el cuerpo

- **WHEN** se envía `POST /api/v1/auth/signup` sin la clave `fullName`
- **THEN** la respuesta es 422 con un error sobre el campo `fullName` y regla `required`

### Requirement: Inicio de sesión en la API

La API SHALL iniciar sesión mediante `POST /api/v1/auth/login` con los campos `email` y `password`, y SHALL responder con código 200 y un cuerpo `{ "data": { "user": {...}, "token": "..." } }` con la misma forma que el registro. Cada inicio de sesión correcto SHALL emitir un token nuevo sin invalidar los anteriores.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el `email` y el `password` de una cuenta existente
- **THEN** la respuesta es 200 con `data.user.email` igual al enviado y un `data.token` no vacío

#### Scenario: Dos inicios de sesión conviven

- **WHEN** la misma cuenta inicia sesión dos veces y obtiene dos tokens distintos
- **THEN** ambos tokens permiten consultar `GET /api/v1/account/profile` con respuesta 200

### Requirement: Rechazo de credenciales en la API

La API SHALL rechazar el inicio de sesión con código 400 cuando el email no corresponde a ninguna cuenta o la contraseña no es la de esa cuenta, sin indicar cuál de los dos falla, y SHALL rechazarlo con código 422 cuando `email` no tiene formato de email, supera 254 caracteres o falta `password`.

#### Scenario: Contraseña incorrecta

- **WHEN** se envía `POST /api/v1/auth/login` con el `email` de una cuenta existente y un `password` distinto del suyo
- **THEN** la respuesta es 400 y no se emite ningún token

#### Scenario: Email desconocido

- **WHEN** se envía `POST /api/v1/auth/login` con un `email` que no pertenece a ninguna cuenta
- **THEN** la respuesta es 400 y no se emite ningún token

#### Scenario: Email mal formado

- **WHEN** se envía `POST /api/v1/auth/login` con `email` "no-es-un-email"
- **THEN** la respuesta es 422 con un error sobre el campo `email`

### Requirement: Consulta del perfil en la API

La API SHALL devolver el perfil de la persona autenticada mediante `GET /api/v1/account/profile` con la cabecera `Authorization: Bearer <token>`, respondiendo con código 200 y un cuerpo `{ "data": {...} }` que contiene `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`.

#### Scenario: Token válido

- **WHEN** se envía `GET /api/v1/account/profile` con un token obtenido en el registro o en el inicio de sesión
- **THEN** la respuesta es 200 con `data.email` igual al email de la cuenta dueña del token

### Requirement: Iniciales del perfil

La API SHALL calcular `initials` en mayúsculas así: si hay `fullName`, a partir de sus dos primeras palabras separadas por espacio (primera letra de cada una) o, si solo hay una palabra, sus dos primeras letras; si `fullName` es `null`, a partir del email, tomando la primera letra de lo que hay antes de la `@` y la primera de lo que hay después.

#### Scenario: Nombre con dos palabras

- **WHEN** una cuenta tiene `fullName` "Ada Lovelace"
- **THEN** `initials` es "AL"

#### Scenario: Nombre de una sola palabra

- **WHEN** una cuenta tiene `fullName` "Ada"
- **THEN** `initials` es "AD"

#### Scenario: Sin nombre

- **WHEN** una cuenta tiene `fullName` `null` y `email` "ana@flowsync.dev"
- **THEN** `initials` es "AF"

### Requirement: Cierre de sesión en la API

La API SHALL cerrar sesión mediante `POST /api/v1/account/logout` con la cabecera `Authorization: Bearer <token>`, respondiendo con código 200 y el cuerpo `{ "message": "Logged out successfully" }` (sin envoltorio `data`), y SHALL invalidar solo el token usado en esa petición.

#### Scenario: Token revocado tras cerrar sesión

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido y, después, `GET /api/v1/account/profile` con ese mismo token
- **THEN** el cierre de sesión responde 200 con `message` "Logged out successfully" y la consulta posterior del perfil responde 401

#### Scenario: Otros tokens siguen vivos

- **WHEN** una cuenta tiene dos tokens válidos y cierra sesión con uno de ellos
- **THEN** el otro token sigue permitiendo consultar `GET /api/v1/account/profile` con respuesta 200

### Requirement: Protección de las rutas de cuenta en la API

La API SHALL responder con código 401 a `GET /api/v1/account/profile` y a `POST /api/v1/account/logout` cuando la petición no lleva token, o lleva uno inexistente o revocado. Las respuestas de la API SHALL ser siempre JSON.

#### Scenario: Sin token

- **WHEN** se envía `GET /api/v1/account/profile` sin cabecera `Authorization`
- **THEN** la respuesta es 401

#### Scenario: Token inventado

- **WHEN** se envía `POST /api/v1/account/logout` con `Authorization: Bearer token-falso`
- **THEN** la respuesta es 401

### Requirement: Navegación según el estado de sesión

La aplicación web SHALL mostrar las pantallas de inicio de sesión (`/login`) y de registro (`/register`) solo a quien no tiene sesión, y la pantalla de perfil (`/profile`) solo a quien sí la tiene. Cualquier otra dirección SHALL llevar a `/profile`. Mientras se comprueba una sesión guardada, SHALL mostrar un indicador de carga a pantalla completa en lugar de redirigir.

#### Scenario: Sin sesión intenta ver el perfil

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** la aplicación la lleva a la pantalla de inicio de sesión

#### Scenario: Con sesión intenta ver el login o el registro

- **WHEN** una persona con sesión abre `/login` o `/register`
- **THEN** la aplicación la lleva a su perfil

#### Scenario: Dirección desconocida

- **WHEN** una persona abre una dirección que no es `/login`, `/register` ni `/profile`
- **THEN** la aplicación la lleva a `/profile`, y de ahí al inicio de sesión si no tiene sesión

### Requirement: Pantalla de registro

La pantalla de registro SHALL mostrar el título "FlowSync", la tarjeta "Crea tu cuenta" con la descripción "Regístrate para empezar a organizar el trabajo del equipo.", los campos "Nombre completo (opcional)", "Email", "Contraseña" (con la ayuda "Entre 8 y 32 caracteres.") y "Repite la contraseña", el botón "Crear cuenta" y el enlace "Inicia sesión" hacia la pantalla de inicio de sesión. Al registrarse con éxito, la persona SHALL quedar con sesión iniciada y ver su perfil.

#### Scenario: Registro correcto

- **WHEN** una persona rellena email, contraseña y confirmación válidas y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" y queda deshabilitado mientras espera, y después la persona ve su perfil con la sesión iniciada

#### Scenario: Nombre vacío

- **WHEN** una persona deja "Nombre completo" vacío o solo con espacios y se registra con éxito
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

#### Scenario: Contraseñas distintas detectadas en pantalla

- **WHEN** una persona escribe una confirmación distinta de la contraseña y pulsa "Crear cuenta"
- **THEN** aparece "Las contraseñas no coinciden." bajo "Repite la contraseña" y no se envía nada al servidor

#### Scenario: Ir al inicio de sesión

- **WHEN** una persona pulsa el enlace "Inicia sesión"
- **THEN** ve la pantalla de inicio de sesión

### Requirement: Errores del registro en pantalla

La pantalla de registro SHALL mostrar en castellano, bajo el campo afectado, cada error de validación que devuelva el servidor, un solo mensaje por campo. Los mensajes SHALL ser: "Ese email ya está registrado. Inicia sesión en su lugar." (email repetido), "Introduce una dirección de email válida." (formato de email), "Las contraseñas no coinciden." (confirmación distinta), "Falta rellenar <campo>." (campo ausente), "<campo> debe tener al menos N caracteres." (longitud mínima), "<campo> no puede superar los N caracteres." (longitud máxima) y "Revisa <campo>." (cualquier otro).

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya tiene cuenta
- **THEN** aparece "Ese email ya está registrado. Inicia sesión en su lugar." bajo el campo "Email" y la persona sigue en la pantalla de registro

#### Scenario: Contraseña corta

- **WHEN** una persona intenta registrarse con una contraseña de menos de 8 caracteres y una confirmación idéntica
- **THEN** aparece "la contraseña debe tener al menos 8 caracteres." bajo el campo "Contraseña" en lugar de la ayuda "Entre 8 y 32 caracteres."

### Requirement: Pantalla de inicio de sesión

La pantalla de inicio de sesión SHALL mostrar el título "FlowSync", la tarjeta "Inicia sesión" con la descripción "Entra con tu cuenta para volver a tus tareas.", los campos "Email" y "Contraseña", el botón "Entrar" y el enlace "Crea una" (tras "¿Aún no tienes cuenta?") hacia la pantalla de registro. Al entrar con éxito, la persona SHALL quedar con sesión iniciada y ver su perfil.

#### Scenario: Inicio de sesión correcto

- **WHEN** una persona introduce el email y la contraseña de su cuenta y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" y queda deshabilitado mientras espera, y después la persona ve su perfil

#### Scenario: Ir al registro

- **WHEN** una persona pulsa el enlace "Crea una"
- **THEN** ve la pantalla de registro

### Requirement: Errores del inicio de sesión en pantalla

La pantalla de inicio de sesión SHALL mostrar un aviso destacado encima del formulario con "El email o la contraseña no son correctos." cuando las credenciales no son válidas, y SHALL mostrar bajo el campo afectado los errores de validación de email o contraseña.

#### Scenario: Credenciales incorrectas

- **WHEN** una persona introduce una contraseña que no es la de su cuenta y pulsa "Entrar"
- **THEN** aparece el aviso "El email o la contraseña no son correctos." y la persona sigue en la pantalla de inicio de sesión

#### Scenario: Email mal formado

- **WHEN** una persona introduce "no-es-un-email" como email y pulsa "Entrar"
- **THEN** aparece "Introduce una dirección de email válida." bajo el campo "Email"

### Requirement: Errores de conexión en los formularios

Las pantallas de registro e inicio de sesión SHALL mostrar un aviso destacado encima del formulario con "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." cuando el servidor no responde, y con "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento." cuando el servidor responde con un error no previsto. Tras cualquier error, el botón de envío SHALL volver a estar disponible.

#### Scenario: Servidor caído

- **WHEN** una persona pulsa "Entrar" o "Crear cuenta" con el servidor apagado
- **THEN** aparece el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." y el botón vuelve a estar habilitado

### Requirement: Persistencia de la sesión en el navegador

La aplicación web SHALL guardar el token en el navegador al registrarse o iniciar sesión, y al recargar o volver a abrir la aplicación SHALL comprobarlo contra el servidor antes de dar la sesión por buena, mostrando mientras tanto un indicador de carga.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión recarga la página del perfil
- **THEN** ve brevemente el indicador de carga y después su perfil, sin pasar por la pantalla de inicio de sesión

#### Scenario: Sesión caducada o revocada

- **WHEN** una persona abre la aplicación con un token guardado que el servidor ya no acepta
- **THEN** la aplicación borra el token guardado, la lleva a la pantalla de inicio de sesión y muestra el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor no disponible al restaurar

- **WHEN** una persona abre la aplicación con un token guardado y el servidor no responde
- **THEN** la aplicación la lleva a la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado.", conserva el token guardado y, al recargar con el servidor ya disponible, la persona recupera su sesión

#### Scenario: El aviso se sustituye al intentar entrar

- **WHEN** la pantalla de inicio de sesión muestra el aviso de sesión perdida y la persona intenta entrar con credenciales incorrectas
- **THEN** el aviso pasa a ser "El email o la contraseña no son correctos."

### Requirement: Pantalla de perfil

La pantalla de perfil SHALL mostrar un círculo con las iniciales de la persona, su nombre completo (o "Sin nombre" si no tiene), su email, la fila "Miembro desde" con la fecha de alta en formato largo en castellano, y el botón "Cerrar sesión".

#### Scenario: Perfil con nombre

- **WHEN** una persona llamada "Ada Lovelace" dada de alta el 30 de septiembre de 2026 abre su perfil
- **THEN** ve "AL" en el círculo, "Ada Lovelace", su email y "Miembro desde" con "30 de septiembre de 2026"

#### Scenario: Perfil sin nombre

- **WHEN** una persona registrada sin nombre abre su perfil
- **THEN** ve "Sin nombre" en lugar del nombre y las iniciales calculadas a partir de su email

### Requirement: Cierre de sesión en pantalla

Al pulsar "Cerrar sesión", la aplicación web SHALL cerrar la sesión en el navegador y llevar a la persona a la pantalla de inicio de sesión sin ningún aviso de error, aunque el servidor no llegue a confirmar el cierre, y SHALL pedir al servidor que invalide el token.

#### Scenario: Cierre de sesión correcto

- **WHEN** una persona con sesión pulsa "Cerrar sesión" en su perfil
- **THEN** ve la pantalla de inicio de sesión sin avisos, y al volver a abrir `/profile` la aplicación la lleva de nuevo al inicio de sesión

#### Scenario: Cierre de sesión con el servidor caído

- **WHEN** una persona pulsa "Cerrar sesión" con el servidor apagado
- **THEN** igualmente ve la pantalla de inicio de sesión sin avisos y deja de tener sesión en el navegador

## 1. Requisitos escritos y comprobados

Escritos por el agente: 17
Comprobados por mí abriendo el código: 4

## 2. Incoherencias que aparecieron al escribir la spec

- El aviso "El email o la contraseña no son correctos." se muestra ante cualquier respuesta 400 del
  servidor, no solo ante credenciales incorrectas. La spec lo escribe como si fuera específico de las
  credenciales. Se ve en la pantalla de inicio de sesión.
- Los formularios tienen un tercer mensaje de error, para fallos que no vienen de la API, que la spec
  no recoge: solo describe el de servidor caído y el de error no previsto. Se ve en registro e inicio
  de sesión.
- La fecha de "Miembro desde" se formatea con la zona horaria del navegador, no con la del servidor.
  Un alta cerca de medianoche UTC puede mostrar un día distinto según dónde esté la persona. La spec
  dice "fecha de alta" como si fuera única. Se ve en la pantalla de perfil.
- La forma del error con "field" y "rule" que escribí en la spec la saqué del tipo que declara el
  frontend, no de una respuesta del backend. Es la forma que el cliente espera, que no es lo mismo que
  la que la API garantiza.
- La regla de las iniciales que escribí ("dos primeras palabras separadas por espacio") no describe lo
  que hace el código: parte por cada espacio, así que "Ada  Lovelace" con dos espacios da "AD" y no
  "AL". Se ve en la respuesta de perfil.

## 3. Lo que no supe decidir si era bug o contrato

- **"Las respuestas de la API SHALL ser siempre JSON".** Una lectura: es el contrato, y por eso hay un
  middleware que fuerza la negociación de contenido. La otra: ese middleware solo fija la cabecera de
  la petición, y el propio frontend contempla que un error 500 devuelva HTML, así que la garantía no
  existe y la frase afirma más de lo que el código sostiene. Leyendo el código no hay forma de decidir
  cuál de las dos era la intención.

- **Cerrar sesión con el servidor caído.** La pantalla cierra la sesión en el navegador y no enseña
  ningún error, pero el token sigue siendo válido en el servidor. Una lectura: es deliberado, cerrar
  sesión nunca debe fallarle a la persona. La otra: es un descuido, y deja un token vivo que nadie va
  a invalidar. Las dos son compatibles con lo que hace el código.

- **Email desconocido y contraseña incorrecta responden igual.** Escribí que la API no indica cuál de
  los dos falla, que es la práctica correcta para no filtrar qué emails existen. Pero eso no lo decide
  el código de la aplicación: ocurre dentro de la librería de autenticación, y no llegué a comprobar
  que las dos causas produzcan literalmente la misma respuesta. Una lectura: es una decisión de
  seguridad asumida. La otra: es lo que la librería hace por defecto y nadie lo eligió.

- **Las iniciales con espacios raros y con nombre vacío.** Con doble espacio salen mal, y un nombre de
  cadena vacía se trata como si no hubiera nombre y las iniciales salen del email, aunque el perfil en
  pantalla mostraría el nombre vacío en vez de "Sin nombre". Una lectura: los espacios ya se limpian al
  registrarse, así que el caso no puede darse y el contrato está bien. La otra: esa limpieza está en el
  frontend y la API acepta cualquier cosa, así que el caso sí puede llegar y es un bug. No se decide
  leyendo el código.

- **Cada inicio de sesión emite un token nuevo y no invalida los anteriores.** Una lectura: es el
  contrato, para permitir varias sesiones a la vez en distintos dispositivos. La otra: nadie decidió
  nada y los tokens simplemente se acumulan sin límite ni caducidad visible.