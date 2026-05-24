export const content: Record<string, string> = {
  "how-triggers-work": `
## Cómo funcionan los disparadores

Los disparadores son el "cuándo" de tu agente. El prompt y las herramientas definen *qué* hace el agente; el disparador define *cuándo* y *con qué entrada*. Personas incluye siete tipos de disparador: **manual** (clic de botón), **schedule** (estilo cron), **webhook** (HTTP entrante), **clipboard** (coincidencia en evento de copia), **file watcher** (eventos del sistema de archivos), **chain** (salida de otro agente) y **event-based** (eventos internos emitidos por otros agentes, plugins o el propio motor).

Cada agente puede tener cualquier número de disparadores, mezclados entre tipos. Un único agente podría ejecutarse en un calendario diario, reaccionar a un webhook de Stripe, dispararse cuando copies una dirección de correo y ser encadenable desde agentes anteriores, todo a la vez.

### Tipos de disparador

:::compare
**Manual**
Clic en el botón del editor o en la ejecución rápida de la barra de título. Cada agente lo trae por defecto. Ideal para pruebas e invocaciones puntuales.
---
**Schedule**
Basado en cron. Por hora, diario, semanal o expresión cron completa con zona horaria. Ideal para trabajo rutinario que corre sin entrada: resúmenes diarios, informes semanales.
---
**Webhook**
Una URL entrante única en la que el agente escucha. Servicios externos hacen POST a ella para iniciar al agente. Ideal para "reaccionar a un evento de un servicio de terceros".
---
**Clipboard**
Se activa cuando el texto copiado coincide con un patrón configurado (regex, tipo de contenido o palabra clave). Ideal para atajos de usuario avanzado: copia un correo, un agente lo busca.
---
**File Watcher**
Eventos del sistema de archivos en una carpeta vigilada (creación / modificación / borrado). Ideal para flujos de buzón donde los archivos llegan en momentos impredecibles.
---
**Chain**
La salida del agente A se convierte en la entrada del agente B. Ideal para pipelines multi-paso compuestos por agentes enfocados.
---
**Event-Based**
Se suscribe a eventos internos de Personas (caducidad de una credencial, un plugin emitió un evento, una ejecución terminó con manual_review). Ideal para automatizaciones reactivas dentro de tu propia configuración.
:::

### Puntos clave

- **Múltiples disparadores por agente** — sin tope superior; combina tipos libremente
- **Disparo independiente** — cada disparador se evalúa por su cuenta; un disparador programado no sabe ni le importa un disparador webhook en el mismo agente
- **Filtrado por disparador** — cada disparador puede tener sus propias condiciones de filtro (por ejemplo, el disparador de webhook solo se activa con \`event_type=charge.succeeded\`)
- **Linaje del disparador** — el lienzo Lineage (Events → Live Stream → Lineage) muestra qué disparadores, qué agentes y qué eventos están conectados, de extremo a extremo en toda tu configuración
- **Pausa individualmente** — desactiva un solo disparador sin tocar el resto del agente

### Cómo funciona

Los disparadores se configuran en la pestaña Settings del agente o añadiéndolos desde la lista de disparadores en la página Events. El motor de ejecución evalúa las condiciones de los disparadores de forma independiente y despacha una ejecución al agente cada vez que un disparador coincide. La ejecución lleva la carga del disparador (cuerpo del webhook, ruta del archivo, texto copiado, salida anterior, datos del evento) al agente como entrada.

:::tip
Empieza cada agente solo con un disparador Manual. Una vez que confíes en su comportamiento, añade disparadores automáticos uno por uno para poder aislar cuál introduce un problema si algo va mal.
:::
  `,

  "manual-triggers": `
## Disparadores manuales

Los disparadores manuales son el predeterminado para cada agente. Haz clic en \`Run\` en el editor y el agente arranca de inmediato, o usa el atajo de ejecución rápida de la barra de título (\`Ctrl+Enter\` sobre el agente enfocado). Las ejecuciones manuales son tu forma de desarrollar y probar: son el equivalente a ejecutar un script directamente para ver qué hace antes de añadir una entrada cron.

Puedes pasar entrada personalizada cada vez. El editor del agente muestra un pequeño campo de entrada junto al botón Run cuando el agente declara que acepta entrada; lo que escribas pasa como carga del disparador.

### Puntos clave

- **Sin configuración** — los disparadores manuales siempre están disponibles
- **Entrada opcional** — escribe entrada directamente, pega JSON estructurado o ejecuta sin entrada para agentes que no la necesiten
- **Ejecuciones de diagnóstico** — las ejecuciones manuales se etiquetan \`manual\` en la traza para que puedas filtrarlas en los informes de coste / métricas si quieres ver solo la actividad automática
- **Consciente de la concurrencia** — las ejecuciones manuales respetan el límite de concurrencia del agente; si se alcanza el límite, el clic se rechaza con un mensaje claro

### Cómo funciona

Los disparadores manuales existen implícitamente en cada agente: no hay un interruptor para apagarlos (usa \`Disable\` en todo el agente si quieres bloquearlo). El motor trata una ejecución manual idénticamente a una automatizada: mismo camino de ejecución, misma captura de traza, misma contabilidad de coste. La única diferencia es la etiqueta del disparador.

:::tip
Usa ejecuciones manuales durante la iteración del prompt. Guarda el prompt, ejecuta, mira la traza, edita. La arena del Lab es para comparación sistemática; lo manual es para retroalimentación rápida en el editor.
:::
  `,

  "schedule-triggers": `
## Disparadores programados

Los disparadores programados ejecutan un agente con una cadencia recurrente: cada hora, cada día laborable a las 8 a. m., el primer lunes del mes o cualquier expresión cron que puedas escribir. La UI de calendario te ofrece atajos predefinidos (por hora, diario, semanal) para los casos comunes, y un campo cron crudo para todo lo demás.

Los calendarios respetan una zona horaria configurable. Por defecto el agente usa la zona horaria de tu sistema, pero puedes sobreescribirla por disparador: útil para agentes que tienen que ejecutarse "a las 9 a. m. del Este" sin importar dónde estés tú.

### Puntos clave

- **Predeterminados y cron** — elige entre cadencias comunes o escribe la expresión cron completa
- **Zona horaria por disparador** — nombres IANA (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); el horario de verano se maneja automáticamente
- **Vista previa de la próxima ejecución** — el disparador muestra las tres siguientes horas programadas para que valides tu expresión cron
- **Pausa sin perder** — desactivar un disparador programado no lo elimina; reactívalo para reanudar

### Configurar un calendario

:::steps
1. **Abre los ajustes de disparadores** — en la pestaña Settings del agente o desde la página Events; haz clic en \`Add trigger\` y elige Schedule
2. **Elige un predeterminado o escribe un cron** — \`0 8 * * 1-5\` para "8 a. m. de lunes a viernes", o usa un predeterminado para los casos comunes
3. **Configura la zona horaria** — por defecto la del sistema; cámbiala para agentes atados a un calendario de negocio específico
4. **Confirma la vista previa** — se muestran tres próximos tiempos de ejecución; verifica que coincidan con lo que esperas
5. **Guarda** — el disparador queda armado de inmediato y aparece en la lista de disparadores del agente con una cuenta atrás de "próxima ejecución"
:::

:::tip
Los disparadores programados no rellenan ejecuciones perdidas. Si la app está cerrada o la máquina dormida cuando pasa una hora programada, esa ejecución se omite. Para trabajo programado crítico, ejecuta el despliegue en la nube (nivel Builder) para que el orquestador maneje el calendario del lado del servidor.
:::
  `,

  "webhook-triggers": `
## Disparadores por webhook

Los disparadores por webhook exponen una URL entrante única en la que el agente escucha. Cuando un servicio externo hace POST a esa URL, el cuerpo se convierte en la carga del disparador y el agente se ejecuta. La mayoría de los servicios de terceros que soportan webhooks (Stripe, GitHub, Shopify, Linear, Twilio, APIs internas personalizadas) funcionan sin modificación.

El disparador admite filtrado sobre el cuerpo, las cabeceras y el método de la petición para que un único endpoint pueda ser selectivo sobre qué eventos realmente arrancan al agente. Patrón común: una URL de webhook por agente, filtrada a tipos de evento específicos del servicio aguas arriba.

### Puntos clave

- **URL única por disparador** — generada automáticamente; nunca compartida entre agentes o disparadores
- **Expresiones de filtro** — coincidencias por JSONPath / cabecera permiten aceptar solo los eventos que te importan
- **Endpoint de reproducción** — cada webhook recibido se conserva y puede reproducirse manualmente desde la página de detalle del disparador
- **Send Test** — botón integrado que hace POST de cargas de muestra contra tu endpoint local para validar filtros y la respuesta del agente sin el servicio externo
- **Entrante y saliente son cosas distintas** — ver abajo

### Conectar un webhook

:::steps
1. **Añade un disparador de webhook** — página Events → Add trigger → Webhook; vincúlalo al agente
2. **Copia la URL generada** — única para este disparador; nunca caduca a menos que elimines el disparador
3. **Configura el servicio externo** — pega la URL en la configuración de webhook del servicio (Stripe Dashboard, ajustes del repositorio de GitHub, etc.)
4. **Configura expresiones de filtro** — restringe a tipos de evento o formas de carga específicos para no ejecutar al agente con cada evento que el servicio emita
5. **Prueba** — usa Send Test con una carga de muestra (o dispara un evento real en el servicio aguas arriba); inspecciona la traza y ajusta filtros si hace falta
:::

### Webhooks entrantes vs salientes

Los webhooks vienen en dos sabores y vale la pena no confundirlos:

- **Webhooks entrantes (este tema)** — un servicio externo te llama *a ti* para iniciar a un agente. Stripe te avisa cuando un cargo tiene éxito; GitHub te avisa cuando se abre un PR.
- **Webhooks salientes (una función aparte)** — *tu* agente envía su resultado a un canal cuando termina. Personas trae entrega saliente de primera clase a Slack, Discord, Microsoft Teams y URLs de webhook genéricas, configurada por agente en la pestaña Connectors. La salida del agente se formatea apropiadamente para cada canal (bloques ricos de Slack, embeds de Discord, tarjetas de Teams) y se despacha una vez que la ejecución termina.

La mayoría de las automatizaciones acaban usando ambos: un webhook entrante inicia al agente, el agente hace su trabajo y un canal saliente entrega el resultado donde tu equipo esté mirando.

:::tip
Para webhooks locales de desarrollo o pre-producción, usa el botón \`Send Test\` con una carga de muestra en vez de configurar el servicio aguas arriba real. Iterarás filtros y prompts mucho más rápido sin dar la vuelta al servicio de terceros.
:::
  `,

  "clipboard-monitor": `
## Monitor del portapapeles

El monitor del portapapeles vigila el portapapeles de tu sistema y dispara al agente cuando el contenido copiado coincide con tus reglas. Copia un número de pedido: el agente lo busca. Copia una frase en un idioma extranjero: el agente la traduce. Copia el correo de un cliente: el agente saca su cuenta.

La coincidencia puede ser por palabras clave sencillas, patrones regex o heurísticas de tipo de contenido (dirección de correo, URL, número de teléfono, con forma de JSON, número, identificador estructurado). El disparador evalúa la regla en cada cambio del portapapeles y solo se activa cuando una regla coincide, así que permanece en silencio en segundo plano hasta que de verdad copies algo interesante.

### Puntos clave

- **Basado en reglas** — define una o más reglas por disparador; gana la primera coincidencia
- **Modos de coincidencia** — palabra clave, regex o heurísticas de tipo de contenido integradas (correo/URL/teléfono/JSON/etc.)
- **Silencioso por defecto** — las copias que no coinciden ni siquiera generan un log de evaluación; solo las coincidencias crean actividad
- **Modos de salida** — mostrar como notificación de escritorio, enviar a la bandeja del Cockpit o quedarse en silencio y solo escribir al feed de actividad del agente
- **Privacidad** — el contenido del portapapeles se queda local; nada se sube salvo a cualquier proveedor de IA que el propio agente llame

### Cómo funciona

El disparador se registra con el sistema de portapapeles del SO al arrancar la app. Cuando el portapapeles cambia, el nuevo contenido se evalúa contra cada regla de este disparador; la primera coincidencia dispara al agente con el contenido copiado como entrada. Las copias que no coinciden se descartan sin dejar rastro, así que el monitor no infla el log de actividad.

:::tip
Sé específico con las reglas. Un monitor del portapapeles que coincida con cada símbolo \`@\` se disparará en copias que no querías usar. Usa una regex de correo completa, o limita a "copias con forma de ID de cliente" (coincidiendo con la forma de tu propio ID).
:::
  `,

  "file-watcher-triggers": `
## Disparadores por observación de archivos

Los disparadores de observación de archivos se activan cuando archivos aparecen, cambian o desaparecen en una carpeta que has designado. Deja un CSV en una carpeta y un agente lo procesa. Guarda una imagen en un directorio "Procesar" y un agente OCR / clasificación actúa sobre ella. Modifica un archivo de configuración y un agente lo compara con la versión anterior.

Las carpetas vigiladas pueden estar en el sistema de archivos local o en cualquier ubicación sincronizada (OneDrive, Dropbox, iCloud). Los filtros acotan los eventos por tipo de archivo / patrón glob para no ejecutar al agente con cambios irrelevantes (como archivos \`.DS_Store\` de macOS o archivos temporales de intercambio del editor).

### Puntos clave

- **Vigila cualquier carpeta** — almacenamiento local o sincronizado en la nube; recursión a subcarpetas opcional
- **Tipos de evento** — creación / modificación / borrado; suscríbete a uno, a dos o a los tres
- **Filtros glob** — \`*.csv\`, \`**/invoices/*.pdf\`; soporta patrones de negación
- **Antirrebote** — modificaciones rápidas sucesivas se agrupan en un solo evento de disparador (sin doble disparo en flujos de guardar e inmediatamente guardar)
- **Carga** — el agente recibe la ruta del archivo y (cuando el archivo es lo bastante pequeño) el contenido en línea; si no, una ruta que el agente puede leer con su herramienta de acceso a archivos

### Cómo funciona

El disparador usa las API nativas del SO para observación de archivos (FSEvents en macOS, ReadDirectoryChangesW en Windows, inotify en Linux). El observador corre en el proceso del motor mientras la app está abierta. Cuando un evento coincide con el filtro del disparador, el motor despacha una ejecución del agente con los metadatos del archivo como entrada. El motor también enruta los eventos de observación de archivos al **productor ambiente**: cualquier agente suscrito al evento ambiente correspondiente puede reaccionar sin necesitar su propio observador.

:::tip
Crea una carpeta dedicada de buzón para cada agente que use un observador de archivos. Mezclar observadores en carpetas compartidas ("Descargas", "Escritorio") lleva a disparos sorpresa cuando guardas archivos no relacionados ahí.
:::
  `,

  "chain-triggers": `
## Disparadores en cadena

Los disparadores en cadena conectan agentes de extremo a extremo: cuando el agente A termina con éxito, el agente B arranca con la salida de A como entrada. Así se construyen las automatizaciones multi-paso: cada agente es pequeño y enfocado, la cadena los une en un pipeline.

Las cadenas pueden ramificarse (la salida de un agente alimenta a varios agentes posteriores) y converger (varios agentes anteriores alimentan a uno posterior). También pueden ser condicionales: el disparador puede tener un filtro que solo reenvíe salida que coincida con una condición, así solo ejecutas al agente posterior en los casos que importan.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Puntos clave

- **Cableado salida → entrada** — automático; el prompt del agente posterior ve la salida anterior tal cual (o transformada si configuras un transformador)
- **Ramificar y converger** — se admiten cadenas muchos-a-uno y uno-a-muchos
- **Reenvío condicional** — las expresiones de filtro en el disparador de cadena permiten reenviar solo bajo ciertas condiciones (la salida contiene "error" o un campo supera un umbral)
- **El fallo detiene la cadena** — si un agente anterior falla, los agentes encadenados posteriores no se ejecutan; el fallo aparece en la vista de linaje para que veas exactamente dónde se rompió la cadena
- **Visible de extremo a extremo** — el lienzo Events → Live Stream → Lineage muestra el grafo completo de los agentes encadenados y el flujo de ejecución en vivo

### Cómo funciona

En la pestaña Settings del agente posterior, añade un disparador Chain y elige al agente anterior. El motor suscribe al agente posterior al evento de finalización del anterior; cuando el anterior emite "execution complete with success", el motor reenvía la salida como entrada al posterior. Los filtros condicionales se evalúan del lado del servidor antes de que se despache la ejecución posterior.

:::tip
Cada agente de una cadena debería hacer exactamente una cosa bien. Una cadena de tres agentes pequeños y enfocados es mucho más fácil de depurar que un único agente que lo haga todo: puedes ver en la vista de linaje qué etapa falló, y puedes cambiar un agente por una versión mejor sin tocar el resto de la cadena.
:::
  `,

  "event-based-triggers": `
## Disparadores basados en eventos

Los disparadores basados en eventos suscriben a un agente a eventos internos de Personas. Cualquier cosa en la app que emita un evento (otro agente terminando, una credencial caducando, un plugin disparándose (como el plugin Drive emitiendo eventos \`drive.document.*\` cuando los archivos cambian en el Local Drive) o el propio motor marcando un caso de manual_review) puede impulsar a un agente suscrito.

Este es el tipo de disparador más flexible. A diferencia de los webhooks (que vienen de sistemas externos) o los calendarios (que se activan por reloj), los eventos vienen de dentro de tu propia configuración de Personas. Construye configuraciones impulsadas por eventos donde una señal puede repartirse a varios agentes sin cableado explícito.

### Puntos clave

- **Suscríbete a cualquier evento** — eventos de finalización de agente, eventos de plugin, eventos del motor, eventos personalizados emitidos por otros agentes
- **Conscientes de la carga** — cada evento lleva datos (la salida del agente, la ruta del archivo, el ID de la credencial); el agente suscrito los recibe como entrada
- **Uno a muchos** — varios agentes pueden suscribirse al mismo evento y todos se ejecutan en paralelo cuando se dispara
- **Expresiones de filtro** — restringe por campos de la carga (dispárate solo en eventos donde \`severity = critical\`)
- **Descubrible** — el registro de eventos es explorable en la página Events; puedes ver exactamente qué eventos están disponibles y qué campos llevan

### Cómo funciona

Añade un disparador Event al agente posterior y elige el evento del registro. El motor suscribe al agente al arrancar y despacha una ejecución con la carga del evento cada vez que se dispara el evento correspondiente. Los eventos emitidos por plugins se ven idénticos a los emitidos por el motor desde la perspectiva del agente: todos fluyen por el mismo bus.

:::tip
Los disparadores basados en eventos son cómo construyes relaciones "si X entonces también Y" sin cambiar X. Añade un disparador de evento a un nuevo agente, apunta al evento que emite otro agente y el nuevo comportamiento ocurre de forma reactiva: el agente existente no sabe ni le importa.
:::
  `,

  "combining-multiple-triggers": `
## Combinar múltiples disparadores

Un agente puede tener cualquier número de disparadores de cualquier tipo. La mayoría de los agentes de producción tienen al menos dos: un disparador manual (para pruebas e invocación puntual) más uno o más disparadores automáticos (calendario, webhook, cadena, evento). Es común ver un agente con un combo calendario + webhook + cadena: el mismo agente puede correr como parte de un lote diario, en respuesta a un webhook en tiempo real y como paso en un pipeline encadenado.

Múltiples disparadores no interfieren. Cada uno se activa según su propio calendario o evento; si dos se disparan en el mismo instante, el agente corre dos veces (permitiéndolo el límite de concurrencia). La traza de cada ejecución captura qué disparador la inició.

### Puntos clave

- **Sin tope superior** — un agente puede tener docenas de disparadores
- **Evaluación independiente** — cada disparador evalúa y despacha de forma independiente
- **Filtrado y configuración por disparador** — los calendarios tienen su propio cron, los webhooks su propia URL, etc.
- **Etiqueta de disparador en la traza** — cada ejecución se etiqueta con el disparador que la inició, así puedes filtrar actividad por fuente de disparador
- **Desactivación selectiva** — desactiva un solo disparador sin tocar los demás

### Cómo funciona

La pestaña Settings → Triggers del agente muestra cada disparador adjunto, su estado (activado/desactivado) y su última hora de disparo. Añade nuevos con \`Add trigger\`; el mismo selector te permite crear cualquiera de los siete tipos. Los disparadores desactivados quedan en la lista para que puedas reactivarlos más tarde sin reconfigurar.

:::tip
Un patrón útil: mantén un disparador Manual activo para siempre (para depuración) y empareja cada disparador automático "real" con un disparador Manual hermano que tome la misma forma de entrada. Así puedes reproducir cualquier carga automatizada manualmente cuando quieras investigar.
:::
  `,

  "testing-and-debugging-triggers": `
## Probar y depurar disparadores

La pestaña Events → Test es el probador de disparadores. Para cualquier disparador puedes enviar una carga de muestra (cuerpo de webhook, evento de archivo, cadena del portapapeles, datos de evento) y ver exactamente lo que el agente recibiría y cómo respondería, sin el servicio externo ni la espera al momento real del disparador.

Para disparadores que sí se activaron pero el agente no corrió como esperabas, el log del disparador muestra cada evaluación: filtros que coincidieron, los que se rechazaron, forma de la carga, hora del despacho. El lienzo de linaje (Events → Live Stream → Lineage) es el equivalente visual: muestra evaluaciones y despachos de disparadores en vivo en toda tu configuración.

### Puntos clave

- **Simula cualquier disparador** — pega una carga y observa la respuesta del agente
- **Log de disparador** — cada intento de disparo queda registrado, incluyendo rechazos por filtro para que veas qué no coincidió
- **Lienzo de linaje** — grafo visual de disparadores, agentes y eventos con indicadores de flujo en vivo cuando hay disparos
- **Send Test para webhooks** — botón integrado que hace POST de un cuerpo de muestra contra el endpoint local
- **Reproducción** — disparos pasados pueden reproducirse con la carga original exacta, útil para "qué pasa si este webhook de Stripe le llega de nuevo al agente"

### Depurar un disparador paso a paso

:::steps
1. **Confirma que el disparador está activado** — pestaña Settings → Triggers del agente; un ícono atenuado significa disparador desactivado
2. **Revisa el log del disparador** — Events → Test → Logs filtrado por tu disparador; busca evaluaciones que no despacharon
3. **Inspecciona los filtros contra la carga** — si el disparador evaluó pero no despachó, una expresión de filtro lo está rechazando; copia la carga y prueba el filtro explícitamente
4. **Verifica que el despacho llegó al agente** — la traza de ejecución debería mostrar la etiqueta del disparador; si no apareció ninguna ejecución, el disparador nunca despachó (problema de filtro, límite de concurrencia o agente desactivado)
5. **Usa el lienzo de linaje** — para disparadores de cadena o evento, abre Lineage y traza el camino; verás dónde se interrumpe el flujo
:::

:::tip
"Mi disparador no se activa" casi siempre significa una de estas: el disparador está desactivado, un filtro es demasiado estricto, el agente está desactivado o el servicio externo no está enviando lo que crees que envía. El log del disparador distingue las cuatro en un minuto.
:::
  `,
};
