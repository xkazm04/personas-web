export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## El panel de monitorización

La página Overview es tu centro de mando para todo lo que ocurre con tus agentes. La pestaña Dashboard se abre por defecto y muestra una cuadrícula de KpiTiles, una por métrica (tasa de éxito, total de ejecuciones, coste total, duración media, agentes activos, fallos de hoy, etc.). Cada tile tiene tres modos de densidad (compact / standard / detail) que cambias haciendo clic en el tile; útil cuando quieres un número rápido frente a cuando quieres la gráfica de tendencia y el desglose.

Debajo de los KpiTiles, Overview muestra actividad en vivo, fallos recientes y notificaciones a las que te has suscrito. Todo en esta página es filtrable por agente, por grupo y por rango de tiempo: el mismo conjunto de filtros se aplica a cada panel para que puedas acotar todo el panel a "esta semana, solo mis agentes de Marketing" con un clic.

| Panel | Qué muestra |
|---------|--------------|
| **KpiTiles** | Tasa de éxito, ejecuciones, coste, duración, conteo de fallos, agentes activos: cada uno en tres niveles de densidad |
| **Feed de actividad** | Flujo en vivo de ejecuciones a través de todos los agentes, desplazable, buscable, clic para detalle |
| **Notificaciones** | Alertas suscritas (fallos, topes de presupuesto, manual review, anomalías) con clic directo a la ejecución problemática |
| **Instantánea de salud** | Resumen de salud por agente: escaneo rápido para cualquier cosa en amarillo o rojo |

### Cómo funciona

La página Overview lee del mismo almacén de ejecuciones y eventos que el resto de la app, así que lo que ves es siempre el estado en vivo. Los filtros y las preferencias de densidad persisten entre sesiones; los configuras una vez y el panel los recuerda. Haz clic en cualquier KpiTile para profundizar en un desglose por agente, haz clic en cualquier fila de actividad para abrir el modal de detalle de ejecución.

:::tip
La campana de notificaciones de la barra de título es un atajo de un clic desde cualquier parte de la app al detalle de ejecución más fresco. No necesitas navegar a Overview manualmente para las comprobaciones rutinarias de "¿qué acaba de pasar?".
:::
  `,

  "execution-logs": `
## Logs de ejecución

Cada ejecución de agente produce un log de ejecución: carga del disparador, prompt renderizado enviado al modelo, respuesta del modelo, cada llamada a herramienta (con argumentos y resultado), salida final, duración, coste y cualquier error. Los logs son inmutables: se escriben una vez y se conservan indefinidamente. La pestaña Activity (por agente en el editor, o global en Overview) es el punto de entrada.

Cada entrada de log es un resumen de una línea en la lista; al hacer clic se abre el modal de detalle completo con todos los campos anteriores. Desde ahí puedes copiar cualquier campo, reproducir la ejecución con la misma entrada o saltar a la vista de traza relacionada para depuración paso a paso.

### Puntos clave

- **Captura completa** — entrada, prompt, respuesta, llamadas a herramientas (con parámetros y resultados), salida, duración, coste, errores
- **Historial inmutable** — los logs nunca cambian tras completar la ejecución; si el prompt del agente se edita después, las ejecuciones antiguas siguen mostrando lo que se envió en su momento
- **Reproduce desde cualquier ejecución** — re-ejecuta el agente con la entrada original; útil para verificar un arreglo en una carga previamente fallida
- **Etiquetado por disparador** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, etc., para filtrar actividad por fuente
- **Marcador de manual-review** — las ejecuciones que el agente mismo marcó para revisión (vía la directiva \`manual_review\`) reciben una insignia para encontrarlas rápido

### Cómo funciona

El almacén de ejecuciones es SQLite local, escrito transaccionalmente conforme avanza la ejecución. La pestaña de traza dentro del modal de detalle expande cada paso en sus subeventos (flujo de tokens del modelo, llamada a herramienta despachada, resultado de herramienta recibido, rama de decisión tomada). Filtra por rango de fechas, agente, tipo de disparador, estado, business_outcome o texto completo sobre la entrada/salida.

:::tip
Cuando un agente produce salida inesperada, la pestaña de traza, no la salida, es donde vive la respuesta. Busca la llamada a herramienta que devolvió datos erróneos, o la decisión del modelo que tomó la rama equivocada. La salida es el síntoma; la traza es la causa.
:::
  `,

  "real-time-activity-feed": `
## Feed de actividad en tiempo real

El feed de actividad te muestra lo que está ocurriendo ahora mismo en todos tus agentes. A medida que cada agente procesa su tarea, las actualizaciones aparecen en tiempo real: es como ver un marcador en directo. Ves los resultados en el momento en que ocurren sin recargar ni revisar agentes individuales.

Esto es especialmente útil cuando tienes muchos agentes corriendo simultáneamente o cuando quieres observar una automatización crítica mientras se ejecuta.

### Puntos clave

- **Actualizaciones en vivo** — ve la actividad del agente conforme sucede, sin necesidad de recargar
- **Todos los agentes** — un feed cubre cada agente en ejecución en tu configuración
- **Entradas con marca de tiempo** — cada actualización muestra exactamente cuándo ocurrió
- **Cambios de estado** — ve cuándo los agentes empiezan, terminan, tienen éxito o fallan en tiempo real

### Cómo funciona

Abre el feed de actividad desde el panel de monitorización o la barra lateral. Las actualizaciones se transmiten automáticamente conforme tus agentes trabajan. Cada entrada muestra el nombre del agente, la acción, la marca de tiempo y el resultado. Haz clic en cualquier entrada (o en la campana de notificaciones en la barra de título) para abrir el modal de detalle de ejecución completo directamente en la pestaña Overview › Activity, donde puedes ver la traza, el prompt renderizado, la entrada, la salida y cualquier error. El feed en sí es desplazable y buscable.

:::tip
Mantén el feed de actividad abierto en un panel lateral mientras pruebas nuevos agentes. Ver la salida en vivo te ayuda a detectar problemas de inmediato e iterar más rápido. Para el uso diario, la campana de notificaciones en la barra de título es el camino más rápido: siempre abre el detalle de ejecución más fresco sin que tengas que navegar.
:::
  `,

  "cost-tracking-per-agent": `
## Seguimiento de costes por agente

Cada proveedor de IA cobra por token, y Personas etiqueta cada ejecución con el recuento exacto de tokens, el modelo y el proveedor, así que el coste por agente siempre se conoce. Overview → Usage muestra una lista ordenable de cada agente con su coste en la ventana de tiempo seleccionada (día, semana, mes o rango personalizado), más flechas de tendencia para que veas de un vistazo qué agentes tienen costes en alza.

Profundiza en cualquier fila para un desglose: distribución de coste-por-ejecución (mediana vs. p95), coste por modelo cuando el agente tiene configurado un proveedor alternativo, total de tokens (entrada vs. salida) y una gráfica de tendencia con el tiempo. Si el coste de un agente está subiendo, este es el primer lugar donde aparece.

### Puntos clave

- **Desglose por agente** — cada ejecución se atribuye a su agente
- **Ventanas de tiempo filtrables** — hoy, esta semana, este mes, todo el tiempo o rango personalizado
- **Distribución de coste-por-ejecución** — mediana, p95, máximo; revela si un valor atípico caro está dominando el total
- **Desglose de tokens** — tokens de entrada vs. salida para saber si el agente está leyendo mucho o produciendo mucho
- **Flechas de tendencia** — cambio semana a semana mostrado junto a cada agente, así las regresiones de coste aparecen de inmediato

### Cómo funciona

El medidor de coste avanza en vivo durante una ejecución conforme los tokens se transmiten. Cuando la ejecución termina, el coste final se finaliza y se persiste junto al log de ejecución. La vista Usage agrega desde este almacén, así que cambiar el filtro de rango de tiempo simplemente re-consulta los mismos datos: no hay un trabajo separado de "contabilidad de costes" corriendo.

:::tip
Si un único agente domina tus costes, la distribución por ejecución es más útil que el total. Una mediana alta significa que el prompt es consistentemente caro (mira el tamaño del prompt y el conteo de llamadas a herramientas). Un p95 alto con mediana normal significa atípicos raros (mira entradas inusuales en el historial de traza).
:::
  `,

  "cost-tracking-per-model": `
## Seguimiento de costes por modelo

Distintos modelos tienen puntos de precio muy diferentes: Claude Haiku es ~30× más barato que Opus por token, GPT-4o-mini es ~20× más barato que GPT-4o, y los modelos locales no cuestan esencialmente nada por token (solo cómputo). La vista por modelo en Overview → Usage desglosa el gasto por proveedor y modelo para que veas a dónde va el dinero y si el gasto coincide con el valor.

:::feature
**Pistas inteligentes de optimización** color=#34d399
El sistema etiqueta ejecuciones que parecen que podrían haberse ejecutado en un modelo más barato con calidad similar. Cuando se usa un modelo de alto coste para un patrón de tarea que el modelo más barato maneja bien en otros sitios, la pista aparece junto a la fila de coste, apuntándote a agentes candidatos para A-B en el Lab.
:::

### Puntos clave

- **Por proveedor y modelo** — coste separado por identificador exacto de modelo (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Llamadas, tokens, coste** — tres vistas de los mismos datos; el coste es lo que pagas, los tokens son lo que gastas, las llamadas son con qué frecuencia llamas
- **Comparación de coste-por-llamada** — misma métrica entre modelos para comparar igual con igual
- **Pistas de optimización** — muestran agentes candidatos que podrían bajar de gama; haz clic para entrar al Lab y hacer prueba A-B
- **Atribución por agente** — profundiza en una fila de modelo para ver qué agentes lo usan más

### Cómo funciona

La vista Usage agrupa los mismos registros de ejecución que la vista por agente pero en la dimensión de modelo en su lugar. El precio se configura por modelo en Settings → Engine, con valores predeterminados que coinciden con el precio público de cada proveedor; puedes sobreescribir si tienes una tarifa negociada o estás usando BYOI en un endpoint más barato.

:::tip
Una vez al mes, revisa la vista por modelo ordenada por coste total. La entrada superior es tu mayor oportunidad de ahorro: pásala a la arena del Lab contra el siguiente modelo más barato y comprueba si la calidad se mantiene. La mayoría de los agentes toleran bien una bajada de modelo; los que no, son los que realmente vale la pena el gasto.
:::
  `,

  "success-rate-metrics": `
## Métricas de tasa de éxito

Cada ejecución termina con un estado: éxito, fallo o manual-review. La tasa de éxito es el porcentaje de ejecuciones que se completaron con éxito contra un trasfondo de comportamiento esperado. Tanto la pestaña Overview → Health como la pestaña Activity por agente muestran la tasa de éxito con un indicador de tendencia (cambio semana a semana) para que veas de un vistazo si la fiabilidad se mantiene.

La métrica va más allá del puro éxito/fallo ahora. Con el seguimiento de **business_outcome**, el propio agente puede declarar si una ejecución exitosa produjo el resultado que realmente querías (una venta, un documento aprobado, un resumen útil): una señal separada de "¿la ejecución terminó sin errores?". La tasa de éxito se divide en "completada limpiamente" y "produjo el resultado de negocio deseado"; la segunda es el número más útil para la mayoría de los agentes.

### Puntos clave

- **Tasa de éxito por agente** con flecha de tendencia
- **Tasa de resultado de negocio** — separada de la tasa de completado limpio; rastrea si el trabajo del agente fue realmente útil
- **División por disparador** — el mismo agente puede tener 99 % de éxito en ejecuciones manuales pero 70 % en programadas; el desglose te muestra qué fuente de disparador tiene problemas
- **Alertas por umbral** — fija un umbral por agente; se te notifica cuando la tasa cae por debajo
- **Clasificación de razón de fallo** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, etc., para que veas *por qué* las ejecuciones están fallando

### Cómo funciona

La pestaña Health agrega los estados de ejecución sobre una ventana móvil por agente. El seguimiento de business_outcome requiere que el agente emita una directiva \`business_outcome\` en su salida (la mayoría de las plantillas que lo necesitan lo hacen por defecto; los agentes personalizados pueden añadirla explícitamente). Las alertas por umbral se configuran por agente y se disparan por los mismos canales de notificación con los que el agente está configurado.

:::tip
Fija un umbral del 90 % en cada agente de producción. La alerta no te dirá por qué un agente está fallando, pero te dirá que algo lo está. La clasificación de razón de fallo en la pestaña Health es a donde vas después para diagnosticar.
:::
  `,

  "execution-tracing": `
## Trazado de ejecuciones

El trazado es el registro paso a paso por ejecución de lo que hizo el agente. Abre cualquier ejecución del feed de actividad y haz clic en la pestaña Trace: verás cada evento en orden cronológico: inicio y fin del streaming de tokens del modelo, cada invocación de herramienta con argumentos, cada resultado de herramienta, cada rama de decisión en un agente encadenado, el prompt renderizado, la salida. Cada paso es expandible para el detalle completo.

Para pipelines encadenados, la traza abarca varios agentes: el lienzo de linaje (Events → Lineage) muestra la vista entre agentes mientras la traza por ejecución muestra el detalle dentro del agente. Juntos te permiten depurar tanto "¿dónde se rompió este pipeline?" como "¿qué decidió el agente paso a paso?".

### Puntos clave

- **Cronológica** — cada evento con marca de tiempo y duración
- **Expandible por paso** — haz clic en cualquier paso para la entrada/salida completa de ese paso
- **Duración por paso** — ve qué paso es lento; normalmente una llamada a herramienta o una respuesta larga del modelo
- **Trazas encadenadas** — cuando un agente se dispara por una cadena, la traza enlaza de vuelta al agente anterior para que puedas navegar el pipeline
- **Token a token** para el modelo — útil para proveedores de transmisión lenta donde el usuario espera

### Cómo funciona

Cada ejecución escribe eventos al almacén de traza conforme corre; la pestaña de traza consulta ese almacén y renderiza la línea de tiempo. Los eventos a nivel de token se muestrean a una tasa que mantiene la traza usable incluso para respuestas largas (una respuesta de 10k tokens podría capturar 500 eventos muestreados en lugar de 10k). Para bucles de uso de herramientas, cada iteración de la ida y vuelta modelo/herramienta queda capturada.

:::tip
Usa la traza para confirmar qué *recibió realmente* el modelo. La mayor fuente de bugs de "el agente hizo algo raro" es que el modelo recibió una entrada diferente a la que esperabas, normalmente por un resultado de herramienta que no se veía como el prompt del agente asumía.
:::
  `,

  "performance-trends": `
## Tendencias de rendimiento

Las tendencias son la vista a largo plazo del comportamiento del agente: tasa de éxito, coste, duración, calidad de salida (donde se mida) graficados con el tiempo para que veas el impacto de los cambios que haces. Overview → Trends te da la vista de gráficos; eliges el o los agentes y la o las métricas y el rango de fechas, y los gráficos se renderizan.

El patrón más útil es "antes vs. después": cambiaste el prompt de un agente el 5 de marzo, ¿las cosas mejoraron o empeoraron? La vista Trends responde eso en segundos: las líneas que te importan suben o bajan en la fecha en que hiciste el cambio.

### Puntos clave

- **Múltiples métricas en un gráfico** — superpón tasa de éxito, coste, duración, tasa de business-outcome
- **Superposición multi-agente** — compara la misma métrica entre varios agentes en un gráfico
- **Rangos de fecha personalizados** — haz zoom desde "esta hora" hasta "todo el tiempo"
- **Anotaciones** — los eventos significativos (guardados de versión de prompt, cambios de ajustes, rotaciones de credenciales) se fijan en la línea de tiempo para que puedas correlacionar
- **Exportación** — los datos del gráfico se exportan a CSV si quieres hacer tu propio análisis

### Cómo funciona

Las tendencias agregan desde el mismo almacén de ejecuciones y traza que el resto de las vistas de monitorización: mismos datos, visualización distinta. Las anotaciones se generan automáticamente desde el historial de versiones y el historial de configuración para que no tengas que marcar manualmente "hice un cambio aquí"; el sistema ya lo sabe.

:::tip
Tras cualquier cambio significativo en un agente (revisión de prompt, cambio de modelo, nueva herramienta), revisa las tendencias una semana después. La mayoría de los cambios de prompt que "se sintieron mejor en pruebas" producen métricas mediblemente distintas; el gráfico lo confirma (o invalida tu intuición).
:::
  `,

  "setting-budget-limits": `
## Establecer límites de presupuesto

Los límites de presupuesto topan el gasto de IA a nivel de agente y a nivel global. Fija un presupuesto por ejecución (esta ejecución única no puede costar más de $X), un presupuesto por día (este agente no puede gastar más de $Y por día en todas las ejecuciones) o un tope global a través de todos los agentes. Cuando se alcanza un límite, el agente afectado se pausa limpiamente: la ejecución parcial se captura en la traza, no persiste cargo más allá del tope y se dispara una notificación.

Esta es una de las funciones más infravaloradas para agentes sin supervisión. Un agente programado o disparado por webhook sin un tope de presupuesto podría acumular costes inesperados de un día para otro si un prompt o entrada hace algo patológico. Los topes de presupuesto significan que el peor caso queda acotado por lo que decidiste por adelantado, no por lo que una ejecución errante del modelo pueda hacer.

### Puntos clave

- **Tope por ejecución** — límite estricto en una única ejecución
- **Tope por día / por semana / por mes** — límite de gasto por ventana por agente
- **Tope global** — límite a través de todos los agentes; útil como red de seguridad incluso cuando cada agente tiene el suyo
- **Parada elegante** — los agentes se detienen limpiamente en el tope; la traza parcial se conserva
- **Notificaciones** — cada golpe de tope te notifica para que decidas si subir el tope o arreglar el prompt subyacente
- **Avisos suaves** — umbrales pre-tope opcionales (p. ej. "avisar al 80 %") para saber que un agente se acerca a un tope

### Cómo funciona

Los topes se configuran en la pestaña Settings del agente (por ejecución, por ventana) o en Settings → Engine → Budget (global). El motor de ejecución rastrea el coste en vivo durante la ejecución; cuando el coste cruza el tope, el motor aborta la ejecución por el mismo camino que un timeout. El estado abortado se conserva en la traza con razón \`budget_exceeded\`.

:::warning
Fija siempre al menos un tope por día para cualquier agente disparado automáticamente (calendario, webhook, observador de archivos, cadena). Sin él, una entrada patológica o un bucle del modelo podría gastar una cantidad ilimitada antes de que te enteres. El tope es tu red de seguridad.
:::

:::tip
Empieza con topes alrededor de 3x lo que esperas que cueste un día típico. Lo bastante estrechos para atrapar fugas, lo bastante holgados para que la variación normal no dispare el tope. Ajusta tras una semana de datos reales.
:::
  `,

  "the-director": `
## El Director — Entrenamiento automático de agentes

El **Director** es un meta-agente integrado que vigila a tus otros agentes y los guía para que sean genuinamente útiles. En lugar de que tú leas cada ejecución, el Director las revisa por ti y deja un veredicto.

Decides qué observa mediante el **destacado** de agentes (la ⭐ en cada fila de Todos los agentes). Un agente destacado está "en el ámbito del Director" — el Director lo revisa; los agentes no destacados se dejan como están. El Director en sí es un agente del sistema y no puede eliminarse.

### El centro de mando

El Director vive en **Vista general › Director** — una pantalla enfocada:

- Un **panel de control de cartera**: cuánto del trabajo de tu flota entregó valor real, la puntuación media de los veredictos, tu coste por ejecución de valor entregado y una distribución de 0 a 5 que muestra cómo están tus agentes destacados.
- Una **tabla de entrenamiento** con cada agente en el ámbito — puntuación, una minigráfica de tendencia (¿está avanzando el entrenamiento?), tasa de valor, última revisión y **etiquetas de atención** que señalan exactamente en qué actuar (pendiente de primera revisión, puntuación baja, en declive, sin revisiones recientes). Filtra para ver solo los agentes que necesitan atención. Haz clic en cualquier agente para abrir su **detalle** — historial completo de veredictos con el razonamiento y las sugerencias concretas detrás de cada puntuación.
- Una cabecera con **Revisar todos los del ámbito**, un selector **Añadir al ámbito** y el interruptor de **memoria** a largo plazo.

La página Todos los agentes mantiene una franja de Director discreta que enlaza directamente aquí.

### Cómo es un veredicto

Cada revisión produce una **puntuación global de 0 a 5** más notas de entrenamiento opcionales:

- La columna **Veredicto** en la lista de Actividad muestra la puntuación como estrellas, justo junto al agente — un vistazo te dice qué ejecuciones justificaron su coste.
- La pestaña **Director** en cualquier ejecución abre la evaluación completa en markdown legible: la puntuación, un resumen en una línea y sugerencias concretas (un ajuste de prompt, una salvaguarda, un cambio de nivel de modelo, una herramienta que falta).
- Las notas accionables también llegan a tu cola de revisión, donde aprobarlas o rechazarlas le enseña al Director tu criterio con el tiempo.

Un agente saludable obtiene puntuaciones altas con poco o ningún entrenamiento — el Director guarda silencio cuando no hay nada que mejorar.

### Memoria a largo plazo (opcional)

Si usas el **Obsidian Brain**, puedes activar la memoria a largo plazo del Director. Entonces leerá sus propias notas anteriores sobre un agente antes de cada revisión (para que los consejos se acumulen en lugar de repetirse) y escribirá cada nuevo veredicto en una carpeta \`Director/\` de tu bóveda — un historial de entrenamiento duradero y legible por personas.

### Por qué importa

Los recuentos brutos (ejecuciones, coste, tasa de éxito) te dicen *qué* ocurrió, no *si valió la pena*. El Director añade la capa de juicio que faltaba — una lectura honesta y basada en evidencia del valor y la eficiencia de cada agente — para que una flota de agentes se mantenga útil sin que tengas que auditar cada ejecución a mano.
  `,

  "anomaly-detection": `
## Detección de anomalías

La detección de anomalías compara cada nueva ejecución con la línea base reciente del agente y marca las ejecuciones que se ven inusuales. La línea base se construye por agente: duración típica, coste típico, longitud de salida típica, conteo típico de llamadas a herramientas. Una nueva ejecución que se desvía significativamente en cualquiera de estas recibe una marca con una razón: "duración 5× lo normal", "pico de coste", "conteo de llamadas a herramientas anómalo", "salida inusualmente corta".

Esto detecta una clase de problemas que las métricas puras de éxito/fallo se pierden: la ejecución se completó, pero algo estaba mal. El agente tardó cinco minutos cuando normalmente tarda treinta segundos. La salida son tres frases cuando normalmente son tres párrafos. El coste se duplicó sin cambio en la entrada. Estas son señales que vale la pena ver antes de que se conviertan en tendencias.

### Puntos clave

- **Línea base multi-señal** — duración, coste, tamaño de salida, conteo de llamadas a herramientas, tasa de fallo
- **Líneas base por agente** — cada agente tiene su propia normalidad; lo que es anómalo para uno es normal para otro
- **Alertas etiquetadas por razón** — la alerta nombra qué señal se desvió y por cuánto
- **Bajo ruido** — calibrado para mostrar atípicos genuinos, no variación normal
- **Se integra con notificaciones** — las anomalías se disparan por los canales de notificación con los que el agente esté configurado

### Cómo funciona

La línea base es una ventana móvil de ejecuciones recientes (configurable; predeterminado 50). Cada nueva ejecución se puntúa en cada señal; si alguna señal cruza el umbral configurado (predeterminado 3 desviaciones estándar de la media móvil), la ejecución se marca y se emite un evento de anomalía. Los eventos de anomalía aparecen en Overview → Notifications y en la pestaña Health de ese agente.

:::tip
Las anomalías que investigues y resuelvas deberían marcarse como "investigated". La línea base excluye las anomalías investigadas de su ventana móvil, así el sistema no deriva hacia considerar la ejecución anómala como "normal".
:::
  `,
};
