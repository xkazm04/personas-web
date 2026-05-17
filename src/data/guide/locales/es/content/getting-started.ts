export const content: Record<string, string> = {
  "installing-personas": `
## Instalar Personas

Tener Personas en tu computadora lleva alrededor de un minuto. Descarga el instalador para tu sistema operativo (Windows, macOS o Linux) desde la página de descargas y ejecútalo. El instalador es un único archivo sin asistente de configuración: haz doble clic, aprueba el aviso de seguridad y la app se abre. Las actualizaciones se entregan automáticamente en segundo plano, así que siempre tendrás la última versión sin tener que hacer nada.

La primera vez que se abre la app, llegarás a la pantalla de bienvenida. Desde ahí puedes saltar directamente a construir un agente (Personas te ofrecerá configurar un proveedor de IA cuando lo necesites) o abrir primero la bóveda de credenciales si ya tienes claves de API que quieras guardar. Ambos caminos funcionan.

:::steps
1. **Descarga el instalador** — elige el archivo correcto para tu SO (NSIS \`.exe\` en Windows, \`.dmg\` en macOS, \`.AppImage\` o \`.deb\` en Linux)
2. **Ejecuta el instalador** — doble clic en Windows, arrastra a Aplicaciones en macOS, ejecútalo en Linux
3. **Aprueba los avisos de seguridad** — tu SO puede pedirte confirmación; es normal con software de escritorio nuevo
4. **Inicia Personas** — la pantalla de bienvenida se abre con un recorrido guiado que puedes hacer o saltar
5. **Opcional: conecta un proveedor** — pega una clave de API en la página de Conexiones si quieres estar listo para construir de inmediato
:::

:::info
Funciona en **Windows 10+**, **macOS 12+** y la mayoría de distribuciones modernas de **Linux**. El instalador de Windows es un NSIS \`.exe\` de 53 MB; el binario incluido pesa alrededor de 90 MB tras la instalación. Las actualizaciones automáticas son solo delta, por lo que suelen ser mucho más pequeñas.
:::

:::tip
Si te aparece un aviso de Windows SmartScreen o macOS Gatekeeper, es tu SO siendo precavido con software nuevo. Apruébalo y listo: el instalador está firmado digitalmente.
:::
  `,

  "creating-your-first-agent": `
## Crear tu primer agente

Tu primer agente lleva unos cinco minutos desde cero hasta un asistente funcional. Tienes dos caminos: **empezar desde una plantilla** (recomendado para tu primer agente: el motor de construcción arma una configuración funcional a partir de tus respuestas) o **empezar desde cero** (control manual total). Ambos terminan en el mismo lugar: un agente que puedes ejecutar.

Si eliges el camino de plantilla, el motor de construcción inicia una sesión interactiva. Hace preguntas aclaratorias por lotes ("¿qué tipo de entrada esperas?", "¿a dónde debe ir la salida?", "¿con qué frecuencia debería ejecutarse?"), propone parámetros según tus respuestas y muestra una vista previa en vivo del agente que está por construir. Lo apruebas al final y el agente queda listo para probar.

Si eliges el camino desde cero, escribes el prompt tú mismo, eliges el modelo de IA, adjuntas cualquier herramienta y guardas.

:::steps
1. **Abre la página Agents** — barra lateral → Agents, o pulsa \`Ctrl+1\` para saltar allí
2. **Haz clic en Create Agent** — elige un camino: una plantilla o empezar en blanco
3. **Responde las preguntas de construcción (camino de plantilla)** — el motor de construcción agrupa las preguntas aclaratorias por capacidad y muestra una vista previa en vivo a medida que tus respuestas dan forma al agente
4. **Ajusta el prompt y las herramientas** — afina las instrucciones que produjo la plantilla (o escríbelas desde cero)
5. **Promueve cuando esté listo** — pasa al agente de borrador a activo; las comprobaciones de estado de configuración se ejecutan automáticamente para marcar credenciales no conectadas o disparadores no configurados antes de poder promoverlo
:::

### Cómo funciona

El camino de plantilla es la forma más rápida de obtener un *buen* agente (las plantillas las diseñamos y probamos nosotros), pero acabarás superándolo. Una vez que hayas lanzado un par de agentes basados en plantillas, empezarás a escribir prompts directamente y a tratar las plantillas como puntos de partida en lugar de soluciones completas.

:::tip
No te preocupes por perfeccionar tu primer agente. El historial de versiones (que veremos más adelante) significa que puedes experimentar libremente: cada guardado es un punto de control al que puedes volver.
:::
  `,

  "understanding-the-interface": `
## Entender la interfaz

La interfaz de Personas tiene tres regiones principales. La **barra lateral** a la izquierda es tu navegación de primer nivel: Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment y Settings. Haz clic en una sección de primer nivel y aparece una segunda barra de navegación con sus subpáginas (por ejemplo, al hacer clic en Agents se muestran All Agents, además de las pestañas del editor para el agente actualmente seleccionado: Prompt, Connectors, Lab, Activity, Health, Settings).

El área central es el **espacio de trabajo** donde realmente ocurre todo: editar prompts, ver ejecuciones, explorar el catálogo de credenciales. La **barra de título** en la parte superior alberga la campana de notificaciones (haz clic para ver el detalle de ejecución más reciente), el acceso al cockpit ("Talk to Athena") y la búsqueda global. La **franja inferior** muestra las ejecuciones activas y cualquier evento urgente del sistema.

| Región | Para qué sirve |
|------|-------------|
| Barra lateral nivel 1 | Secciones de primer nivel: Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Barra lateral nivel 2 | Subnavegación sensible al contexto para la sección activa |
| Espacio de trabajo | El editor / explorador / panel principal según la sección en la que estés |
| Barra de título | Campana de notificaciones, atajo al cockpit, búsqueda global, controles de la app |
| Franja inferior | Ejecuciones activas, estado del sistema |

### Cómo funciona

La mayor parte de lo que haces ocurre haciendo clic en un elemento de la barra lateral y editando en el espacio de trabajo. La campana de notificaciones de la barra de título es el atajo universal que vale la pena memorizar: siempre abre el detalle de la ejecución más reciente, estés donde estés. El atajo al cockpit ("Talk to Athena") abre un chat dentro de la app con la compañera que puede ayudarte a construir, depurar o simplemente responder preguntas sobre tu configuración.

:::tip
Pasa el cursor sobre cualquier ícono de la barra lateral para ver un tooltip con el atajo de teclado. \`Ctrl+1\` a \`Ctrl+9\` saltan directamente a las secciones de primer nivel, y \`Ctrl+K\` abre la búsqueda global para que encuentres cualquier cosa por nombre.
:::
  `,

  "what-is-an-ai-agent": `
## ¿Qué es un agente de IA?

Un agente de IA es un modelo de IA configurado con un trabajo. Le das instrucciones ("lee mis correos sin leer y resume los importantes"), le indicas qué herramientas puede usar y lo disparas: manualmente con un botón, por calendario, por evento o como paso de un pipeline. El agente lee la carga útil del disparador, sigue tus instrucciones, llama a cualquier herramienta que necesite y produce una salida. A diferencia de un chatbot, el agente actúa: envía el correo, escribe el archivo, publica en Slack.

Cada agente en Personas es duradero: recuerda su configuración, su historial, sus credenciales y (opcionalmente) memorias de ejecuciones pasadas. Puedes clonarlo, controlar la versión de su prompt, ejecutarlo en una arena contra prompts alternativos para ver cuál rinde mejor, y encadenarlo a otros agentes para construir flujos de varios pasos.

:::compare
**Chatbot**
Escribes una pregunta, te responde. Cada turno es de una sola vez. Útil para consultas rápidas, lluvia de ideas, redacción. Sin acciones, sin memoria entre sesiones, sin automatización.
---
**Agente de IA** [recommended]
Una configuración persistente con un trabajo. Se dispara manual o automáticamente; usa herramientas para actuar; tiene prompt con control de versiones, credenciales adjuntas, historial de ejecuciones y un indicador de salud. El modelo es el motor, pero el agente es todo el ensamblaje a su alrededor.
:::

### Cómo funciona

:::diagram
[Trigger fires] --> [Agent reads input] --> [Model + tools execute] --> [Output dispatched]
:::

El disparador empaqueta una carga de entrada (un cuerpo de webhook, una cadena del portapapeles, una ruta de archivo, un evento de otro agente…). El agente lee su prompt, lo entrega al modelo de IA junto con la entrada y deja que el modelo invoque las herramientas adjuntas según sea necesario. La salida final se despacha por el canal de salida que hayas configurado: de vuelta a una UI, a un archivo, publicada en Slack o encadenada como entrada al siguiente agente.

:::tip
La forma más rápida de entender los agentes es mirar tus tareas repetitivas de la semana y preguntar: "¿podría dispararse, instruirse y automatizarse esto?". Si la respuesta es sí, esa tarea es un agente.
:::
  `,

  "running-your-first-automation": `
## Ejecutar tu primera automatización

Una vez que has creado un agente, tienes varias formas de iniciarlo. La más sencilla es el botón manual **Run** en la parte superior del editor del agente: haz clic y verás la transmisión de ejecución en vivo en el panel de actividad. En unos segundos (o un par de minutos para proveedores más lentos o prompts largos), aparece la salida.

Para trabajo recurrente, añade un disparador programado, un disparador de webhook, un disparador de observación de archivos o un disparador en cadena para que el agente se ejecute por sí solo. Configuras el disparador una vez y el agente hace el resto.

:::steps
1. **Abre el agente** — encuéntralo en la página Agents; el editor se abre con la pestaña Prompt enfocada
2. **Haz clic en Run** — el espacio de trabajo cambia a la pestaña Activity automáticamente; verás cómo se construye el prompt, sale la llamada al modelo y los tokens se transmiten de vuelta
3. **Observa el feed en vivo** — cada agente tiene su propio flujo para que puedas ejecutar varios en paralelo sin confusión
4. **Revisa la salida** — la fila de actividad se expande para mostrar el prompt completo, la respuesta del modelo, cualquier llamada de herramienta realizada, la duración y el coste
5. **Itera** — cambia el prompt o los ajustes, guarda, ejecuta de nuevo; cada ejecución queda registrada
:::

### Cómo funciona

Una ejecución es una sola ejecución: disparador → construcción del prompt → llamada al modelo → llamadas de herramientas → salida. Cada paso queda capturado en la traza de ejecución, y la ejecución aterriza en la pestaña Activity de la página Overview (la vista global de todos los agentes) y en la propia pestaña Activity del agente. Desde cualquiera puedes hacer clic en la ejecución para ver el modal con todo el detalle.

Si una ejecución falla (error de modelo, credencial caducada, problema de red), el indicador de salud del agente se vuelve amarillo o rojo y el fallo se conserva en la traza para que puedas depurar.

:::tip
Tu primera ejecución es en parte para aprender qué hace realmente tu prompt en la práctica. Si la salida no es lo que querías, la traza te muestra exactamente lo que recibió el modelo: normalmente el arreglo es aclarar o restringir el prompt en lugar de reintentar.
:::
  `,

  "choosing-your-ai-provider": `
## Elegir tu proveedor de IA

Personas soporta los principales proveedores de IA: **Anthropic** (familia Claude), **OpenAI** (familia GPT), **Google** (Gemini) y **modelos locales** a través de Ollama o cualquier endpoint compatible con OpenAI. También puedes configurar proveedores personalizados en Settings → Custom Models. Cada agente elige su proveedor/modelo de forma independiente, así puedes usar modelos baratos para trabajo rutinario y reservar los caros para tareas que los requieran.

Conecta un proveedor una vez en la página Connections (pegarás una clave de API, cifrada en la bóveda local, o pasarás por OAuth para proveedores que lo soporten). Después de eso, el selector de modelos de cada agente muestra los proveedores configurados y sus modelos.

:::compare
**Anthropic Claude** [recommended]
Excelente seguimiento de instrucciones, razonamiento de contexto largo, salida estructurada. Sonnet 4.6 es el predeterminado para nuevos agentes. Los modelos Opus para el razonamiento más exigente, Haiku para velocidad/coste. Excelente en bucles de uso de herramientas.
---
**OpenAI GPT**
El ecosistema más amplio y el más probado para muchos casos de uso. Sólido multiusos; los modelos clase GPT-4o son potentes para trabajo general de asistente.
---
**Google Gemini**
Multimodal, ventanas de contexto grandes, baja latencia de primer token. Fuerte para agentes de investigación / procesamiento de documentos.
---
**Local (Ollama / compatible con OpenAI)**
Se ejecuta en tu máquina: ningún dato sale del dispositivo. Modelos más pequeños, pero para trabajo de bajo riesgo o privado, la compensación suele valer la pena.
:::

### Cómo funciona

Una vez conectados varios proveedores, Personas puede hacer conmutación automática por fallo a nivel de agente: si tu proveedor principal devuelve errores por encima de un umbral, la siguiente ejecución del agente usa el proveedor alternativo configurado. Cuando el principal se recupera, se reanuda la rotación normal. Esto se configura por agente en Editor → Settings.

Para el seguimiento de costes, cada ejecución se etiqueta con proveedor, modelo y recuento de tokens, así que la pestaña Overview → Usage puede desglosar el gasto por proveedor, modelo o agente.

### Velo en acción

:::usecases
**Estrategia de modelo por agente**
Tus agentes tienen necesidades distintas
---
El agente de revisión de código usa Claude Opus (mejor razonamiento); el resumidor de correos usa Haiku (rápido y barato); un agente personal/privado corre localmente en Ollama.
===
**Conmutación por caída del proveedor**
Un proveedor sufre una caída regional
---
Los agentes afectados se enrutan automáticamente al alternativo configurado; la pestaña Health muestra qué agentes están ejecutándose en el alternativo y avisa cuando el principal vuelve.
===
**Reducción de costes**
El gasto mensual de IA se va inflando
---
Overview → Usage muestra qué agentes y modelos dominan el gasto. Cambia los agentes más caros a un modelo más económico (Sonnet → Haiku, GPT-4o → GPT-4o-mini); el Lab puede A-Bearlos primero para confirmar que la calidad se mantiene.
:::

:::info
El proveedor predeterminado para nuevos agentes se configura en Settings → Engine. Puedes sobreescribirlo en cada agente.
:::

:::tip
La mayoría de los proveedores ofrecen créditos de prueba gratis. Conecta dos o tres y ejecuta el mismo prompt en cada uno en la arena del Lab: notarás las diferencias de personalidad y elegirás un predeterminado que encaje con tu estilo.
:::
  `,


  "system-requirements": `
## Requisitos del sistema

Personas es una app de escritorio Tauri (backend en Rust, frontend en React, base de datos SQLite local) y está pensada intencionalmente para ser ligera. La mayor parte del cómputo pesado ocurre en los servidores del proveedor de IA, no en tu máquina. La app se mantiene casi a cero de CPU en reposo y usa unos cientos de megabytes de RAM; solo escala cuando se están ejecutando agentes localmente.

El binario incluido pesa unos 90 MB tras la instalación. Los plugins (Artist para generación de imágenes, Obsidian Brain para búsqueda vectorial) pueden añadir a esa huella si los activas.

:::checklist
- Windows 10+, macOS 12+ o Ubuntu 20.04+ (se recomienda la última versión)
- 4 GB de RAM mínimo (8 GB+ recomendado si usas los plugins de embeddings / búsqueda vectorial)
- 1 GB de espacio libre en disco (más si activas los modelos locales del plugin Artist)
- Banda ancha estable: la ejecución de los agentes está limitada por la latencia de la API del proveedor de IA
- Cualquier CPU moderna de doble núcleo; cuádruple núcleo o superior recomendado para ejecuciones paralelas multi-agente
:::

### Cómo funciona

La app almacena su base de datos (\`personas.db\`), la bóveda de credenciales, el historial de ejecuciones y la configuración localmente en el directorio de datos de la app específico de tu SO. Nada se sube salvo que actives explícitamente el despliegue en la nube o uses un proveedor de IA en la nube. Los plugins que incluyen modelos locales (p. ej. el plugin Artist con generación de imágenes + visión de Gemini) descargan los archivos del modelo en el primer uso.

La compilación de Windows usa ONNX Runtime para embeddings cuando la función de base de conocimiento vectorial está activada; en ese caso es la dependencia más grande.

:::tip
Si notas la app lenta durante una ejecución multi-agente, abre la pestaña Health: te muestra qué agentes y qué dependencias (llamadas al modelo, llamadas a herramientas, inferencia ONNX) están contribuyendo a la carga.
:::
  `,


  "where-to-get-help": `
## Dónde obtener ayuda

Nunca estás atascado. La **ayuda dentro de la app** es el camino más rápido: el chat del cockpit ("Talk to Athena" en la barra de título) es una compañera potenciada por LLM que conoce tu configuración, tus ejecuciones recientes y el producto. Hazle preguntas en lenguaje claro y también puede proponer cambios de configuración, llevarte a la pestaña adecuada o abrir una sesión de depuración sobre una ejecución fallida.

Para lo que la compañera dentro de la app no pueda responder, la **guía** (este sitio) es la referencia detallada, el **Discord de la comunidad** es donde preguntar a otros usuarios y al equipo, y el **soporte por correo** es para temas de cuenta o facturación.

| Recurso | Mejor para | Tiempo de respuesta |
|----------|----------|---------------|
| Cockpit / Athena (en la app) | Preguntas de configuración, depuración, "¿dónde está X?" | Instantáneo |
| Esta guía | Referencia de funciones y cómo-hacer | Instantáneo |
| Sitio de documentación | Arquitectura, esquema, integraciones avanzadas | Instantáneo |
| Comunidad de Discord | Consejos, recetas, "¿le pasa a alguien más…?" | Minutos |
| Correo de soporte | Cuenta, facturación, seguridad | Horas |
| Tutoriales en video | Recorridos visuales de los flujos clave | Instantáneo |

### Cómo funciona

El cockpit tiene acceso a una doctrina (un cuerpo curado de conocimiento sobre el producto) y a tu estado local (anonimizado). Puede buscar en tus ejecuciones, recomendar cambios e incluso componer tarjetas de UI integradas para guiarte por una solución paso a paso. Si no puede responder, te sugerirá el recurso externo adecuado.

:::tip
Para preguntas del tipo "creo que algo está roto", abre Athena primero y pregunta "diagnóstica la última ejecución fallida del agente X". El flujo de depuración del cockpit está hecho para esto y suele ser mejor que leer logs manualmente.
:::
  `,
};
