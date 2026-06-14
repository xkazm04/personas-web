// Companion (Athena) — cuerpos de guía en español.
// Clave: id de tema (categoryId "companion").
export const content: Record<string, string> = {
  "meet-athena": `
## Conoce a Athena

Athena es la compañera integrada de Personas: siempre disponible, siempre en contexto. No es un chatbot añadido a un lado. Conoce tus agentes, tus objetivos, tu memoria y puede operar la app en tu nombre.

Vive en dos lugares a la vez. El **avatar del pie de página** — su cara animada en la esquina inferior derecha — es el punto de entrada: tócalo para abrir el panel de chat, o mantenlo pulsado para dictar un mensaje de voz sin que el panel se abra nunca. El **orbe flotante** es su segunda forma: una superposición que flota sobre tu trabajo para que puedas llegar a ella desde cualquier parte de la app. Cuando el orbe está activado (el valor predeterminado), el pie de página lo invoca y lo descarta; el propio toque del orbe abre el panel de chat completo.

Ambas superficies reflejan lo que Athena está haciendo de un vistazo. Mientras piensa, su avatar cambia de postura. Mientras habla, el orbe brilla al ritmo de su voz. Cuando una tarea en segundo plano termina, el orbe muestra una breve reacción. Esto no es decorativo: te dice su estado sin que tengas que abrir el panel.

Lo que Athena puede hacer va mucho más allá de responder preguntas. Puede responder preguntas y explicar funciones, sí, pero también puede navegar la app por ti, ejecutar tus agentes, archivar memoria, proponer actualizaciones de identidad y programar consultas futuras. Cuando el modo autónomo está activado, puede encadenar varios pasos seguidos sin que hagas ningún clic.

### Puntos clave

- **Avatar del pie de página** — tócalo para abrir/cerrar el panel de chat; mantenlo pulsado para dictar un turno de voz desde cualquier parte
- **Orbe flotante** — superposición arrastrable, los mismos dos gestos; se desliza a cada área durante los recorridos guiados
- **Opera la app** — Athena no solo aconseja; puede navegar rutas, ejecutar agentes y componer paneles de control
- **Siempre en contexto** — lee tu memoria, tus objetivos y el estado de los agentes antes de cada respuesta, así nunca empieza desde cero
- **Punto de partida** — los temas de esta sección Companion profundizan en cada aspecto: chat, voz, memoria, consultas proactivas, recorridos guiados, el Centro de decisiones y cómo operar la app por chat

:::tip
Si cierras el panel de chat, Athena sigue trabajando. Las tareas en segundo plano continúan en el orbe, los avisos proactivos siguen llegando y las respuestas de voz siguen reproduciéndose: cerrar el panel no la pausa.
:::
  `,

  "chatting-with-athena": `
## Chatear con Athena

Abre el panel y Athena te recibe con una **pantalla de bienvenida**: su avatar, un saludo breve y un conjunto de **fichas de inicio rápido** que cubren los puntos de partida más habituales. Haz clic en cualquier ficha y el mensaje se envía de inmediato; no necesitas escribir nada.

Para prompts predefinidos más allá del conjunto inicial, escribe \`/\` como primer carácter de un mensaje vacío. Se abre una **paleta de barra** encima del compositor con prompts preestablecidos que puedes filtrar escribiendo: **conóceme** (la entrevista inicial que arranca su memoria sobre ti), **mostrar objetivos**, **qué está en cola**, **decisiones recientes**, **operaciones en vivo**, **resumen de memoria** y **capacidades**. Las teclas de flecha navegan la lista, Intro elige el elemento resaltado y Escape limpia y cierra.

Cuando Athena responde, a menudo añade **fichas de respuesta rápida**: de dos a cinco prompts de seguimiento que encajan con el rumbo de la conversación. Haz clic en uno para enviarlo como tu próximo mensaje. Debajo de su última respuesta completada también aparecen tres **fichas de refinamiento**: **Más corto**, **Más detalle** y **Solo código**. Cada una reenvía tu último mensaje con un sufijo de dirección para que puedas moldear la respuesta sin reescribir.

El compositor permanece abierto mientras Athena responde. Puedes escribir en cualquier momento: si tu mensaje suena como una redirección ("en realidad, para" o "espera, en cambio…") interrumpirá la respuesta en vuelo y pondrá en cola tu nueva petición. Si suena aditivo ("y también…") se pone en cola tras la respuesta actual y se ejecuta después. Verás los mensajes en cola como pequeñas fichas sobre el compositor; puedes cancelar cualquiera.

El **modo autónomo** (el ícono ∞ en la cabecera del panel) permite a Athena encadenar trabajo de varios pasos por su cuenta. Cuando está activado y tiene más por hacer, programa un turno de seguimiento unos quince segundos después, hasta veinte turnos consecutivos. Un divisor fino en la transcripción marca cada continuación autónoma para que veas de un vistazo dónde lo dejaste tú y dónde tomó el control ella.

### Puntos clave

- **Pantalla de bienvenida** — las fichas de inicio disparan mensajes reales a través del mismo pipeline que los escritos
- **Paleta de barra** — escribe \`/\` para explorar prompts preestablecidos; filtra escribiendo, elige con Intro
- **Fichas de respuesta rápida** — 2–5 opciones de seguimiento que Athena ofrece al final de su respuesta
- **Fichas de refinamiento** — Más corto / Más detalle / Solo código; solo debajo de la última respuesta completada
- **Redirección a mitad de respuesta** — escribe mientras responde; se clasifica automáticamente como interrupción o cola
- **Modo autónomo** — Athena encadena hasta 20 turnos de trabajo dirigido por sí misma; cualquier mensaje tuyo cancela la cadena

:::tip
Los prompts de la paleta de barra están traducidos a los 14 idiomas soportados: si usas Personas en un idioma distinto al inglés, los mensajes preestablecidos llegan en tu idioma y Athena responde en él.
:::
  `,

  "voice-and-hold-to-talk": `
## Voz y mantener pulsado para hablar

Athena admite voz bidireccional completa: tú dictás, ella transcribe y responde, y su respuesta se reproduce con una voz sintetizada. Cada parte del proceso tiene una opción de privacidad.

### Dictar a Athena

**Mantén pulsado** el avatar del pie de página o el orbe flotante durante aproximadamente un cuarto de segundo. Aparece una insignia de micrófono y un pulso, y la transcripción provisional se muestra como un subtítulo junto al orbe. Suelta cuando hayas terminado de hablar: la transcripción se entrega a Athena y se ejecuta el pipeline de respuesta habitual. La respuesta se transmite al panel y, si hay un motor de voz configurado, se reproduce automáticamente. El panel no necesita abrirse nunca; un turno de voz funciona con él completamente plegado.

El **atajo de teclado global Cmd/Ctrl+Shift+A** invoca a Athena desde cualquier parte de la app e inicia un turno de voz con una sola tecla. Pulsa el atajo de nuevo para enviar, o Esc para cancelar sin enviar. Usa la misma sesión que mantener pulsado el orbe: un atajo a mitad de un recorrido es lo mismo que mantener pulsado el orbe.

### Motores de voz a texto

Hay dos motores disponibles, seleccionables en **Companion → Voice** bajo el panel STT:

:::compare
**Navegador (predeterminado)**
Usa la Web Speech API en el renderizador de la app. No requiere configuración. En Windows, el audio se reenvía al servicio de reconocimiento de voz en la nube del proveedor del SO: conveniente, pero fuera del dispositivo.
---
**Whisper local**
Transcripción en el dispositivo mediante un sidecar \`whisper-cli\`. El audio nunca sale de tu máquina. Requiere descargar un modelo Whisper y colocar el binario en la ruta esperada (la pestaña Voice muestra la ubicación exacta y el estado de descarga).
:::

### Motores de reproducción de voz

Cuando Athena responde, el resumen hablado puede venir de uno de dos motores:

:::compare
**ElevenLabs (nube)**
Síntesis de alta calidad usando una credencial de API de ElevenLabs y un ID de voz que eliges. Ajuste por voz: estabilidad, similitud, estilo y velocidad. La credencial se guarda en tu bóveda; la clave de API nunca llega al renderizador de la app.
---
**Piper (ONNX local)**
Síntesis en el dispositivo sin llamada de red en el momento de la síntesis ni credencial necesaria. Las voces se descargan desde un catálogo seleccionado de unas 17 voces en 14 idiomas. La pestaña Voice muestra cuáles están instaladas.
:::

### Avisos proactivos hablados en voz alta

Las consultas proactivas (objetivos que se acercan, fallos de agentes, recordatorios) también pueden pronunciarse, incluso cuando el panel de chat está cerrado. El TTS de llegada se dispara en el momento en que llega un aviso, usando el motor que hayas configurado. Un botón **Volver a reproducir** en el pie de página repite el último mensaje hablado si te lo perdiste.

:::tip
Si quieres voz sin ninguna llamada a la nube, combina Whisper local para dictar con Piper para reproducción. Ambos corren completamente en el dispositivo. La pestaña Voice muestra una ruta de instalación y un navegador de modelos para cada motor.
:::
  `,

  "athenas-long-term-memory": `
## La memoria a largo plazo de Athena

Athena te recuerda entre sesiones. No empieza desde cero cada vez que abres el panel: lee su memoria sobre ti antes de cada respuesta y la usa para darte respuestas que encajan con tu situación real.

### Qué recuerda

La memoria se organiza en niveles, cada uno cubriendo un tipo distinto de conocimiento:

- **Hechos** — cosas que ha aprendido sobre ti, tus proyectos y el mundo. "Prefieres resúmenes concisos." "La rama principal de este repositorio es master."
- **Preferencias procedimentales** — reglas de comportamiento que ha captado. "Al resumir un documento largo, comienza con la idea clave en una frase." "Para ejemplos de código, prefiere TypeScript."
- **Objetivos** — los objetivos activos y fechas límite que rastrea en tu nombre.
- **Perfil de identidad** — un documento \`identity.md\` en evolución que se lee en cada system prompt. Es la única fuente de "quién eres tú para Athena ahora mismo" y crece mediante ediciones ancladas, nunca reescrituras completas.
- **Episodios** — el propio historial de conversación, guardado como archivos markdown en tu máquina. La doctrina (los documentos de referencia propios de Personas) completa el conocimiento del producto.

### Arrancar con la entrevista inicial

En una instalación nueva, Athena ejecuta automáticamente una entrevista breve: unas pocas preguntas enfocadas que le dan suficiente información para escribir un perfil de identidad inicial. Puedes volver a ejecutar la entrevista en cualquier momento seleccionando **conóceme** en la paleta de barra o haciendo clic en la ficha correspondiente en la pantalla de bienvenida. Si ya existe un perfil de identidad, lo actualiza con diffs anclados; nunca borra el contexto que le diste antes.

### El navegador de memoria

Abre **Companion → Memory** para ver todo lo que Athena sabe. El visor de Brain lista episodios, hechos, preferencias procedimentales, objetivos y el documento de identidad, todo navegable. Haz clic en cualquier entrada para leer el contenido completo, sigue memorias vinculadas a entradas relacionadas y edita o corrige cualquier cosa que esté mal.

**Las correcciones son de un clic.** Cada punto en la vista de identidad tiene un control "Eso está mal". Haz clic y Athena registra la corrección como una señal de aprendizaje de alto valor y propone eliminar el punto incorrecto en una sola tarjeta de aprobación. Apruebas y la afirmación errónea desaparece.

### Privacidad

Los datos del cerebro — los cinco niveles de memoria — viven en tu máquina en \`~/.personas/companion-brain/\`. Nada se guarda en una base de datos en la nube. Si usas los motores locales Whisper para STT y Piper para TTS, tampoco sale ningún audio de tu máquina.

:::tip
La entrevista inicial es breve (unos minutos) y rinde beneficios de inmediato: las primeras respuestas de Athena tras una buena entrevista son notablemente más acertadas. Ejecútala antes de tu primera sesión real.
:::
  `,

  "proactive-check-ins": `
## Consultas proactivas

Athena no espera a que preguntes. Cuando ocurre algo que merece tu atención — una fecha límite que se acerca, un agente esperando, un recordatorio que fijaste — ella se pone en contacto primero. Estas son las consultas proactivas: tarjetas que aparecen en el panel de chat, opcionalmente pronunciadas en voz alta, sin que tengas que abrir nada.

### Qué desencadena una consulta

Athena evalúa las condiciones aproximadamente cada cinco minutos. Los desencadenantes que pueden generar una consulta incluyen:

- **Objetivo con fecha límite próxima** — un objetivo activo tiene una fecha límite dentro de las próximas 24 horas
- **Retraso de pendientes** — un compromiso personal ha quedado sin atender superando un umbral por nivel (escalando de 1 día a 3 días a 7 días)
- **Cadencia pendiente** — un ritual que fijaste (una consulta recurrente, un bloque de concentración) coincide con "ahora"
- **En este día** — una nota o reflexión del mismo día del calendario hace un mes, tres meses o un año, relacionada con tus objetivos activos
- **El agente te necesita** — una sesión de flota falló, lleva más de dos minutos esperando entrada o se ha quedado inactiva
- **Compromisos propios de Athena** — consultas programadas que Athena propuso y tú aprobaste durante una conversación, entregadas exactamente a la hora que comprometió

### Salvaguardas

El sistema está diseñado para ser útil sin ser molesto:

- **Horas tranquilas** — los avisos se retienen durante cualquier ventana de silencio que configures; nada se dispara mientras hayas pedido explícitamente silencio
- **Presupuesto diario** — por defecto Athena envía como máximo tres avisos al día de los tipos desencadenados; si descartas sistemáticamente un tipo de aviso, el presupuesto para ese tipo disminuye silenciosamente con el tiempo
- **Deduplicación** — el mismo desencadenante para el mismo asunto solo puede dispararse una vez hasta que lo resuelves; un agente fallido no generará un nuevo aviso cada cinco minutos

### Actuar sobre una consulta

Cada tarjeta ofrece dos acciones: **Atender** y **Descartar**. Atender abre el contexto relevante: el detalle del objetivo, la actividad del agente, la entrada de memoria. Descartar registra que lo viste. Si la voz está configurada, el cuerpo del aviso se pronuncia en el momento en que llega, incluso con el panel de chat cerrado.

:::info
Los incidentes de severidad alta, urgente y crítica omiten por completo el presupuesto diario de avisos: nunca se silencian por límites de frecuencia ni horas tranquilas. Los elementos de nivel seguridad siempre te llegan.
:::

:::tip
Configura un ritual de horas tranquilas en la paleta de barra (escribe \`/\` y elige "qué está en cola" para ver tus rituales) para definir una ventana en la que Athena retiene todas las consultas hasta que la ventana termine. Esto es útil para bloques de trabajo profundo donde quieres cero interrupciones.
:::
  `,

  "guided-walkthroughs": `
## Recorridos guiados

Cuando le preguntas a Athena cómo hacer algo, puede mostrártelo en lugar de solo explicártelo. Di "muéstrame cómo crear una persona" o "¿cómo configuro un conector?" y ofrece una elección: **Hazlo tú por mí** (ella hace el trabajo) o **Enséñame cómo hacerlo** (te guía para que lo hagas tú mismo).

Elige la opción del recorrido y comienza el tour guiado. El orbe de Athena se desliza por la pantalla hacia el área relevante: puedes verlo moverse. El elemento que quiere que mires recibe un anillo brillante suave con corchetes en las esquinas que se anclan a él. El resto de la interfaz permanece completamente visible y clicable; nada queda atenuado ni bloqueado. Un **panel de subtítulos** acompaña al orbe con la narración del paso y los controles: Atrás, Pausa, Saltar y Detener.

### Cómo funciona cada paso

Cada paso del recorrido narra lo que estás mirando y, cuando hay algo que hacer, espera a que actúes. Hacer clic en el elemento resaltado tanto avanza el tour **como** realiza la acción real: el tour y la app permanecen sincronizados. Algunos pasos son momentos de "tu turno" donde el avance automático está completamente pausado hasta que hagas clic. Otros pasos avanzan automáticamente tras una breve pausa una vez que has leído la narración.

El recorrido se puede controlar con el teclado: las flechas izquierda/derecha avanzan y retroceden, Espacio pausa y reanuda, y Escape detiene.

### Qué recorridos están disponibles

Athena ha creado tours para las superficies sobre las que los usuarios más preguntan:

- **Crear una persona** — el estudio de construcción, el desencadenador de "describe tu persona" del sello y el interruptor de construcción autónoma
- **Configurar un conector** — la ruta Vault, el flujo de Añadir nueva credencial y elegir un tipo de conector
- **Crear un disparador** — el hub de Eventos y el Builder del lienzo de enrutamiento
- **Adoptar una plantilla** — la galería de plantillas y la función Adoptar en una tarjeta de plantilla
- **Gestionar un incidente** — la bandeja de Incidentes de Overview y una fila de incidente
- **Configurar un objetivo y KPIs** — el tablero de Objetivos y el panel de KPIs

Cada recorrido termina con una llamada a la acción: Empezar a construir, Abrir el catálogo, Abrir el Builder o Configurar un objetivo, de modo que el camino de "enséñame cómo" lleva directamente al camino de "hacerlo".

### Señalar y tours improvisados

Más allá de los recorridos con guión, Athena puede señalar elementos individuales en medio de una conversación. Si preguntas "¿dónde está el feed de actividad?", puede hacer brillar un anillo sobre él y narrar un solo subtítulo sin iniciar un tour completo. También puede armar un tour breve de dos a seis pasos sobre la marcha para solicitudes de "muéstrame alrededor".

:::tip
Athena ofrece el recorrido o la opción de hacerlo-por-ti automáticamente cuando describes la persona que quieres: no necesitas conocer la frase exacta. Solo describe lo que quieres construir y ella presentará ambas opciones.
:::
  `,

  "the-decision-hub": `
## El Centro de decisiones

Algunas acciones de Athena necesitan tu aprobación explícita antes de ejecutarse. Cuando quiere hacer algo que cambia el estado — ejecutar un agente, actualizar tu perfil de identidad, programar una consulta futura, generar sesiones de flota — lo propone como una **tarjeta de aprobación**. La tarjeta se queda en el panel de chat hasta que actúas. Nada ocurre hasta que lo hagas.

### Qué aparece como tarjeta de aprobación

La variedad de acciones que se presentan de esta manera es amplia:

- **Ejecutar agentes** — ejecutar una persona con entradas dadas, o lanzar una construcción autónoma de un solo disparo
- **Escrituras de memoria e identidad** — actualizar tu perfil de identidad, escribir o eliminar un hecho o preferencia procedimental, escribir o actualizar un objetivo
- **Compromisos futuros** — una consulta programada que Athena propone ("te aviso sobre esto en tres días")
- **Trabajo de proyecto y desarrollo** — registrar un nuevo proyecto, poner en cola un escaneo de base de código
- **Operaciones de flota** — generar nuevas sesiones de trabajador de Claude Code, enviar entrada a una sesión, terminar una sesión, despachar una operación multi-sesión

### Las operaciones sensibles nunca se aprueban automáticamente

Ciertas categorías **nunca** se aprueban automáticamente, incluso cuando el modo autónomo está activado. Las actualizaciones de identidad y las escrituras de objetivos requieren tu revisión cada vez: Athena puede proponerlas, pero no puede confirmarlas sin tu clic. Esto es por diseño: las escrituras que moldean quién eres para Athena, y el estado de los objetivos que impulsa las consultas proactivas, siempre tienen a un humano en el ciclo.

### Aprobar todo

Cuando se acumulan varias tarjetas de aprobación de la misma sesión de flota — digamos, una sesión está esperando tres escrituras de archivos seguidas — el grupo de tarjetas muestra un botón **Aprobar todo** que resuelve cada tarjeta de tipo aprobación de esa sesión a la vez. Las solicitudes de orientación que necesitan respuestas escritas nunca se agrupan; permanecen individuales.

### Dónde vive el centro

Las tarjetas de aprobación aparecen en línea en el panel de chat, encima del compositor. También puedes ver aprobaciones pendientes de tus sesiones de agentes en ejecución allí: cualquier cosa que espera tu decisión aparece en un solo lugar en lugar de dispersa en vistas individuales de agentes.

:::info
Si Athena propone una acción y la rechazas, recibe el rechazo como retroalimentación y puede proponer una alternativa. Rechazar siempre es seguro: ningún estado cambia hasta que apruebas.
:::
  `,

  "operating-by-chat": `
## Operar la app por chat

Athena puede hacer más que aconsejar: puede manejar la app. Pídele que te lleve a algún lugar, abra un editor, construya un panel de control o llame a un servicio conectado, y lo hace, resaltando el destino para que tu mirada vaya a lo que acaba de traer.

### Navegar por voz o texto

Pídele a Athena que abra cualquier sección principal de la app — Overview, Agents, Events, Credentials, Settings y otras — y cambia la ruta de la barra lateral. El contenedor del destino parpadea un momento para que sepas adónde llegó. Esto funciona desde un turno de voz con el panel cerrado: di "llévame al feed de actividad" y la app navega mientras Athena lo confirma en el chat.

Desde un contexto específico, puede ir más profundo. Pide "ir al Lab del agente resumidor en modo comparación" y abre el editor de ese agente preseleccionado a la vista de comparación matricial. La selección de ruta y modo ocurre en una sola acción.

### Componer un cockpit personalizado

Cuando Athena quiere explicar algo operacional — el estado de tu flota de agentes, el resumen de un servicio conectado, aprobaciones pendientes — puede componer un **cockpit**: una cuadrícula de widgets en tu pestaña Home que muestra los datos directamente en lugar de volcarlos como prosa en el chat. Ensambla los widgets, persiste la especificación, te navega allí y el panel confirma con un destello del contenedor del cockpit.

También puedes pedirle que construya un cockpit explícitamente: "prepara un panel que muestre mis tres principales agentes y cualquier revisión pendiente." Los widgets que resultan útiles pueden fijarse permanentemente con un clic.

### Los botones Radar y Amanecer

Dos botones en la barra de herramientas de la compañera te dan acceso con un toque a los dos resúmenes operacionales más comunes de Athena:

- **Radar** — revisión de flota. Athena recopila previamente un resumen de tu almacén de ejecuciones — salud del equipo, progreso de objetivos, rendimiento de agentes, puntuaciones del Director — y razona sobre él en un único turno enfocado. Úsalo cuando quieras una lectura honesta de cómo está funcionando toda tu flota.
- **Amanecer** — informe matutino. Athena resume las últimas 24 horas en Mensajes, Revisión humana e Incidentes: cuántos llegaron, qué es urgente, qué está atrasado. Úsalo para orientarte al inicio de una sesión.

Ambos botones omiten el turno de chat para el paso de recopilación de datos: tu clic es el desencadenante, y el resumen se transmite de vuelta al panel como cualquier otra respuesta.

### Atajos "Pregunta a Athena" por toda la app

Otras partes de Personas muestran botones **Pregunta a Athena** que enrutan el contexto directamente hacia ella. La tarjeta de Optimización de flota en Mission Control, las páginas de objetivos, las vistas detalladas de mensajes y otras superficies los tienen. Hacer clic en uno envía el contexto relevante como un turno de voz a través del panel siempre montado: el orbe aparece brevemente, acusa recibo y el turno corre en segundo plano para que te quedes en la pantalla donde estabas.

:::tip
Athena puede llamar a tus servicios conectados directamente en el chat: incidentes de Sentry, pull requests de GitHub, canales de Slack, hilos de Gmail. Fija un conector en la barra de herramientas y puede obtener datos de él en un trabajo en segundo plano, luego reportar los resultados en su próxima respuesta sin que salgas de la conversación.
:::
  `,
};
