export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Crear un nuevo agente

Tienes dos formas de crear un nuevo agente. **Desde cero**: haz clic en \`Create Agent\`, dale un nombre y escribe tú las instrucciones. **Desde una plantilla**: explora la galería de plantillas, elige una que coincida con lo que quieres hacer (procesamiento de facturas, informes diarios, publicación en redes…), responde unas pocas preguntas cortas sobre tu caso de uso específico y deja que el motor de construcción ensamble el agente por ti. La mayoría empieza con una plantilla y la ajusta desde ahí.

De cualquier modo, elegirás un nombre y un ícono, seleccionarás qué modelo de IA impulsa al agente y qué herramientas (email, búsqueda web, acceso a archivos, etc.) puede usar. Ninguna de estas elecciones es permanente: puedes cambiar cualquier ajuste después.

:::steps
1. **Haz clic en Create Agent** — desde la barra lateral o la pantalla de inicio
2. **Elige un camino** — empezar en blanco o elegir una plantilla de la galería
3. **Responde las preguntas de construcción** — si fuiste por la ruta de plantilla; el motor de construcción adapta el agente a tus respuestas
4. **Nombra a tu agente** — y elige un ícono
5. **Ajusta el prompt y las herramientas** — afina las instrucciones que produjo la plantilla (o escríbelas desde cero)
6. **Promueve cuando esté listo** — el agente pasa de borrador a activo una vez que confirmas
:::

### Cómo funciona

El camino de plantilla ejecuta una sesión interactiva de construcción: el motor hace preguntas aclaratorias sobre tu caso de uso, propone parámetros (forma de la entrada, canales de salida, cadencia de calendario) y muestra una vista previa en vivo del agente que está por ensamblar. Lo apruebas al final y el agente queda listo para probar. El camino desde cero se salta todo eso: útil cuando ya sabes exactamente lo que quieres que haga el agente.

:::tip
Los buenos nombres de agente describen la tarea, no la tecnología. "Resumen de Correo Matutino" es más útil que "Agente GPT 3".
:::
  `,

  "writing-effective-prompts": `
## Escribir prompts efectivos

Un prompt es el conjunto de instrucciones que le das a tu agente. Los buenos prompts son específicos, concretos y ordenados: definen el rol del agente, enuncian la tarea, describen la forma de la entrada, especifican el formato de la salida y señalan los casos límite. Los prompts vagos producen salidas vagas: "resume mis correos" funciona mucho peor que "lee mis cinco correos sin leer más recientes y escribe un resumen de dos frases de cada uno, ordenados por importancia del remitente".

El motor de construcción te ayuda aquí. Cuando adoptas una plantilla, el motor hace preguntas aclaratorias por lotes por capacidad (fuente de entrada, canal de salida, formato, frecuencia) y teje tus respuestas en un prompt estructurado. Si escribes desde cero, eres tú quien hace ese tejido, pero los mismos cinco insumos son lo que produce agentes fiables.

### Lista de calidad del prompt

:::checklist
- Define el rol — "Eres una X que hace Y." Ancla el comportamiento del modelo.
- Enuncia la tarea de forma concreta — verbos, conteos, ventanas de tiempo. Evita "ayúdame con…"
- Describe la entrada — qué forma, qué campos, qué debe ignorar el agente
- Especifica la salida — viñetas vs. párrafos vs. JSON, con nombres de campo si es estructurada
- Maneja los casos límite — qué hacer cuando la entrada está vacía, mal formada o es inesperada
- Usa ejemplos — incluso un par entrada/salida mejora drásticamente la consistencia
:::

### Cómo funciona

Cada ejecución construye el prompt a partir de tu plantilla guardada, la carga del disparador y cualquier memoria del agente que el modelo pueda consultar. El modelo ve el mismo prompt que escribiste (en el orden en que lo escribiste) más la entrada: lo que devuelve es su intento honesto de seguir tus instrucciones. La pestaña de traza en el detalle de ejecución muestra el prompt exacto que se envió, así que cuando la salida se desvíe puedes ver si la culpa es del prompt o de la entrada.

:::tip
Escribe el prompt como si le estuvieras dando indicaciones a un contratista nuevo, listo pero recién llegado. No des nada por sentado. La primera vez que el agente produzca salida, mira la traza y pregúntate: "¿habría entendido un contratista humano lo que quería con este prompt?".
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Modo de prompt simple vs estructurado

El editor de prompts ofrece dos modos. El **modo simple** es un único cuadro de texto libre: escribes el prompt como un bloque de prosa. Rápido para agentes pequeños o experimentales. El **modo estructurado** divide el prompt en cinco secciones con nombre (Identity, Instructions, Tools, Examples, Error Handling) para que puedas pensar cada preocupación por separado y editar una sin afectar a las demás.

Puedes alternar entre modos en cualquier momento sin perder trabajo. El editor analiza la prosa del modo simple en secciones estructuradas cuando subes y concatena las secciones estructuradas de vuelta en un único bloque cuando bajas.

:::compare
**Modo simple**
Un solo cuadro de texto. Prosa libre. Rápido para redactar, rápido para iterar. Ideal para experimentación y agentes personales donde tú eres el único lector.
---
**Modo estructurado** [recommended for shared/production agents]
Cinco secciones con nombre: Identity, Instructions, Tools, Examples, Error Handling. Más lento de redactar pero más fácil de mantener. Cada sección puede revisarse y cambiarse de forma independiente, lo que importa cuando tú (u otra persona) vuelve al agente meses después.
:::

:::info
Ambos modos producen el mismo prompt internamente en tiempo de ejecución. El modo estructurado es una capa de UX que te ayuda a organizar tu pensamiento; el modo ve el prompt renderizado de cualquier manera.
:::

### Cómo funciona

Cambiar de modo no es destructivo: el editor guarda la representación estructurada internamente y el modo simple es una vista aplanada de ella. El historial de versiones conserva el modo en el que guardaste, así que restaurar una versión antigua trae también el modo en el que se creó.

:::tip
Empieza en modo simple mientras descubres lo que el agente debe hacer. Una vez que estés contento con el comportamiento, cambia a modo estructurado para el largo plazo: paga la primera vez que necesites ajustar solo la sección Examples sin releer todo el prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Las secciones del prompt estructurado explicadas

El modo estructurado divide el prompt en cinco secciones. Cada una tiene un trabajo específico, y el motor de construcción usa los mismos cinco cubos cuando genera prompts a partir de plantillas, así que las secciones no son un capricho de UI, son un contrato estable entre tu autoría y cómo el modelo ve al agente.

### Las cinco secciones

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — quién es el agente. Rol, personalidad, área de experiencia, estilo de comunicación. La línea "eres un…".
- **Instructions** — qué hace el agente, paso a paso. La tarea principal y cualquier sub-tarea, en el orden en que deben ocurrir.
- **Tools** — qué capacidades usa el agente y cómo usarlas. Cuándo llamar a qué herramienta, qué argumentos importan, qué hacer con los resultados.
- **Examples** — pares entrada/salida que muestran cómo se ve lo "bueno". La sección más infrautilizada y una de las de mayor impacto: un ejemplo sólido le gana a tres frases más de instrucción.
- **Error Handling** — qué hacer cuando la entrada falta, está mal formada o es inesperada. Dónde parar, qué reintentar, qué escalar a una revisión manual.

### Cómo funciona

El renderizador concatena las secciones en el orden mostrado, con delimitadores claros. Algunos modelos prestan más atención a las primeras secciones; el orden está diseñado para poner primero el rol y la tarea principal, con los ejemplos y el manejo de errores al final, donde siguen en contexto pero no diluyen el titular. Si usas prompts estructurados por primera vez, completa Identity e Instructions de inmediato y deja las otras vacías: el modelo funcionará bien y puedes añadir Examples / Error Handling según vayan apareciendo casos límite.

:::tip
Cuando un agente empieza a producir fallos en casos límite, mira la traza y pregúntate: "¿podría haber evitado esto con un ejemplo?". La mayoría de los problemas de "el agente es malo en X" son en realidad "nunca le mostré cómo se ve un buen X".
:::
  `,

  "agent-settings-and-limits": `
## Configuración y límites del agente

La pestaña Settings del editor del agente es donde pones las barandillas. Cada agente tiene límites sobre cuánto tiempo se ejecuta, cuánto cuesta por ejecución, cuántos turnos de modelo puede dar y cuántas copias pueden ejecutarse en paralelo. Los predeterminados son conservadores: lo suficiente para dejar que el trabajo real ocurra, lo suficientemente bajos como para que un agente mal portado no pueda generar una factura antes de que te des cuenta.

Los límites son especialmente importantes para los agentes sin supervisión (programados, disparados por webhook o por cadena). Las ejecuciones manuales las ves ocurrir; las programadas no, así que un prompt descontrolado podría dispararse cada hora durante una semana antes de que revises.

### Ajustes clave

- **Timeout** — tiempo total de reloj de pared antes de que la ejecución se aborte. Predeterminado 2 minutos; súbelo para modelos lentos o cadenas largas de uso de herramientas.
- **Budget cap** — coste máximo por ejecución, evaluado contra el medidor de coste en vivo; la ejecución se aborta de forma elegante cuando cruza el tope.
- **Max turns** — número de idas y vueltas modelo ↔ herramienta permitidas en una ejecución. Evita bucles de llamadas a herramientas en los que el modelo nunca converge.
- **Concurrency** — cuántas ejecuciones paralelas de este agente están permitidas. Configúralo a 1 para agentes con estado (para que no se solapen sobre la misma entrada); súbelo para trabajo por lotes en paralelo.
- **Memory access** — si el agente lee de su almacén de memoria en tiempo de ejecución (predeterminado activo en agentes con memorias habilitadas).
- **Failover provider** — proveedor de IA alternativo a usar cuando el principal devuelve errores por encima de un umbral. Configúralo en los agentes cuya disponibilidad te importe.

### Cómo funciona

Los límites los aplica el motor de ejecución, no el modelo. Cuando una ejecución alcanza un límite, se detiene de forma limpia: la traza parcial se conserva, la ejecución se marca con la razón (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`) y no persiste cargo ni mutación de estado por la parte cortada. La pestaña Health surfacea los cortes por límite como advertencias para que decidas si subir el límite o arreglar el prompt subyacente.

:::tip
Empieza con límites conservadores en cada agente nuevo. El momento más barato para descubrir un prompt descontrolado es en la tercera ejecución manual, no en la tercera programada de la noche.
:::
  `,

  "assigning-tools-to-agents": `
## Asignar herramientas a los agentes

Las herramientas son como apps en un teléfono: tu agente solo puede usar las que instales. Al asignar herramientas específicas, controlas exactamente lo que tu agente puede hacer. Un agente con acceso a correo puede leer y enviar mensajes; uno con búsqueda web puede consultar cosas en línea.

:::warning
Esto también es una función de seguridad. Un agente no puede modificar archivos por accidente si no tiene acceso a archivos, y no puede enviar correos si no tiene herramientas de correo. Siempre estás en control de lo que tus agentes pueden y no pueden tocar.
:::

### Tipos de herramientas disponibles

- **Email** — leer, redactar y enviar mensajes de correo
- **Web search** — consultar información en internet
- **File access** — leer y escribir archivos en tu computadora o almacenamiento en la nube
- **API calls** — interactuar con servicios externos y bases de datos
- **Clipboard** — leer y escribir en tu portapapeles
- **Messaging channels** — enviar resultados a Slack, Discord, Teams o cualquier endpoint genérico de webhook como parte de la salida del agente

### Cómo asignar herramientas

:::steps
1. **Abre la pestaña Connectors** — en el editor del agente; muestra cada capacidad que tu agente necesita frente a tu bóveda
2. **Elige una categoría, no un servicio específico** — selecciona "email" o "almacenamiento en la nube" y el selector muestra las credenciales coincidentes que ya tienes más conectores sugeridos si no las tienes
3. **Autoriza cualquier cosa nueva** — para servicios OAuth, harás clic en una pantalla de consentimiento única; la credencial resultante aterriza en tu bóveda y es reutilizable entre agentes
4. **Comprobación previa** — antes de promover el agente, el motor de construcción cruza cada capacidad requerida con la bóveda y marca lo que falte
5. **Guarda la configuración** — el agente usa las herramientas asignadas en su próxima ejecución; si una credencial caduca después, lo verás en el indicador de salud del agente
:::

:::tip
Asigna solo las herramientas que tu agente realmente necesita. Menos herramientas significa menos cosas que pueden salir mal, y tu agente se mantiene enfocado en su trabajo.
:::
  `,

  "prompt-version-history": `
## Historial de versiones del prompt

Cada guardado del prompt de un agente crea una versión inmutable. El historial vive junto al editor de prompts en la pestaña Prompt: ábrelo y verás cada guardado, con marca de tiempo, con el diff respecto a la versión anterior visible en línea. No hay límite; la primerísima versión se conserva indefinidamente.

El sistema también versiona automáticamente cuando el motor de construcción modifica un prompt (por ejemplo, durante la adopción de plantillas o la reconstrucción de parámetros), de modo que los cambios del motor aparecen junto a tus ediciones manuales con una etiqueta clara de "auto-generated".

### Puntos clave

- **Instantáneas automáticas** en cada guardado: ediciones manuales y del motor por igual
- **Restauración con un clic** — elige cualquier versión y conviértela en el prompt actual; la versión actual se guarda primero, así que las restauraciones nunca son destructivas
- **Diff en línea** — ve qué cambió entre dos versiones sin salir de la pestaña
- **Retención ilimitada** — las versiones nunca caducan ni se eliminan por limpieza

### Cómo funciona

El historial se guarda en la base de datos SQLite local (junto al agente mismo), por lo que es buscable de inmediato y funciona sin conexión. Cuando restauras una versión, el editor cambia a ella pero la versión previamente actual también se conserva: puedes volver atrás sin rehacer tu trabajo.

:::tip
Antes de un cambio arriesgado en el prompt, haz un guardado sin cambios para que el estado actual quede registrado en el historial. Después experimenta libremente: restaurar es un clic si el experimento falla.
:::
  `,

  "comparing-prompt-versions": `
## Comparar versiones del prompt

Cuando el comportamiento de un agente cambia y quieres saber por qué, la vista de diff en el historial de versiones muestra exactamente qué caracteres del prompt difieren entre dos versiones cualesquiera. Las adiciones se resaltan en verde, las eliminaciones en rojo. Es la forma más rápida de localizar una regresión: normalmente puedes ver el cambio culpable en segundos.

El diff respeta también las secciones del prompt estructurado: si comparas dos versiones en modo estructurado, el diff se segmenta por sección para que puedas ignorar las irrelevantes y centrarte en la que cambió.

:::code-compare
### Original
Resume los correos de mi bandeja de entrada.
Dame los puntos clave.
---
### Mejorado
Lee mis 5 correos sin leer más recientes.
Para cada correo, escribe un resumen de 2 frases
incluyendo el nombre del remitente y la acción necesaria.
Formatea como una lista numerada.
:::

### Puntos clave

- **Vista lado a lado** — ambas versiones visibles a la vez con resaltado a nivel de carácter
- **Diff por sección** para prompts estructurados — salta directo a la sección que cambió
- **Compara dos versiones cualesquiera** — no solo consecutivas; útil para "qué cambió desde la versión funcional de hace tres semanas"
- **Restauración rápida** — restaura cualquiera de las versiones directamente desde la vista de diff

### Cómo funciona

Abre el historial de versiones en la pestaña Prompt, marca las casillas de dos versiones y haz clic en Compare. El diff se renderiza en un panel lado a lado. Haz clic en Restore en cualquiera de los lados para hacerla actual; el diff queda abierto para que veas exactamente a qué revertiste.

:::tip
Cuando encuentres el cambio culpable en un diff, copia la versión *nueva* (rota) en el prompt y sigue editando: así el historial de versiones registra tu intención ("probé X, lo deshice a Y, luego refiné a Z"). Restaurar sin dejar rastro pierde la lección.
:::
  `,

  "cloning-and-duplicating-agents": `
## Clonar y duplicar agentes

Clonar copia la configuración completa de un agente en uno nuevo: prompt (incluyendo el historial de versiones), herramientas, disparadores, ajustes, banderas de acceso a memoria, proveedor alternativo, todo excepto el estado de ejecución (las ejecuciones, los costes y los disparadores vivos no se trasladan). El clon es totalmente independiente: las ediciones en cualquiera de los lados no afectan al otro.

El uso más común es bifurcar un agente funcional para experimentar sin riesgos. El original sigue produciendo; el clon es tu caja de arena. Si el experimento es bueno, puedes reemplazar el original o conservar el clon como una especialización.

### Puntos clave

- **La configuración completa se traslada** — prompt, herramientas, disparadores, ajustes, memoria, alternativo
- **El estado de ejecución no** — ejecuciones, costes, disparadores vivos pertenecen a un agente a la vez
- **Los disparadores se clonan pero quedan desactivados** — para que el clon no empiece a dispararse de inmediato en el mismo calendario/webhook que el original
- **Los agentes clonados reciben un sufijo "(Copy)"** por defecto; renómbralo antes de promoverlo

### Cómo funciona

Haz clic derecho en un agente en la barra lateral o usa el menú de tres puntos en la barra del editor y elige \`Clone\`. El nuevo agente aparece en el mismo grupo con los disparadores desactivados. Reactívalos deliberadamente (y actualiza su configuración si no quieres que el clon escuche, por ejemplo, la misma URL de webhook que el original).

:::tip
Clonar es la forma más segura de hacer A-B a un cambio de prompt sin alterar un agente que ya está en producción. Haz el cambio en el clon, ejecuta ambos en la arena del Lab sobre las mismas entradas y solo cambia el agente de producción cuando el clon gane.
:::
  `,

  "agent-groups-and-organization": `
## Grupos y organización de agentes

Los agentes en la barra lateral están organizados por grupos: tus propias carpetas para acomodar cosas por equipo, proyecto, función o lo que te resulte útil. Vacíos por defecto; añades grupos a medida que tu colección crece y la lista plana deja de escalar.

La barra lateral también admite grupos anidados (un nivel de anidamiento), reordenamiento por arrastrar y soltar, estado de plegado/desplegado que persiste entre sesiones, e iconos por grupo para un reconocimiento visual rápido.

### Puntos clave

- **Crea grupos** según sea necesario: sin límite en su número
- **Arrastra para reorganizar** — suelta un agente sobre un grupo para moverlo, o reordena la lista soltando entre hermanos
- **Iconos y colores por grupo** — elige un ícono que insinúe el tema del grupo para encontrar el grupo correcto de un vistazo
- **Pliega para despejar** — los grupos plegados quedan plegados entre sesiones para que una lista larga no te entorpezca al arrancar
- **Anida un nivel** — útil para "Personal > Email", "Trabajo > Investigación", etc.

### Cómo funciona

Haz clic derecho en la barra lateral de agentes para añadir un grupo, o arrastra un grupo existente sobre otro para anidarlo. Los grupos se persisten en la base de datos local y no afectan a la ejecución del agente: son una capa puramente organizativa. Los agentes pueden estar en un grupo a la vez pero se mueven libremente entre ellos.

:::tip
Un grupo "Borradores" o "Experimental" al principio de tu barra lateral es un patrón útil. Todo lo que aún estás iterando vive ahí, y tus agentes de producción quedan en grupos con nombres claros más abajo. La separación visual reduce las posibilidades de editar el agente equivocado.
:::
  `,

  "disabling-and-archiving-agents": `
## Desactivar y archivar agentes

Dos formas de pausar un agente sin eliminarlo. **Desactivar** detiene todos los disparadores y bloquea las ejecuciones manuales; el agente permanece visible en la barra lateral con un ícono atenuado para que recuerdes que existe. **Archivar** mueve al agente a una sección de archivo oculta fuera del uso diario; deja de dispararse, no cuenta contra los límites del nivel y se puede restaurar en cualquier momento.

Ninguna operación toca las ejecuciones, los ajustes ni el historial de versiones. Archivar es más pesado: úsalo para agentes con los que has terminado por ahora pero podrías querer recuperar. Desactivar es más ligero: úsalo cuando necesites detener un agente temporalmente sin perderlo de vista.

### Puntos clave

- **Desactivar** — pausa la ejecución; el agente sigue visible en la barra lateral; reactivación con un clic
- **Archivar** — oculta el agente y libera su cupo frente al límite de tu nivel; restaurable para siempre
- **Ninguno elimina** — los ajustes, el historial del prompt y las ejecuciones pasadas se conservan
- **Los disparadores respetan la desactivación** — un agente desactivado ignora los eventos de calendario/webhook/observación de archivos; no se acumulan para reproducir al reactivar

### Cómo funciona

Abre el menú de tres puntos en la barra del editor del agente o haz clic derecho sobre el agente en la barra lateral. Disable / Archive / Restore viven ahí. Los agentes archivados son accesibles desde la sección Archive al final de la barra lateral de agentes; al restaurarlos vuelven a su grupo original (o a un cubo "Sin agrupar" si el grupo se borró mientras tanto).

:::tip
Archiva agentes estacionales (informes trimestrales, flujos de fiestas, conciliaciones de fin de mes) en vez de eliminarlos. Restaúralos cuando vuelva la temporada y estarán listos para ejecutarse de inmediato.
:::
  `,

  "agent-health-indicators": `
## Indicadores de salud del agente

Cada agente tiene un pequeño punto coloreado junto a su nombre que te indica su estado de un vistazo. **Verde** significa que todo funciona bien. **Amarillo** significa que algo necesita tu atención: tal vez una credencial está a punto de caducar o una ejecución reciente tuvo una advertencia. **Rojo** significa que hay un problema que necesita arreglo.

Estos indicadores te ahorran tener que revisar cada agente individualmente. Una mirada rápida a tu barra lateral te dice la salud de toda tu configuración.

:::feature
**Monitorización de salud de un vistazo**
Personas rastrea continuamente los resultados de ejecución, la caducidad de credenciales y la completitud de la configuración para cada agente. Los indicadores de salud se actualizan automáticamente: no hacen falta comprobaciones manuales.
:::

### Qué significa cada color

| Color | Estado | Significado |
|---|---|---|
| **Verde** | Saludable | Todas las ejecuciones recientes tuvieron éxito, no se detectan problemas, configuración completa |
| **Amarillo** | Advertencia | Algo puede necesitar atención pronto (credencial por caducar, rendimiento lento, configuración parcialmente completa) |
| **Rojo** | Error | El agente falló recientemente o tiene un problema de configuración |
| **Gris** | Inactivo | Desactivado o nunca ejecutado |

### Estado de configuración

Junto con la salud, cada agente tiene un **estado de configuración** que indica cuán listo está para ejecutarse de forma autónoma. Un agente recién promovido suele tener huecos de configuración: una credencial faltante, un disparador sin configurar, un canal de salida aún por conectar. La insignia de estado de configuración te muestra exactamente lo que queda por hacer, en orden de prioridad, para que no tengas que rastrear las pestañas para averiguar qué está bloqueando. Los agentes con problemas de configuración persistentes son retirados automáticamente de cualquier rotación programada o disparada por un disyuntor, así que nunca tendrás un agente medio configurado ejecutándose en silencio sobre datos malos.

### Cómo funciona

La salud se calcula automáticamente con base en los resultados de ejecución recientes, el estado de credenciales y la completitud de la configuración. Haz clic en el indicador para ver un resumen de lo que está causando el estado actual, incluyendo cualquier hueco de configuración. Desde ahí puedes saltar directamente a los ajustes, los logs o la pestaña específica que necesita atención.

:::tip
Haz costumbre escanear los colores de tu barra lateral una vez al día. Detectar un indicador amarillo a tiempo evita que se convierta en rojo, y resolver los huecos de configuración justo después de la promoción es el momento más barato para hacerlo.
:::
  `,
};
