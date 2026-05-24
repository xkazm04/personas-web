export const content: Record<string, string> = {
  "common-error-messages": `
## Mensajes de error comunes

Los mensajes de error pueden parecer alarmantes, pero la mayoría tienen soluciones sencillas. Esta guía traduce los errores más frecuentes a lenguaje claro y te indica exactamente qué hacer. No necesitas entender los detalles técnicos: solo empareja el error con el arreglo.

La mayoría de los errores caen en unas pocas categorías: problemas de credenciales, problemas de timeout y desajustes de formato de entrada. Una vez que conoces los patrones, la solución de problemas se vuelve natural.

### Lista de diagnóstico rápido

:::checklist
- Comprueba si la API del proveedor de IA está en línea y tu cuenta está activa
- Verifica la salud de las credenciales en el panel Credentials (busca indicadores rojos/amarillos)
- Revisa los límites de tasa: espera un minuto si has enviado demasiadas peticiones
- Prueba una ejecución manual con una entrada de prueba sencilla para aislar el problema
- Comprueba el formato de la entrada si los datos vienen de un disparador o pipeline
:::

### Errores más comunes

- **"Authentication failed"** — tu credencial ha caducado o se introdujo incorrectamente. Ve a \`Credentials\` y actualízala o vuelve a introducirla.
- **"Request timed out"** — el proveedor de IA tardó demasiado en responder. Intenta ejecutar de nuevo, o aumenta el timeout en los ajustes del agente.
- **"Rate limit exceeded"** — has hecho demasiadas peticiones demasiado rápido. Espera un minuto e inténtalo de nuevo, o sube de plan con tu proveedor.
- **"Invalid input format"** — los datos enviados a tu agente no estaban en el formato esperado. Comprueba el disparador o pipeline que alimenta datos a este agente.

### Cómo funciona

Cuando ocurre un error, aparece en el log de ejecución con un código y una descripción. Haz clic en el error para ver una explicación detallada y la solución sugerida. Muchos errores incluyen un botón \`Fix Now\` que te lleva directamente al ajuste que necesita atención.

:::tip
No te alarmes cuando veas un error. Lee el mensaje con atención: casi siempre te dice qué fue mal y te apunta hacia la solución.
:::
  `,

  "agent-not-responding": `
## El agente no responde

Si tu agente parece congelado, atascado o simplemente no produce resultados, no te preocupes: suele ser un arreglo sencillo. Las causas más comunes son una conexión a un proveedor de IA agotada por timeout, un problema de credencial o que el agente haya alcanzado su límite de turnos máximo. Sigue esta lista para retomar el rumbo.

La mayoría de los problemas de agente que no responde se resuelven cuando identificas y arreglas la causa subyacente, que casi nunca es un problema permanente.

### Lista de diagnóstico

:::steps
1. **Comprueba el log de ejecución** — busca mensajes de error o advertencias que expliquen el estancamiento
2. **Verifica tu proveedor de IA** — asegúrate de que la API del proveedor esté en línea y tu cuenta esté activa
3. **Comprueba las credenciales** — asegúrate de que las credenciales del agente no hayan caducado
4. **Revisa los límites** — el agente puede haber alcanzado su ajuste de timeout o de máximo de turnos
5. **Prueba una ejecución manual** — ejecuta el agente con una entrada de prueba sencilla para aislar el problema
:::

### Cómo funciona

Abre el agente y revisa su log de ejecución más reciente. Si muestra un error, sigue el arreglo para ese error específico. Si el log muestra que el agente sigue corriendo, puede estar procesando una tarea particularmente compleja. Comprueba el ajuste de timeout: si es demasiado corto, el agente puede estar deteniéndose antes de terminar.

:::tip
Si un agente está realmente atascado (sin progreso durante varios minutos), haz clic en \`Stop\` e intenta una ejecución manual con entrada más sencilla. Esto te ayuda a determinar si el problema es con la entrada o con el propio agente.
:::
  `,

  "credential-errors": `
## Errores de credenciales

Cuando un agente no puede conectarse a un servicio, suele ser porque una credencial ha caducado, se cambió una contraseña o se revocó un permiso. Estos son los problemas más comunes en cualquier sistema de automatización, y casi siempre se arreglan rápido.

La clave es identificar qué credencial está causando el problema y luego refrescarla o reemplazarla.

### Causas comunes

- **Token caducado** — los tokens OAuth caducan periódicamente y necesitan refrescarse
- **Contraseña cambiada** — si cambiaste una contraseña en otro lugar, actualízala también en Personas
- **Permisos revocados** — el servicio puede haber revocado el acceso que originalmente otorgaste
- **Credencial equivocada asignada** — el agente puede estar usando la credencial equivocada para el servicio

### Cómo funciona

Comprueba el mensaje de error en el log de ejecución: mencionará qué servicio falló. Ve a \`Credentials\` y encuentra la credencial para ese servicio. Comprueba su estado de salud. Si está en rojo o amarillo, haz clic en ella para ver qué está mal y sigue el arreglo sugerido: normalmente refrescar el token o volver a introducir la contraseña.

:::tip
Configura las comprobaciones de salud de credenciales para que se ejecuten automáticamente. Detectarán credenciales por caducar antes de que causen fallos en agentes, convirtiendo una crisis potencial en una tarea rutinaria de mantenimiento.
:::
  `,

  "trigger-not-firing": `
## El disparador no se activa

Un disparador que no se activa es frustrante, pero la causa suele ser algo pequeño: un error tipográfico de configuración, un problema de tiempos o un permiso faltante. Esta guía te lleva por los culpables más comunes para que tus automatizaciones vuelvan a correr.

El log del disparador es tu mejor aliado aquí. Registra cada intento de activación, incluyendo los que se filtraron o fallaron en silencio.

### Pasos de diagnóstico

:::steps
1. **Comprueba el log del disparador** — abre los ajustes del disparador del agente y haz clic en la pestaña \`Log\` para ver cada intento, incluyendo fallos
2. **Verifica que el disparador esté activado** — busca el interruptor; los disparadores desactivados no se activan
3. **Revisa los filtros** — comprueba tus condiciones de filtro, que pueden ser demasiado estrictas y bloquear todos los eventos
4. **Prueba manualmente** — usa el probador de disparadores para simular un evento y verificar la configuración
5. **Comprueba permisos** — confirma que los observadores de archivos tienen acceso a la carpeta y los webhooks tienen acceso de red
:::

### Cómo funciona

Abre los ajustes del disparador del agente y haz clic en la pestaña \`Log\`. Cada intento de disparo se lista con un estado: disparado, filtrado o fallido. Haz clic en cualquier entrada para ver por qué no se activó. El hallazgo más común es un filtro un poco demasiado estricto: ajustarlo suele resolver el problema de inmediato.

:::tip
Al configurar un nuevo disparador, empieza sin filtros. Una vez que confirmes que se activa correctamente, añade filtros uno por uno. Así sabes que cada filtro funciona como esperas.
:::
  `,

  "self-healing-explained": `
## Auto-recuperación explicada

Cuando algo falla durante la ejecución de un agente, el sistema de auto-recuperación intenta arreglar el problema y reintentar automáticamente. Es como tener una red de seguridad que atrapa la mayoría de los errores antes incluso de que los notes. Problemas comunes como cortes temporales de red, breves caídas de API o límites de tasa se manejan sin tu intervención.

Auto-recuperación no significa que tu agente nunca falle: significa que se recupera del tipo de problemas pequeños y temporales que de otro modo requerirían que lo reiniciaras manualmente.

### Puntos clave

- **Reintento automático** — los errores transitorios se reintentan con un backoff inteligente
- **Clasificación de errores** — el sistema distingue entre errores arreglables y no arreglables
- **Refresco de credenciales** — los tokens caducados se refrescan automáticamente cuando es posible
- **Transparente** — cada acción de auto-recuperación se registra para que veas qué ocurrió

### Cómo funciona

Cuando ocurre un error, el sistema de auto-recuperación lo evalúa. Los errores transitorios (timeouts de red, límites de tasa, caídas temporales) disparan un reintento automático tras una breve espera. Las caducidades de credencial disparan un intento de refresco automático. Los errores permanentes (configuración inválida, permisos faltantes) se reportan a ti de inmediato porque requieren tu atención.

:::success
Cuando la auto-recuperación tiene éxito, el agente continúa como si nada hubiera ocurrido. El log de ejecución marca el error recuperado con una insignia verde "healed" para que veas qué se atrapó y resolvió automáticamente.
:::

:::tip
Revisa el log de auto-recuperación de vez en cuando para ver qué se está atrapando. Si el mismo error sigue siendo recuperado, podría indicar un problema subyacente que vale la pena arreglar permanentemente.
:::
  `,

  "checking-system-health": `
## Comprobar la salud del sistema

La comprobación de salud integrada escanea toda tu instalación de Personas y reporta cualquier problema: componentes desactualizados, archivos faltantes, problemas de configuración o de conectividad. Ejecútala siempre que algo se sienta raro para una evaluación rápida del estado general de tu sistema.

Piénsalo como una visita al médico para tu setup de Personas. Un chequeo rápido puede atrapar pequeños problemas antes de que se vuelvan grandes.

### Qué comprueba

- **Versión de la app** — si estás ejecutando la última versión
- **Integridad de la base de datos** — tus archivos de datos locales están intactos y saludables
- **Estado de credenciales** — todas las credenciales almacenadas son válidas y funcionan
- **Conectividad de proveedores** — tus proveedores de IA son alcanzables y responden
- **Conexión a la nube** — la conexión a tu orquestador está activa (si está configurada)

### Cómo funciona

Ve a \`Settings > System Health\` y haz clic en \`Run Health Check\`. El escaneo tarda unos segundos y produce un informe. Los elementos en verde están saludables, los amarillos necesitan atención pronto y los rojos necesitan arreglo inmediato. Cada elemento incluye una descripción del problema y un arreglo sugerido.

:::tip
Ejecuta una comprobación de salud tras instalar actualizaciones, tras problemas de conectividad o antes de desplegar un agente crítico. Lleva solo segundos y te da tranquilidad.
:::
  `,

  "log-files-and-debugging": `
## Archivos de log y depuración

Los archivos de log son como una caja negra de avión para tu instalación de Personas. Capturan todo lo que pasó (ejecuciones de agente, eventos del sistema, errores y más) en orden cronológico detallado. Cuando algo falla y el log de ejecución no es suficiente, estos archivos contienen la historia completa.

No necesitas leer logs con regularidad, pero saber dónde están y cómo usarlos es invaluable cuando solucionas un problema complicado.

### Puntos clave

- **Registro automático** — todo se graba sin que tengas que activar nada
- **Organizado por fecha** — los eventos de cada día están en un archivo aparte para fácil navegación
- **Buscable** — encuentra eventos específicos por palabra clave, fecha o nivel de severidad
- **Compartible** — si contactas con soporte, puedes compartir extractos relevantes del log

### Cómo funciona

Los archivos de log se almacenan localmente en tu computadora. Accede a ellos desde \`Settings > Logs\` o navega directamente a la carpeta de logs. Cada archivo cubre un día y contiene entradas con marca de tiempo. Usa el visor de logs integrado para buscar, filtrar y explorar. Para solicitudes de soporte, el botón \`Export Log\` crea un extracto compartible.

:::tip
Al contactar con soporte sobre un problema, incluye el extracto de log relevante. Acelera drásticamente el proceso de solución porque el equipo de soporte puede ver exactamente lo que ocurrió.
:::
  `,

  "resetting-to-defaults": `
## Restablecer a valores predeterminados

Si has cambiado un ajuste y no consigues averiguar qué está causando un problema, restablecer a los valores predeterminados te da un punto de partida limpio. Esto solo restablece tus preferencias y ajustes de configuración: tus agentes, credenciales, memorias y datos se conservan. Nada importante se pierde.

Piénsalo como restaurar una habitación a su disposición original. Todas tus pertenencias (agentes y datos) se quedan, pero los muebles (ajustes) vuelven a donde empezaron.

:::warning
Restablecer elimina todas las preferencias personalizadas en una sola acción. Esto incluye tu tema, modelo predeterminado, ajustes de notificación y atajos de teclado. Tus agentes, credenciales, memorias y datos no se ven afectados, pero cualquier preferencia cuidadosamente afinada tendrá que reconfigurarse manualmente después.
:::

### Qué se restablece

- **Preferencias de visualización** — tema, diseño, ancho de la barra lateral y ajustes visuales
- **Modelo predeterminado** — vuelve al predeterminado recomendado
- **Ajustes de notificación** — restablecidos al comportamiento de notificación estándar
- **Atajos de teclado** — restaurados a las combinaciones de teclas originales

### Qué queda a salvo

- Todos tus **agentes** y sus prompts, historiales y configuraciones
- Todas tus **credenciales** en la bóveda
- Todas tus **memorias**, resultados de prueba y logs de ejecución
- Todos tus **pipelines** y configuraciones de equipo

### Cómo funciona

Ve a \`Settings > Advanced > Reset to Defaults\`. Revisa qué se restablecerá y luego haz clic en \`Confirm\`. Tus ajustes vuelven a sus valores de fábrica mientras todo tu trabajo se preserva. Luego puedes reconfigurar los ajustes uno por uno para identificar qué cambio estaba causando el problema.

:::tip
Antes de restablecer, anota cualquier ajuste que hayas personalizado intencionalmente. Así podrás restaurar rápido los que quieras tras que el restablecimiento arregle tu problema.
:::
  `,
};
