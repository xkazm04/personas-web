export const content: Record<string, string> = {
  "what-are-pipelines": `
## ¿Qué son los pipelines?

Un pipeline es un grupo coordinado de agentes que se pasan trabajo entre sí para manejar una tarea de varios pasos. En lugar de un agente grande que lo hace todo, construyes agentes pequeños y enfocados y los cableas juntos: cada uno se especializa y el pipeline maneja la orquestación. La sección Pipeline en la barra lateral es donde viven los pipelines; el Team Canvas dentro de ella es donde los compones.

Los pipelines en Personas son de primera clase: tienen su propio historial de ejecución, sus propias superficies de observabilidad, su propia memoria de equipo (contexto compartido que todos los agentes en el pipeline pueden leer) y pueden dispararse igual que un agente único (calendario, webhook, manual, cadena). La diferencia es que un disparador inicia un pipeline entero en lugar de un agente.

:::compare
**Agente único**
Un prompt, un conjunto de herramientas, una salida. Sencillo de configurar; limitado cuando la tarea se descompone naturalmente en etapas.
---
**Pipeline** [recommended for multi-stage work]
Varios agentes enfocados, cableados en un flujo. Cada agente es pequeño y fácil de depurar; el pipeline los compone en una capacidad mayor. La memoria de equipo compartida permite que los agentes pasen contexto estructurado, no solo texto. Visible en el lienzo del equipo de extremo a extremo.
:::

### Puntos clave

- **Flujo multi-agente** — los agentes pasan salida a entradas a lo largo de conexiones definidas
- **Memoria de equipo** — un almacén de contexto compartido que todos los agentes del pipeline pueden leer y escribir, separado de la memoria por agente
- **Editor visual** — el Team Canvas; coloca agentes, dibuja conexiones, configura enrutamiento
- **Reutilizable** — el mismo pipeline corre para cualquier carga de disparador coincidente; los pipelines también son clonables
- **Observables** — historial de ejecución completo a nivel de pipeline con desglose por agente

### Cómo funciona

Compones un pipeline en el Team Canvas: arrastras agentes, dibujas conexiones, configuras ramas condicionales si hace falta. Cuando el pipeline corre, los datos fluyen por las conexiones: la salida de cada agente se convierte en la entrada del agente posterior que el lienzo le haya cableado. El motor rastrea la ejecución de extremo a extremo así ves una ejecución de pipeline en lugar de N ejecuciones de agente disjuntas.

### Velo en acción

:::usecases
**Automatización DevOps**
Se abre un pull request en GitHub
---
El agente PR Reviewer analiza el diff, Test Runner verifica builds, Release Notes redacta un changelog, Slack Notifier publica el resumen en el canal de tu equipo: pipeline único disparado por el webhook de GitHub.
===
**Flujo de contenido**
Necesitas un post de blog publicado a partir de un tema
---
El agente Research recoge fuentes, Writer redacta la pieza, Editor la pule, Publisher la formatea para tu CMS: el pipeline gestiona los relevos y la memoria de equipo lleva la guía de estilo compartida.
===
**Triaje de soporte al cliente**
Llega un nuevo ticket
---
Classifier determina urgencia y categoría, Knowledge recupera documentos relevantes, Drafter escribe una respuesta candidata, Router escala a un humano si la confianza es baja.
:::

:::info
No hay tope superior estricto para el tamaño del pipeline. Empieza con dos agentes para validar el flujo de datos, crece añadiendo un especialista a la vez. Pipelines con 10+ agentes funcionan tan fiables como los pequeños; el motor maneja la orquestación idénticamente.
:::

:::tip
Trata a cada agente en el pipeline como una función de un solo propósito: una forma de entrada específica, una forma de salida específica. Cuanto más pequeño y enfocado sea cada agente, más fácil es depurar todo el pipeline y más reutilizables son las piezas individuales en distintos pipelines.
:::
  `,

  "the-team-canvas": `
## El lienzo del equipo

El Team Canvas es el editor visual para pipelines. Abre Pipeline → Team Canvas y verás tu pipeline como un grafo: nodos de agente conectados por aristas dirigidas. Arrastra agentes desde el panel de biblioteca de la izquierda, dibuja conexiones arrastrando desde el puerto de salida de un agente al puerto de entrada de otro, configura ramas con nodos condicionales. El lienzo admite paneo, zoom, selección múltiple, auto-layout y navegación por teclado.

El lienzo no es solo visualización: es el editor. Cada cambio que haces en el lienzo (colocar un agente, dibujar una conexión, añadir un nodo condicional) actualiza inmediatamente la definición del pipeline. Guarda para confirmar; el pipeline se versiona del mismo modo que los prompts de agente.

### Puntos clave

- **Arrastrar y soltar** agentes desde la biblioteca al lienzo
- **Dibujo de conexiones** — clic y arrastra desde el puerto de salida al puerto de entrada; los datos fluyen por la conexión en tiempo de ejecución
- **Nodos condicionales** — añade un nodo de enrutamiento entre agentes para ramificar según los datos
- **Auto-layout** — un clic ordena el lienzo en un flujo de izquierda a derecha o de arriba abajo
- **Versionado** — las instantáneas del lienzo se guardan con el pipeline; restaura diseños y topologías anteriores

### Construir tu primer pipeline

:::steps
1. **Abre Pipeline → Team Canvas** — barra lateral → Pipeline → New Pipeline (o abre uno existente)
2. **Explora la biblioteca de agentes** — panel izquierdo; filtra por grupo o busca
3. **Arrastra agentes al lienzo** — colócalos aproximadamente en orden de ejecución
4. **Dibuja conexiones** — puerto de salida (borde derecho) al puerto de entrada (borde izquierdo)
5. **Añade nodos condicionales si hace falta** — barra de herramientas → Conditional; configura ramas
6. **Guarda** — Ctrl+S; el pipeline queda confirmado y ejecutable de inmediato
:::

:::tip
Izquierda a derecha, arriba abajo es la convención más legible. Usa auto-layout (botón de la barra de herramientas) una vez que la topología esté fijada; produce un flujo visual limpio que ayuda a cualquiera que lea el lienzo, incluido tu yo futuro, a entender el pipeline de un vistazo.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Añadir agentes a un pipeline

Los agentes se añaden a los pipelines desde el panel de biblioteca a la izquierda del Team Canvas. Arrastra cualquier agente al lienzo para colocarlo; los ajustes predeterminados del agente se trasladan (prompt, herramientas, modelo, credenciales), pero puedes sobreescribir por pipeline si quieres que este agente se comporte ligeramente distinto aquí que en otra parte.

El mismo agente puede participar en varios pipelines, cada uno con su propio conjunto de overrides. Los cambios al agente subyacente (por ejemplo, una revisión de prompt en el editor propio del agente) se propagan a todos los pipelines que lo usan; los overrides por pipeline no, viven solo en el pipeline.

### Puntos clave

- **Arrastra desde la biblioteca** — cualquier agente que hayas creado está disponible
- **Overrides por pipeline** — mapeo de entrada, transformador de salida, preferencia de modelo (si quieres que este pipeline use un modelo más barato para esta etapa), proveedor alternativo
- **Reutilización entre pipelines** — un agente en el pipeline A y en el pipeline B tiene conjuntos de overrides independientes por pipeline
- **Los cambios del agente subyacente se propagan** — ediciones de prompt, cambios de herramientas, etc., fluyen a cada pipeline que usa el agente (los overrides por pipeline no)
- **Reemplaza un agente en su sitio** — clic derecho → Replace; el nuevo agente hereda las conexiones del antiguo si las formas de entrada/salida coinciden

### Cómo funciona

Colocar un agente en el lienzo crea una *referencia de alcance al pipeline* a ese agente. La referencia incluye el conjunto de overrides (cualquier personalización por pipeline) y la posición en el lienzo. En tiempo de ejecución, el motor resuelve la referencia, aplica los overrides encima de la configuración base del agente y despacha la ejecución.

:::tip
Resiste la tentación de meter personalizaciones pesadas por pipeline en el conjunto de overrides. Si te encuentras sobreescribiendo muchas cosas en un pipeline, suele ser más limpio clonar el agente (dándole al clon un nombre claro como "Email Writer - Pipeline B") y usar el clon: mantiene las personalizaciones por pipeline explícitas en lugar de ocultas dentro de paneles de override.
:::
  `,

  "connecting-agents-with-data-flow": `
## Conectar agentes con flujo de datos

Las conexiones en el lienzo son aristas dirigidas desde el puerto de salida de un agente al puerto de entrada de otro. Cada conexión lleva la salida del agente anterior al agente posterior como entrada: tal cual por defecto, o transformada por un transformador en línea (una pequeña expresión que reformatea la salida antes de pasarla).

Las conexiones son configurables: puedes añadir transformadores, etiquetarlas (útil en pipelines complejos) y activarlas o desactivarlas temporalmente para depuración sin eliminarlas. Múltiples conexiones pueden ramificarse desde una salida (broadcast: los agentes posteriores reciben los mismos datos) o converger a una entrada (el motor combina entradas de varios agentes anteriores en un objeto de entrada para el posterior).

### Puntos clave

- **Clic-arrastre** desde el puerto de salida al puerto de entrada para crear una conexión
- **Transformador opcional** — expresión en línea que reformatea los datos al pasar
- **Ramificación (fan-out)** — una salida a muchas entradas posteriores (ramificación paralela)
- **Convergencia (fan-in)** — muchas salidas anteriores a una entrada posterior (objeto combinado)
- **Activar/desactivar** — desactiva una conexión sin eliminarla (útil para despliegues por etapas)
- **Etiquetadas** — nombra las conexiones para claridad en pipelines complejos
- **Eliminar** — clic en la conexión → tecla Delete

### Conectar dos agentes

:::steps
1. **Encuentra el puerto de salida** — círculo pequeño en el borde derecho del agente origen
2. **Clic y arrastra** al puerto de entrada — círculo pequeño en el borde izquierdo del agente destino
3. **Suelta en el puerto de entrada** — se dibuja la línea; conexión confirmada
4. **Opcionalmente añade un transformador** — clic derecho en la conexión → Add transformer; escribe una pequeña expresión para reformatear datos
5. **Prueba ejecutando el pipeline** — haz clic en cualquier conexión durante una ejecución para inspeccionar los datos que pasan
:::

:::tip
Usa etiquetas de conexión y transformadores con generosidad en cualquier pipeline con más de 3-4 agentes. Las etiquetas hacen la topología autodocumentada; los transformadores te permiten mantener agentes reutilizables entre pipelines (un agente no tiene que saber qué formato podría producir un pipeline anterior distinto; el transformador lo adapta).
:::
  `,

  "pipeline-execution": `
## Ejecución del pipeline

Ejecutar un pipeline despacha la carga del disparador al primer agente (o agentes, si hay varios nodos de inicio), y cada agente posterior corre a medida que sus entradas están disponibles. El lienzo muestra la ejecución en vivo: los agentes brillan cuando corren, las conexiones se animan con los datos fluyendo y los nodos condicionales muestran qué rama se tomó.

El motor maneja el paralelismo automáticamente: si dos agentes no tienen dependencia entre sí, corren en paralelo. Si un agente depende de salidas de varios agentes anteriores, espera a que todos terminen. El tiempo total de reloj de pared lo determina la ruta crítica a través del grafo, no la suma de todas las duraciones de agentes.

### Puntos clave

- **Animación del lienzo en vivo** — ve qué agentes están corriendo, qué conexiones están fluyendo, qué ramas condicionales se toman
- **Paralelismo automático** — agentes independientes corren simultáneamente; los dependientes esperan a sus prerrequisitos
- **La ruta crítica determina el tiempo de reloj** — duración del pipeline = la cadena de dependencia más larga, no la suma de los agentes
- **Detener al primer fallo** — por defecto; configurable por pipeline si quieres ejecución tolerante a fallos
- **Reejecutar desde cualquier paso** — retoma después de un arreglo sin reejecutar las etapas anteriores exitosas

### Cómo funciona

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

Haz clic en \`Run\` (o espera a que el disparador se active automáticamente). El motor construye un plan de ejecución a partir de la topología del lienzo, despacha los nodos de inicio y procesa el grafo en orden topológico. Conforme cada agente termina, los agentes posteriores se vuelven elegibles y se despachan automáticamente. Un fallo pausa el pipeline en el paso fallido con el error visible en el inspector; arregla el problema subyacente y haz clic en \`Retry Step\` para reanudar.

:::tip
El agente más lento en la ruta crítica determina la duración del pipeline. Si tu pipeline se siente lento, ejecútalo una vez, mira las duraciones por agente en la traza, identifica la ruta más larga y optimiza el agente con mayor duración en esa ruta. Las ramas paralelas no ayudan si tu ruta crítica es lenta.
:::
  `,

  "conditional-routing": `
## Enrutamiento condicional

Los nodos de enrutamiento condicional permiten que un pipeline ramifique según los datos que está procesando. Suelta un nodo condicional en el lienzo, define una o más reglas ("si amount > 1000", "si email contiene 'urgent'", "si la salida del clasificador = 'support'"), y cablea cada rama a un camino posterior distinto. En tiempo de ejecución el condicional evalúa y enruta a la rama coincidente: solo esa rama corre.

Las reglas son basadas en expresiones: un pequeño DSL de comparaciones y operadores lógicos evaluados contra la salida del agente anterior. Sin código; el editor de expresiones tiene autocompletado para la forma de la salida anterior, así descubres los campos disponibles mientras escribes.

:::feature
**Enrutamiento basado en expresiones**
Las reglas condicionales se evalúan como expresiones contra la salida anterior. Compara campos, combina con AND/OR, cae a una rama predeterminada cuando nada coincide. No se requiere código, pero hay expresividad completa cuando la necesites.
:::

### Puntos clave

- **Múltiples ramas** — un nodo condicional, N ramas definidas por reglas, más un fallback predeterminado
- **La rama predeterminada es obligatoria** — garantiza que los datos no se queden atascados con condiciones no coincidentes
- **DSL de expresiones** — comparaciones (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), operadores booleanos (\`and\`, \`or\`, \`not\`)
- **Autocompletado sobre la forma anterior** — el editor de expresiones conoce el esquema de salida del agente anterior
- **Evaluación en vivo en la traza** — ve qué rama se tomó en cada ejecución del pipeline

### Cómo funciona

Suelta un nodo Conditional entre agentes. Configura la regla de cada rama en el editor de reglas; la rama predeterminada no necesita regla (es el fallback). En tiempo de ejecución el motor evalúa las reglas en orden; gana la primera coincidencia; si ninguna coincide, corre la rama predeterminada. La rama que corre ve la salida anterior como entrada; las demás permanecen inactivas para esta ejecución.

:::warning
Define siempre una rama predeterminada. Sin ella, una entrada no coincidente queda atascada a mitad de pipeline y produce una ejecución colgada, molesto de depurar. La rama predeterminada puede simplemente enrutar a un agente terminal de "log and stop" si realmente quieres que las entradas no coincidentes fallen ruidosamente, pero la rama tiene que existir.
:::
  `,

  "team-members-and-roles": `
## Miembros del equipo y roles

Cada agente en un pipeline puede llevar una etiqueta de rol: "Researcher", "Writer", "Editor", "Classifier", que describe su función dentro del pipeline. Los roles son puramente organizativos; el motor no los aplica ni los usa. Su valor es humano: cuando tú (u otra persona) abre el lienzo un mes después, las etiquetas de rol hacen el pipeline autodocumentado.

Más allá de la etiqueta, los roles también son útiles para la sustitución de agentes. Si tienes varios agentes que podrían cubrir el rol "Editor" (con distintos estilos de prompt o especialidades), la etiqueta de rol deja obvio qué cupo intercambiar cuando cambies de opinión. El Team Canvas admite reemplazo por arrastre sobre un rol: suelta un agente distinto sobre el rol existente y el lienzo te pregunta si sustituir, preservando las conexiones.

### Puntos clave

- **Etiquetas de rol de texto libre** — cualquier cosa legible para humanos; las comunes tienen sugerencias de autocompletado
- **Visibles en el lienzo** — las etiquetas de rol aparecen sobre cada nodo de agente para que la estructura del equipo se vea de un vistazo
- **Reemplazo por arrastre según rol** — suelta un agente nuevo sobre un cupo de rol para sustituir, preservando conexiones
- **Filtra la biblioteca por rol** — cuando tienes muchos agentes similares, filtra la biblioteca por rol para encontrar candidatos rápido
- **Las plantillas de pipeline usan roles** — la plantilla define los roles a cubrir, tú traes los agentes que encajan en cada rol

### Cómo funciona

Haz clic derecho en cualquier agente en el lienzo → Set role. La etiqueta aparece sobre el nodo del agente. Los roles viven en la definición del pipeline junto a la referencia del agente; no modifican al agente en sí. Las plantillas de pipeline llegan con roles predefinidos; instanciar una plantilla te pide elegir un agente para cada rol.

:::tip
Nombra los roles por responsabilidad, no por el agente actual. "Editor" es mejor que "Editor Claude Sonnet"; la descripción del rol sobrevive al agente específico que ahora lo ocupa. Si cambias de Claude a GPT para ese rol, la etiqueta de rol sigue siendo precisa.
:::
  `,

  "pipeline-run-history": `
## Historial de ejecuciones del pipeline

Las ejecuciones de pipeline son ejecuciones de primera clase en el mismo almacén al que van las ejecuciones de agente individuales. La pestaña Pipeline → Run History muestra cada ejecución con su disparador, entrada, estado, duración total, coste total y desglose por agente. Haz clic en cualquier ejecución para expandir la traza completa: trazas por agente, decisiones condicionales, salidas de transformador, resultado final.

El historial de ejecuciones persiste indefinidamente (sujeto a ajustes de retención en Settings → Data) y admite el mismo filtrado y búsqueda que las vistas de actividad por agente. Cada ejecución es inmutable: una vez capturada, la traza queda congelada, útil para auditorías a posteriori.

### Puntos clave

- **Captura completa** — entrada, trazas por agente (prompt, llamadas a herramientas, respuesta), decisiones condicionales, salidas de transformador, resultado final
- **Estado por agente** dentro de la traza del pipeline: éxito / fallo / omitido / pendiente
- **Tiempos total y por agente** — ve la ruta crítica e identifica cuellos de botella
- **Coste total y por agente** — coste del pipeline = suma de los costes por agente
- **Buscable y filtrable** — por fecha, disparador, estado, coste, duración, agente
- **Comparación de dos ejecuciones** — elige dos ejecuciones para diferenciar salidas por agente (útil para "¿qué cambió?")

### Cómo funciona

Las ejecuciones de pipeline usan el mismo almacén de ejecución que las ejecuciones de un solo agente pero con una envoltura adicional a nivel de pipeline que enlaza a todas las ejecuciones de agente hijas. La vista de historial consulta este almacén, hace join con los registros de ejecución de agente para desgloses por agente y renderiza el árbol de traza.

:::tip
Tras un cambio significativo en el pipeline (nueva regla condicional, agente cambiado, revisión de prompt en un agente miembro), elige una ejecución "antes" del historial y la ejecución "después" de la nueva, luego usa Compare para ver exactamente qué cambió. El diff a nivel de pipeline a menudo revela impacto que no verías mirando un solo agente de forma aislada.
:::
  `,

  "pipeline-templates": `
## Plantillas de pipeline

Las plantillas de pipeline son formas de pipeline preconstruidas que puedes adoptar como punto de partida. La plantilla define la topología (qué roles existen, qué ramas condicionales, qué transformadores) pero no vincula agentes específicos a cada rol. Cuando instancias una plantilla, el lienzo se abre con la topología en su sitio y te pide cubrir cada rol desde tu propia biblioteca de agentes.

Las plantillas cubren formas comunes: flujos de contenido (research → write → edit → publish), triaje de soporte (classify → route → respond → escalate), procesamiento de datos (ingest → validate → transform → store). La biblioteca de plantillas está en Pipelines → New Pipeline → Browse Templates.

### Puntos clave

- **Topología definida, roles flexibles** — la plantilla conoce la forma; tú aportas los agentes
- **Reglas condicionales y transformadores preconfigurados** — la lógica de enrutamiento de casos comunes viene integrada
- **Personalizable tras la instanciación** — una vez instanciado, el lienzo es tuyo para modificar
- **Patrones de mejores prácticas** — las plantillas vienen con manejo de errores y ramas de fallback estándar
- **Biblioteca en crecimiento** — se añaden nuevas plantillas según la demanda de los usuarios; también puedes guardar tus propios pipelines como plantillas para reutilizar

### Cómo funciona

Una plantilla es una definición de lienzo con cupos de rol en lugar de referencias a agentes. Instanciar crea un nuevo pipeline, copia el lienzo de la plantilla y te pide cubrir cada rol desde la biblioteca de agentes. Una vez cubierto, el pipeline es totalmente editable: no queda enlazado a la plantilla, así que las actualizaciones a la plantilla no se propagan (y las ediciones al pipeline no afectan a la plantilla).

:::tip
Incluso cuando ninguna plantilla encaja exactamente, elegir la más cercana y modificarla suele ser más rápido que construir desde cero. Las plantillas preresuelven la forma de orquestación (colocación de condicionales, ubicaciones de transformadores, topología de fan-out/fan-in); el trabajo restante es seleccionar agentes y afinar prompts, que es el trabajo en el que querías centrarte de todos modos.
:::
  `,

  "team-assignments": `
## Tareas asignadas al equipo

Los pipelines cablean cada paso a mano. Las tareas asignadas dan la vuelta a eso: le entregas al equipo un **objetivo** en lenguaje natural y el equipo determina los pasos por sí solo. Descompone el objetivo en una lista de verificación, elige al mejor agente para cada paso y los ejecuta en paralelo — deteniéndose solo para preguntarte cuando un paso falla o requiere una decisión.

Piénsalo como la diferencia entre dibujar un diagrama de flujo y hacer un briefing a un jefe de proyecto. Con un pipeline diseñas el flujo; con una tarea asignada declaras el resultado y dejas que el equipo se organice.

### Puntos clave

- **Primero el objetivo** — describe lo que quieres; el equipo lo descompone en pasos ordenados
- **Asignación inteligente** — cada paso se dirige al agente más adecuado (puedes fijar agentes manualmente, usar emparejamiento local rápido o dejar que el modelo decida)
- **Autodescomposición** — un clic convierte un objetivo en una lista de pasos editable que puedes ajustar antes de ejecutar
- **Ejecución en paralelo** — los pasos independientes se ejecutan al mismo tiempo; los dependientes esperan su turno
- **Revisión humana en caso de fallo** — un paso fallido pausa solo esa tarea asignada y te ofrece Editar / Reasignar / Omitir, con una notificación en la barra de título
- **Plantillas reutilizables** — guarda un objetivo con su distribución de pasos como plantilla y crea nuevas tareas asignadas a partir de ella
- **Despacho por chat** — pídele a Athena que "asigne esto al equipo de investigación" y ella lo configurará para tu aprobación

### Cómo funciona

Abre el lienzo de un equipo y haz clic en el distintivo **Asignaciones** (abajo a la izquierda). Pulsa **Nueva**, escribe un objetivo y rellena los pasos tú mismo o haz clic en **Autodescomponer** para que el asistente los proponga. Elige cómo se emparejan los agentes con los pasos, cuántos se ejecutan a la vez, y haz clic en **Crear e iniciar**. Observa cómo se actualiza la lista de verificación en vivo; si un paso falla, resuélvelo directamente. Guarda como plantilla todo lo que vayas a ejecutar de nuevo.

:::tip
Usa una tarea asignada cuando conozcas el resultado pero no los pasos exactos. Usa un pipeline cuando quieras un control preciso y repetible sobre cada conexión. Las plantillas tienden un puente entre ambas opciones — una tarea asignada guardada se convierte en un punto de partida de un solo clic.
:::
  `,

  "team-memory-and-goals": `
## Memoria y objetivos del equipo

Un equipo es más que un conjunto de agentes: son agentes que **recuerdan juntos** y avanzan hacia un resultado compartido. Dos cosas lo hacen posible: la memoria compartida del equipo y los objetivos.

### Memoria compartida del equipo

Mientras el equipo trabaja, registra decisiones y restricciones — "estandarizamos este formato", "esta cuenta está fuera del alcance", "el revisor rechazó el enfoque X". Esas notas se convierten en **memoria del equipo**, y un resumen compacto de las más importantes fluye al contexto de cada miembro en su próxima ejecución.

El resultado: el equipo converge en lugar de repetirse. Un agente no redescubre una decisión que ya tomó un compañero de equipo — la hereda. Puedes ver y curar esta memoria en el panel de Memoria del Equipo en el lienzo.

### Objetivos — orienta sin microgestionar

Vincula un equipo a un **objetivo** y deja de vigilar cada ejecución por separado. El objetivo rastrea el progreso mientras el equipo trabaja, y la app solo te muestra lo que realmente necesita una intervención humana — un objetivo atascado, un plazo que se acerca, un paso pendiente de tu revisión. Todo lo demás simplemente avanza.

Este es el ciclo de "fija la dirección, mantente en el nivel alto": defines el resultado y los límites; el equipo se encarga del resto y levanta la mano cuando te necesita.

:::tip
Piensa en la memoria del equipo como el conocimiento institucional del equipo y en el objetivo como su estrella polar. La memoria mantiene al equipo coherente de una ejecución a la siguiente; el objetivo lo mantiene orientado hacia algo que vale la pena hacer.
:::

### Puntos clave

- **Memoria compartida** — las decisiones y restricciones registradas por el equipo se inyectan en la próxima ejecución de cada miembro
- **Convergencia** — los miembros construyen sobre las conclusiones de los demás en lugar de volver a derivarlas
- **Vinculación de objetivos** — asocia un equipo a un objetivo para rastrear el progreso y las fechas límite
- **Visible, no enterrado** — la cola de atención solo muestra lo que te necesita (atascado, vencido, pendiente de revisión)
- **Curalo tú** — revisa, edita o elimina memorias del equipo desde el panel del lienzo
  `,

  "debugging-pipeline-issues": `
## Depurar problemas del pipeline

Cuando una ejecución de pipeline falla, el lienzo marca al agente fallido con un indicador rojo y la ejecución se pausa en ese paso. Abre la ejecución fallida desde el historial (o haz clic en el indicador en el lienzo en vivo) y el panel de depuración muestra la entrada del agente, el error, la traza hasta el fallo y cualquier salida parcial que el agente produjo antes de fallar. Desde el mismo panel puedes reintentar solo el paso fallido o reejecutar todo el pipeline desde el inicio.

Los fallos de pipeline más comunes son desajustes en la forma de los datos: un agente anterior produce salida en un formato ligeramente distinto al que el agente posterior espera. El inspector de conexión (haz clic en cualquier conexión) muestra los datos que pasan por ella en la ejecución más reciente, lo que suele bastar para detectar el desajuste.

### Puntos clave

- **Paso fallido resaltado** — indicador rojo en el lienzo, error completo en el panel de depuración
- **Inspector de conexión** — haz clic en cualquier conexión para ver datos en vivo o de la última ejecución que pasan por ella
- **Reintento desde el paso fallido** — arregla el problema y reanuda; las etapas anteriores exitosas no se reejecutan
- **Reproducción paso a paso** — reejecuta cualquier ejecución pasada del pipeline con la misma entrada para reproducir un fallo de forma determinista
- **Validación de conexión** — el lienzo puede precomprobar si los agentes anterior y posterior tienen formas de entrada/salida compatibles (detecta desajustes antes de la ejecución)

### Cómo funciona

El motor del pipeline emite eventos estructurados de fallo cuando una ejecución de agente falla. El panel de depuración se suscribe a estos eventos y renderiza la traza relevante + el inspector. El reintento desde paso lo soporta el motor: redespacha al agente fallido con el mismo contexto anterior, preservando el resto de la ejecución del pipeline.

:::tip
La mayoría de los fallos de pipeline son problemas de conexión, no de agente. Cuando algo se rompe, inspecciona primero las conexiones que alimentan al agente fallido: ¿qué forma recibió realmente? Es mucho más a menudo "los datos estaban mal" que "el agente estaba mal"; el inspector de conexión te dice cuál caso es en menos de un minuto.
:::
  `,
};
