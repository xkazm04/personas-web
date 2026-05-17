export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Cómo Personas mantiene tus datos a salvo

La seguridad está integrada en Personas desde la base. Las claves de API, los tokens y las contraseñas viven en una bóveda local cifrada en tu propia máquina: nunca salen del dispositivo a menos que un agente las envíe explícitamente a un proveedor de IA o servicio de terceros durante una ejecución. El archivo de la bóveda en sí está cifrado con **AES-256-GCM**, y la clave que lo desbloquea está envuelta por el keyring nativo de tu SO (DPAPI en Windows, Keychain en macOS, Secret Service en Linux) para que las claves en texto plano nunca queden en disco.

Cuando ejecutas un agente, el motor descifra solo las credenciales específicas que ese agente necesita, las mantiene en memoria durante la llamada y luego limpia el texto plano. Los logs, las trazas y las exportaciones nunca contienen valores de credenciales en bruto: en cualquier lugar donde aparecería una credencial, ves una referencia de token (\`cred:gmail-work\`) en su lugar.

### Puntos clave

- **AES-256-GCM** — cifrado autenticado (el texto cifrado de cada credencial se verifica en integridad, así que un archivo de bóveda alterado se detecta, no se descifra silenciosamente)
- **Clave maestra envuelta por el keyring del SO** — DPAPI en Windows, Keychain en macOS, Secret Service en Linux; sin contraseña maestra que teclear en cada sesión
- **Solo local por defecto** — nada se sube; el despliegue en la nube es opcional y cifra en tránsito vía TLS hacia el orquestador que elijas
- **Referencias de token en los logs** — las trazas de los agentes y las exportaciones usan IDs de credencial, no secretos en bruto
- **Evidencia de manipulación** — las etiquetas de autenticación GCM detectan cualquier modificación del archivo de la bóveda

### Cómo funciona

Almacenar una credencial la cifra con la clave de la bóveda (la clave AES-256-GCM por bóveda, ella misma envuelta por el keyring del SO) y escribe el texto cifrado en SQLite local. Usar una credencial durante una ejecución de agente la descifra en memoria, la pasa a la herramienta o cliente HTTP relevante y libera el búfer de inmediato. El valor en bruto nunca se registra, nunca se muestra tras la entrada inicial y nunca se serializa en ningún lugar fuera de la bóveda cifrada.

### Velo en acción

:::usecases
**Múltiples servicios, credenciales aisladas**
Tus agentes hablan con Slack, GitHub y Jira
---
Cada credencial se cifra de forma independiente con su propio nonce aleatorio. El compromiso de un registro no expone los demás.
===
**Rotación de credenciales**
Un token caduca o se rota
---
Las credenciales OAuth se refrescan automáticamente vía el refresh token del proveedor. Las claves rotadas manualmente las cambias en el registro de la credencial sin reiniciar nada.
===
**Trazas amigables para auditoría**
Necesitas probar qué credencial se usó dónde
---
La traza de cada ejecución registra el ID de la credencial que usó. El valor real nunca aparece; el ID basta para demostrar procedencia.
:::

:::info
La bóveda está atada a tu cuenta de usuario del SO vía el keyring del SO. Copiar el archivo de la bóveda a otra máquina, incluso con el mismo SO, no la hará descifrable: la clave envolvente vive en el keyring del SO y no es portable.
:::

:::warning
Si cambias tu contraseña de cuenta del SO en macOS o Linux, el keyring puede volver a bloquear la clave envolvente. Personas pedirá la nueva credencial en la primera ejecución tras el cambio. Si el keyring se borra (restablecimiento de fábrica, eliminación de cuenta), la bóveda se vuelve irrecuperable: respalda externamente los secretos en bruto si necesitas recuperación de desastres más allá de la máquina local.
:::

:::tip
El modelo solo local es el predeterminado correcto para automatización personal. Para trabajo de equipo / producción donde varias máquinas necesitan las mismas credenciales, el despliegue en la nube (nivel Team / Builder) replica el estado de la bóveda vía el orquestador con cifrado de extremo a extremo.
:::
  `,

  "adding-a-new-credential": `
## Añadir una nueva credencial

Abre Connections → Credentials y haz clic en \`Add Credential\`. Elige una categoría (email, almacenamiento en la nube, pagos, comunicación, herramientas de desarrollo, CRM, proveedor de IA, genérico): el selector muestra los conectores preconstruidos coincidentes que auto-configuran el tipo de autenticación, los campos requeridos y las pistas de etiquetas. Si tu servicio no está en el catálogo, elige "Custom" y define la credencial tú mismo (nombre, tipo, campos).

Para los servicios que admiten OAuth, el flujo abre una ventana del navegador a la pantalla de consentimiento del proveedor. Para los servicios con clave de API, pega la clave en la entrada segura. De cualquier forma, la credencial aterriza cifrada y el selector ofrece aplicarla a cualquier agente que tenga un cupo de capacidad abierto en la categoría coincidente.

### Paso a paso

:::steps
1. **Navega a Connections → Credentials** — barra lateral → Connections, luego la pestaña Credentials
2. **Haz clic en Add Credential** — botón arriba a la derecha de la lista de credenciales
3. **Elige una categoría** — email / almacenamiento / pagos / etc.; el catálogo de conectores coincidentes se filtra automáticamente
4. **Ejecuta el flujo de autenticación** — OAuth abre una ventana de consentimiento; los servicios con clave de API usan el campo de entrada segura
5. **Nombra y guarda** — dale a la credencial una etiqueta que reconozcas ("Stripe Live", "Gmail Personal"); la credencial se cifra con AES-256-GCM y se persiste
6. **Opcional: vincula a agentes ahora** — el selector muestra agentes con capacidades abiertas coincidentes; vincular con un clic evita perseguirlos después
:::

### Cómo funciona

Cuando haces clic en Save, el valor en bruto de la credencial se cifra con la clave de la bóveda derivada del keyring del SO y luego se confirma en el almacén de credenciales. El guardado solo devuelve el ID y la etiqueta de la credencial: el valor en bruto se borra de la memoria de inmediato. A partir de ese momento, la pestaña Connectors del editor del agente puede hacer referencia a la credencial por ID.

:::warning
Nunca pegues credenciales en prompts de agente, comentarios de código o ventanas de chat. Usa solo el campo de entrada segura de credenciales: cualquier otra cosa arriesga que el valor en bruto sea capturado en un log, una sincronización o una captura de pantalla.
:::

:::tip
La convención de nombres importa una vez que tienes más de 20 credenciales. \`<servicio>-<entorno>-<cuenta>\` ("stripe-live-main", "gmail-prod-support") deja claro al instante qué credencial elegir cuando configuras la pestaña Connectors de un agente.
:::
  `,



  "credential-health-checks": `
## Comprobaciones de salud de credenciales

Las credenciales se desvían con el tiempo: los tokens caducan, las claves se rotan en el origen, los scopes OAuth cambian. Las comprobaciones de salud de credenciales hacen ping periódicamente a cada credencial almacenada con una llamada de prueba ligera (una petición de API no-op que no cuesta nada y te dice si la credencial sigue siendo válida). Los resultados aparecen como un indicador de estado en la tarjeta de la credencial y como alertas cuando una credencial se degrada.

El calendario de comprobaciones es configurable. Por defecto, las credenciales OAuth se comprueban a diario (porque el flujo de refresh token necesita que la credencial se ejercite periódicamente de todos modos), las credenciales con clave de API se comprueban semanalmente. Las comprobaciones manuales se pueden ejecutar en cualquier momento desde la tarjeta de la credencial.

### Puntos clave

- **Estado por credencial** — verde (saludable), amarillo (por caducar / scope cambiado), rojo (rota / revocada)
- **Cadencia configurable** — overrides por credencial si un servicio limita la comprobación agresiva
- **Comprobación manual** — prueba con un clic desde la tarjeta de la credencial; útil antes de desplegar un nuevo agente
- **Proyección de caducidad** — para credenciales con fechas de caducidad conocidas (JWT firmados, tokens con scope), el estado pasa a amarillo N días antes de la caducidad (configurable, por defecto 7)
- **Enrutado de alertas** — los fallos se enrutan por los mismos canales de notificación que has configurado para los agentes

### Cómo funciona

Cada conector define su propia llamada de comprobación de salud (la petición más ligera posible que ejercite la credencial). La comprobación corre en segundo plano con la cadencia configurada; los resultados se persisten y actualizan el estado de la credencial. Si una comprobación falla, el estado cambia, la tarjeta de la credencial se resalta y los agentes dependientes heredan la advertencia en sus propios indicadores de salud, así una credencial de Gmail rota hace que cada agente que usa Gmail aparezca en amarillo hasta que lo arregles.

:::tip
Ejecuta una comprobación manual antes de cualquier despliegue de producción o ejecución programada nocturna. Cinco segundos ahora frente a una ejecución fallida a las 3 a. m. porque un token rotó en silencio.
:::
  `,

  "auto-credential-browser": `
## Navegador automático de credenciales

El navegador automático de credenciales es la incorporación impulsada por catálogo para nuevas credenciales. Abre Connections → Catalog y verás cada conector que Personas trae preconfigurado: 60+ servicios al momento de escribir esto, organizados por categoría (email, almacenamiento, pagos, comunicación, herramientas de desarrollo, CRM, proveedores de IA, etc.). Cada conector conoce el tipo de autenticación correcto, los campos requeridos, los scopes OAuth, los endpoints de la API y cualquier peculiaridad específica del servicio.

Cuando eliges un conector, el asistente te lleva por los pasos exactos para ese servicio, incluyendo enlaces a las páginas específicas en la UI del servicio donde encontrarías una clave de API, o qué scopes OAuth aprobar, o qué permisos importan. Para los servicios donde Personas puede detectar una conexión exitosa (la mayoría), el asistente verifica en tiempo real antes de guardar.

### Puntos clave

- **60+ conectores preconfigurados** — tipo de auth, campos, scopes, endpoints integrados
- **Orientación específica del servicio** — enlaces directos a la página exacta de clave de API o pestaña de ajustes
- **Validación en vivo** — el asistente prueba la credencial antes de guardar para la mayoría de los servicios
- **Flujo sugerido-para-agente** — al catálogo también se puede entrar desde la pestaña Connectors de un agente, donde se filtra a los conectores que coinciden con el cupo de capacidad abierto
- **Solicitar nuevos conectores** — los servicios que aún no estén en el catálogo se pueden solicitar; para casos puntuales, usa el tipo de conector Genérico / Personalizado

### Cómo funciona

Las definiciones de conector se envían con la app y se actualizan a través del ciclo regular de lanzamientos. Cada definición declara su flujo de autenticación, los campos requeridos, el endpoint de validación y la lista de scopes. Cuando eliges un conector, el asistente lee la definición, renderiza el formulario coincidente, ejecuta el flujo de OAuth o de clave de API y valida antes de guardar. El valor real de la credencial se cifra al guardar usando el mismo camino que una credencial añadida manualmente.

:::tip
El catálogo también es la forma más rápida de descubrir qué está integrado. Si estás considerando si Personas puede hacer X con el servicio Y, busca primero en el catálogo: si Y está ahí con una capacidad relevante, la integración es de un clic.
:::
  `,

  "which-agents-use-which-credentials": `
## Qué agentes usan qué credenciales

La pestaña Dependencies en Connections muestra el grafo credencial → agente. Elige una credencial a la izquierda y verás cada agente que la referencia a la derecha, con el cupo de capacidad específico nombrado ("Cuenta de Gmail para el agente email-summary"). Elige un agente y verás cada credencial de la que depende. El grafo es bidireccional: útil tanto para "¿qué se rompe si roto esta clave?" como para "¿qué credenciales necesita este agente antes de que pueda promoverlo?".

El mismo mapa de dependencias impulsa la comprobación previa del motor de construcción: cuando promueves un agente, el motor cruza cada capacidad requerida con la bóveda y marca credenciales faltantes o caducadas antes de permitir la promoción. Por eso casi nunca obtienes un error "credential not found" en tiempo de ejecución en agentes recién creados: la comprobación de dependencias se ejecutó al momento de promover y lo detectó.

### Puntos clave

- **Grafo bidireccional** — credencial → agentes y agente → credenciales
- **Cupo de capacidad nombrado** — la dependencia te dice no solo "esta credencial se usa" sino "se usa como la capacidad de envío de correo"
- **Comprobación previa** — validación al momento de promover que usa el mismo grafo
- **Vista previa de impacto** — seleccionar una credencial resalta cada agente que se vería afectado por su eliminación
- **Detección de credenciales sin uso** — las credenciales con cero dependencias de agente aparecen en el resumen de Connections para que puedas limpiarlas

### Cómo funciona

La pestaña Connectors de cada agente guarda la referencia a la credencial por cupo de capacidad. La vista Dependencies consulta este almacenamiento en ambas direcciones para renderizar el grafo. Los eventos de rotación, caducidad o eliminación de credenciales se propagan por el grafo: cualquier agente que dependa de una credencial degradada hereda el estado de advertencia en su indicador de salud, así que el grafo no es solo una referencia estática, es un camino de propagación en vivo.

:::warning
Antes de rotar o eliminar cualquier credencial usada por un agente sin supervisión (programado / webhook / cadena), comprueba el mapa de dependencias y actualiza los agentes para apuntar a la credencial de reemplazo primero. La comprobación previa te atrapa al momento de promover; para agentes ya promovidos, el fallo en tiempo de ejecución es la única señal.
:::

:::tip
Una rutina mensual de "auditoría de credenciales": abre Connections → Dependencies, ordena por más antigua y pregúntate "¿sigo usando esta credencial?" para la docena de abajo. Las credenciales sin uso son superficie de ataque para nada, así que eliminarlas es limpieza pura.
:::
  `,

  "refreshing-expired-tokens": `
## Renovar tokens caducados

Algunas credenciales están limitadas en el tiempo por diseño: los tokens de acceso OAuth caducan en minutos u horas; los tokens emitidos por servicios (tokens de bot de Slack, PATs de GitHub) suelen tener caducidades de N días o N años. Personas rastrea la caducidad donde el proveedor la publica y muestra un estado amarillo de "por caducar" algunos días antes del corte (configurable, por defecto 7 días).

Para credenciales OAuth con un refresh token, el refresco es automático y silencioso en segundo plano. Para claves de API y tokens que no se refrescan, verás la advertencia amarilla y la tarjeta de la credencial ofrecerá un botón "Reconnect" o "Replace": al hacer clic se abre el mismo asistente que creó la credencial.

### Puntos clave

- **Refresco automático para OAuth** — el refresh token se usa silenciosamente; no ves que ocurra
- **Advertencia anticipada para credenciales sin refresco** — estado amarillo N días antes de caducar; ventana de advertencia configurable
- **Reconectar con un clic** — la tarjeta de la credencial tiene un botón Reconnect que vuelve a ejecutar el flujo de autenticación
- **Cambio sin tiempo de inactividad** — para credenciales con agentes dependientes activos, el nuevo token reemplaza al antiguo en su lugar; los agentes toman el nuevo valor en su próxima ejecución
- **El fallo aparece en la salud del agente** — las credenciales que no se refrescan hacen que sus agentes dependientes aparezcan en amarillo / rojo en la pestaña Health

### Cómo funciona

El refresco se ejecuta como parte de la misma tarea en segundo plano que hace las comprobaciones de salud. Para OAuth, la tarea usa el refresh token para acuñar un nuevo token de acceso desde el proveedor y actualiza el registro de la credencial. Para tokens no refrescables, la tarea solo actualiza la proyección de caducidad (para que la advertencia amarilla aparezca en el momento correcto); el reemplazo real es una acción manual que tomas cuando se dispara la advertencia.

:::tip
Cuando se dispara una advertencia amarilla de caducidad, refresca de inmediato en lugar de esperar. Refrescar ahora es una tarea de un minuto. Dejar que un agente programado falle a las 3 a. m. porque el token caducó durante la noche es mucho más caro al deshacer las ejecuciones perdidas.
:::
  `,

  "deleting-credentials-safely": `
## Eliminar credenciales de forma segura

Eliminar una credencial es permanente: el registro cifrado se borra de la bóveda y no hay recuperación desde dentro de Personas. Antes de eliminar, la tarjeta de la credencial muestra la comprobación de dependencias: cada agente que referencia la credencial, en qué cupo de capacidad, con cuál sería el impacto. Puedes usar el diálogo de eliminación para reasignar cada agente dependiente a una credencial distinta antes de confirmar, así que la eliminación real es atómica con la reasignación.

Para credenciales OAuth, la eliminación solo quita el token almacenado localmente: no revoca el acceso del lado del proveedor. Si también quieres revocar del lado del proveedor, hazlo en la página de ajustes de seguridad del proveedor (se ofrece un enlace en el diálogo de eliminación para los principales proveedores).

### Puntos clave

- **Permanente e inmediato** — sin deshacer; el registro cifrado se borra al confirmar
- **Comprobación de dependencias por adelantado** — ve cada agente dependiente antes de confirmar
- **Reasignación en línea** — apunta los agentes dependientes a una credencial de reemplazo como parte del diálogo de eliminación
- **Proveedores OAuth: por defecto solo eliminación local** — la revocación del lado del proveedor es un paso aparte (enlace proporcionado)
- **Seguro como no-op para credenciales ya rotas** — eliminar una credencial caducada / revocada siempre es seguro; nada depende de un estado funcional

### Cómo funciona

El diálogo de eliminación lee el mismo grafo de dependencias que la vista Dependencies. Cuando confirmas, el motor escribe primero cualquier reasignación que hayas especificado y luego elimina el registro de la credencial de la bóveda en una sola transacción. Si las reasignaciones fallan la validación (por ejemplo, intentaste apuntar a una credencial de la categoría equivocada), la eliminación se revierte y nada cambia.

:::warning
Permanente significa permanente. El registro cifrado se borra, y si no anotaste el secreto en bruto en otro lugar, se acabó. Si pudieras necesitar la credencial otra vez, respalda externamente el valor en bruto antes de eliminar.
:::

:::tip
El patrón de rotación más seguro es "añadir nueva, reasignar todos los agentes, luego eliminar la vieja". Añade primero la credencial de reemplazo, recorre el mapa de dependencias para reasignar agentes dependientes uno por uno (o todos a la vez en el diálogo de reasignación), verifica que todo está saludable y luego elimina la credencial antigua. Esta secuencia garantiza cero tiempo de inactividad.
:::
  `,

  "connector-catalog": `
## Catálogo de conectores

El catálogo en Connections → Catalog es la lista curada de servicios con los que Personas se integra de forma nativa. Al momento de escribir esto, 60+ conectores en 9 categorías, con nuevos conectores añadidos en cada release según la demanda de los usuarios. Cada conector declara su tipo de autenticación (OAuth, clave de API, basic auth, bot token), los scopes / capacidades requeridos y la superficie de herramientas del lado del agente que expone.

Cuando la pestaña Connectors de un agente necesita una capacidad ("email-send", "cloud-storage-write", "chat-message-send"), consulta el catálogo en busca de conectores que satisfagan esa capacidad y luego cruza con tu bóveda. Si ya tienes una credencial para uno de esos conectores, hay coincidencia inmediata. Si no, el catálogo se ofrece a añadir una, abriendo el mismo asistente descrito en el tema del navegador automático de credenciales.

### Categorías de conectores

| Categoría | Ejemplos de servicios | Auth |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Payments | Stripe, PayPal, Square | API key |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, webhook genérico | OAuth / bot token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| AI Providers | Anthropic, OpenAI, Google, Ollama local, compatible OpenAI personalizado | API |
| Data | Postgres, Snowflake, BigQuery, SQL/HTTP genérico | URL + credenciales |

### Puntos clave

- **Coincidencia basada en capacidades** — los conectores exponen capacidades; los agentes necesitan capacidades; el catálogo los empareja
- **Peculiaridades específicas del servicio integradas** — IDs de workspace de Slack, scopes de PAT de GitHub, URLs de callback de OAuth, etc., todo preconfigurado
- **Indicadores de tipo de auth** — de un vistazo, ve qué conectores son OAuth vs. clave de API vs. local
- **Fallback Genérico / Personalizado** — para servicios que no estén en el catálogo, el tipo de conector Genérico acepta configuración HTTP/REST en bruto
- **Conectores de entrega por canal** — Slack, Discord, Teams, webhook genérico aparecen aquí también para la salida saliente del agente (configurada por agente en la pestaña Connectors)

### Cómo funciona

Las definiciones de conector viven en la app y se versionan junto con el binario. La pestaña Connectors de cada agente consulta el catálogo dinámicamente: añadir un conector al catálogo (en un release) lo hace disponible para agentes existentes sin migración por agente. Los conectores Genéricos / Personalizados que configuras localmente tienen scope de bóveda y no pasan por el catálogo.

:::tip
El catálogo también es una superficie de descubrimiento. Échale un vistazo de vez en cuando aunque no tengas una necesidad específica: a menudo encontrarás una integración que sugiere una nueva automatización. La categoría Communication en particular es rica para casos de uso de salida (entregar resultados del agente a Slack / Discord / Teams).
:::
  `,
};
