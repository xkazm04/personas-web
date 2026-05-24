export const content: Record<string, string> = {
  "why-test-your-agents": `
## ¿Por qué probar tus agentes?

Probar es la forma de mantener tus agentes confiables a medida que iteras. Cada edición del prompt, cada cambio de modelo, cada nueva herramienta que añadas cambia el comportamiento del agente de formas que no puedes predecir completamente leyendo el diff. Probar convierte esa incertidumbre en evidencia: ejecuta la nueva versión contra entradas representativas, compárala con la anterior, comprueba si mejoraste lo que querías mejorar y no regresaste lo que no querías regresar.

La pestaña Lab en el editor de cada agente es donde esto ocurre. Tiene cuatro modos: Arena, A-B, Matrix, Eval, cada uno responde una pregunta diferente. Arena compara modelos sobre el mismo prompt. A-B compara dos prompts en el mismo modelo. Matrix prueba combinaciones de componentes de prompt. Eval es la cuadrícula completa: cada prompt × cada modelo.

### Puntos clave

- **Detecta regresiones pronto** — probar tras cada cambio es cómo evitas "el agente solía funcionar, ¿qué rompí?"
- **Compara alternativas sistemáticamente** — Arena y A-B te dejan elegir entre opciones con evidencia en lugar de intuición
- **Genera datos de fitness** — las ejecuciones del Lab acumulan puntuaciones por prompt que alimentan la evolución del genoma (nivel Builder)
- **Conjuntos de entrada reutilizables** — las entradas de prueba se guardan por agente; mismos prompts, mismos datos, comparaciones repetibles

### Cómo funciona

Cada modo del Lab despacha la misma carga de disparador a varias variantes del agente (distintos prompts, distintos modelos o ambos) en paralelo. Las salidas se presentan lado a lado con metadatos cuantitativos (duración, coste, recuento de tokens) y tus botones subjetivos de calificación. Los resultados aterrizan en el historial de pruebas del agente y se incorporan a la puntuación de fitness.

:::tip
El momento más barato para detectar una regresión de prompt es justo después de haberlo escrito. Convierte en hábito hacer Lab → A-B contra la versión anterior del prompt en cada edición; la fricción es mucho menor que descubrir una regresión en ejecuciones de producción tres días después.
:::
  `,

  "the-testing-lab-overview": `
## Panorama del Testing Lab

La pestaña Lab del editor de cada agente es un espacio de trabajo con cuatro modos. Elige el modo según lo que estés intentando aprender:

### Los cuatro modos

:::compare
**Arena**
Mismo prompt, varios modelos. Envía una entrada a través de Claude / GPT / Gemini / local en paralelo. Ideal para "¿qué modelo es el adecuado para este agente?"
---
**A-B**
Dos prompts, mismo modelo. Compara un cambio de prompt contra su predecesor en condiciones idénticas. Ideal para "¿esta edición mejoró las cosas?"
---
**Matrix**
Combinatorio. Define componentes del prompt y la matriz prueba cada combinación (3 × 4 = 12 variantes). Ideal para "tengo varias ideas en competencia, ¿qué combo gana?"
---
**Eval**
Cuadrícula completa: N prompts × M modelos. La imagen completa cuando quieres optimizar prompt *y* modelo juntos. Ideal cuando hay un cambio mayor sobre la mesa.
:::

### Cómo funciona

Cada modo comparte el mismo selector de entrada (entrada manual, pegado de JSON estructurado o reproducción de una ejecución real pasada del historial de este agente) y la misma UI de calificación. Las columnas de salida se expanden para la traza completa (llamada al modelo, llamadas a herramientas, ramas de decisión) igual que una ejecución normal. Los resultados se guardan en el historial de pruebas con el modo de prueba etiquetado, así puedes explorar pruebas pasadas por modo.

Para agentes encadenados, el Lab prueba solo este agente: el agente anterior se simula con la entrada que especificaste, así que puedes iterar sobre una etapa de un pipeline sin volver a ejecutar toda la cadena.

:::tip
La mayoría de las semanas, Arena y A-B son suficientes. Matrix es para "tengo tres refactores plausibles y quiero comparar"; Eval es para "estoy contemplando una reescritura mayor o un cambio de nivel". No recurras al modo pesado por defecto: los más baratos suelen bastar.
:::
  `,

  "arena-testing": `
## Pruebas Arena

Arena envía el mismo prompt y la misma entrada a varios modelos en paralelo, y luego dispone los resultados lado a lado. Los costes y duraciones se muestran junto a las salidas, así que estás comparando en tres ejes: calidad (tu juicio), velocidad (medida por el motor) y coste (token a token).

El uso más común es la decisión de selección de modelo: "este agente ha estado corriendo en Sonnet 4.6, ¿aguantaría Haiku 4.5 por 1/30 del coste?". Arena responde eso en una prueba en vez de semanas de observación en producción.

### Puntos clave

- **Despacho paralelo** — todos los modelos corren a la vez; tiempo total de reloj = el más lento, no la suma
- **Salidas lado a lado** — la salida completa de cada modelo es visible sin cambiar de pestaña
- **Coste + duración mostrados** — bajo cada salida, en la misma vista que el texto
- **UI de calificación por columna** — pulgar arriba / pulgar abajo / estrella por modelo; las calificaciones persisten en los datos de fitness del agente
- **Reproducción desde historial** — las pruebas Arena pueden sacar entrada de cualquier ejecución pasada de este agente, así pruebas con forma real

### Cómo funciona

Arena despacha una ejecución por cada modelo seleccionado usando el prompt actual y la configuración de herramientas del agente. Cada ejecución es independiente (traza separada, contabilidad de coste separada) y etiquetada \`arena\` para que no cuente contra las métricas de producción normales del agente. Los resultados aparecen como columnas; calificas cada columna; las calificaciones alimentan los datos de fitness por modelo para este agente.

:::tip
Elige como máximo 3 modelos por ejecución Arena. Más que eso y la lectura lado a lado se vuelve incómoda. Si estás considerando 5+ modelos, ejecuta varias Arenas por pares y lleva una nota mental de qué modelos ganaron cada ronda.
:::
  `,

  "ab-testing-prompts": `
## Pruebas A-B de prompts

A-B ejecuta la misma entrada a través de dos variantes de prompt en el mismo modelo, así que la única variable es el prompt. Es la herramienta correcta para evaluar una edición de prompt: carga la versión anterior como A, la nueva como B, ejecuta sobre entradas representativas y mira cuál produce el resultado que quieres.

El selector de versión del Lab se integra con el historial de versiones del prompt: no necesitas copiar y pegar la versión antigua, solo elígela del desplegable. Esto convierte "compara mi borrador actual con la versión funcional de la semana pasada" en una configuración de un clic.

### Puntos clave

- **Dos prompts, un modelo, una entrada** — comparación de una sola variable
- **Elige del historial de versiones** — A o B puede ser cualquier versión pasada del prompt de este agente
- **Misma fidelidad de traza** — ambas variantes obtienen trazas completas de ejecución, así puedes comparar patrones de llamada a herramientas, no solo la salida final
- **Múltiples rondas de entrada** — ejecuta el A-B contra varias entradas distintas en secuencia para probar generalización, no solo un caso afortunado
- **La puntuación persiste en fitness** — las calificaciones A-B alimentan los mismos datos de fitness que Arena y el genoma usan

### Cómo funciona

El motor A-B despacha ambos prompts como ejecuciones independientes y los etiqueta A y B en el panel de resultados. Más allá de eso, son ejecuciones regulares: misma traza, misma contabilidad de coste, pero etiquetadas \`ab_test\` para que sean filtrables en el historial de pruebas y no contaminen las métricas de producción.

:::code-compare
### Versión A
Resume el documento.
Sé breve.
---
### Versión B
Resume el documento en exactamente
3 viñetas. Cada viñeta debe
ser una frase. Empieza por el
hallazgo más importante.
:::

:::warning
Cambia una sola cosa por ronda A-B. Si B difiere de A en formato *y* tono *y* longitud, no puedes saber qué dimensión causó el cambio de puntuación. Haz un cambio, ejecuta A-B, acepta o rechaza, luego haz el siguiente cambio.
:::
  `,

  "matrix-testing": `
## Pruebas Matrix

Matrix es A-B-C-D-… combinatorio todo a la vez. Defines tu prompt como componentes (introducción × instrucciones × formato de salida, por ejemplo) y la matriz genera cada combinación, las despacha todas y clasifica los resultados por puntuación de fitness.

Con 3 componentes de 3 opciones cada uno son 27 combinaciones: mucho más de lo que probarías manualmente pero fácil de que el motor las paralelice. La matriz es más útil cuando tienes varias ideas en competencia sobre cómo estructurar un prompt y quieres encontrar la combinación que realmente rinde mejor en vez de la que adivinaste.

### Puntos clave

- **Define componentes, obtén combinaciones** — la matriz expande los componentes en todas las combinaciones válidas
- **Despacho paralelo** — cada combinación corre simultáneamente (sujeto a los límites de tasa del proveedor)
- **Resultados clasificados** — cuadrícula puntuada por fitness, ordenada de mejor a peor
- **Atribución a nivel de componente** — ve qué componentes se correlacionan con puntuaciones altas; útil incluso cuando no adoptas al ganador absoluto tal cual
- **Guarda la combinación ganadora** — un clic para fijar la combinación ganadora como el prompt activo del agente

### Cómo funciona

Defines cada componente como un conjunto etiquetado de variantes en la pestaña de matriz. El motor construye cada combinación como un prompt renderizable y despacha cada uno como una ejecución independiente. Los resultados se agregan en una cuadrícula clasificada por tu señal de fitness elegida (calificación, coste-por-calidad, velocidad, personalizada). La atribución por componente se calcula promediando fitness entre combinaciones que comparten ese componente, así que incluso si ningún ganador único destaca, aprendes qué estilo de introducción / instrucción / formato de salida rinde mejor en promedio.

:::info
Con 3 componentes × 3 opciones = 27 variantes. Con 4 × 4 = 256. La matriz puede manejar cuadrículas grandes pero quemarás tokens proporcionalmente. Empieza con 3 × 3 y expande solo si el resultado es genuinamente ambiguo.
:::

:::tip
Matrix es más útil justo después de un rediseño mayor del prompt. Cuando no estás seguro de si la nueva estructura es mejor que la antigua, prueba con matriz 3-4 estructuras candidatas contra unas pocas entradas representativas: el ganador suele ser más claro de lo que esperarías.
:::
  `,

  "eval-testing": `
## Pruebas Eval

Eval es la cuadrícula completa: cada variante de prompt × cada modelo. Eliges los prompts (típicamente 2-3 candidatos), eliges los modelos (típicamente 2-4) y la cuadrícula eval ejecuta todas las combinaciones y presenta un mapa de calor de puntuaciones. El mejor par prompt-modelo queda resaltado.

Este es el modo pesado: el más caro en tokens, el más exhaustivo en cobertura. Úsalo cuando estés tomando una decisión mayor que afecta ambos ejes: "estamos considerando reescribir el prompt y pasar a un modelo más barato, ¿podemos hacer ambas a la vez y aun así alcanzar nuestro listón de calidad?"

### Puntos clave

- **N prompts × M modelos** — mapa de calor de puntuaciones en ambas dimensiones
- **Mejor combinación resaltada** — clasificada por fitness, con la celda óptima visualmente destacada
- **Desgloses por eje** — ve si el cambio de prompt o el cambio de modelo impulsó el cambio de puntuación
- **Etiquetada en historial de pruebas** — las ejecuciones eval aterrizan en el historial bajo la etiqueta \`eval\` para revisión posterior
- **Adopción con un clic** — aplica la mejor combinación (versión de prompt + selección de modelo) al agente en vivo

### Cómo funciona

Eval despacha \`prompts × modelos\` ejecuciones en paralelo (sujeto a los límites de tasa del proveedor). Cada celda es una ejecución independiente con su propia traza. La vista de cuadrícula se agrega por par prompt-modelo; calificas las celdas usando la misma UI que Arena y A-B; las puntuaciones de fitness ruedan hacia arriba en la clasificación por celda. La celda superior es la combinación recomendada: adóptala directamente desde la vista de cuadrícula.

:::warning
Eval es el modo más caro. 3 prompts × 4 modelos × 5 entradas = 60 ejecuciones, cada una con su propia llamada al modelo. Ejecútalo con moderación, sobre conjuntos de entrada representativos y solo cuando la decisión realmente cruce ambos ejes. Para decisiones solo de prompt, A-B; para decisiones solo de modelo, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Calificar y puntuar resultados

Tras cualquier prueba del Lab, cada fila de salida tiene controles de calificación: pulgar arriba / pulgar abajo para juicio binario, o una escala de 1-5 estrellas para casos matizados. Tus calificaciones alimentan dos cosas: la puntuación de fitness por variante del agente (usada para clasificar en matrix y eval, y como presión de selección de la evolución del genoma en el nivel Builder), y una señal de preferencia personal a través de todas tus pruebas con el tiempo.

Las calificaciones son personales: codifican tu juicio de calidad, no una métrica objetiva. Eso es intencional; tú eres quien sabe si la salida del agente coincide con lo que necesitas, y esa es la señal contra la que el sistema optimiza.

### Puntos clave

- **Binaria o 1-5 estrellas** — elige la escala con la que te sientas cómodo siendo consistente
- **Calificación por salida** — cada salida de prueba tiene su propia fila de controles de calificación; nada se agrega automáticamente hasta que califiques
- **Impulsa las puntuaciones de fitness** — las calificaciones alimentan la señal de fitness por variante que Matrix / Eval / genoma usan
- **El historial de retroalimentación persiste** — cada calificación que has dado se guarda; útil para "¿califiqué X más alto que Y en pruebas pasadas?"
- **La consistencia importa más que la precisión** — un 4 estrellas que darías consistentemente es más útil que un 5 estrellas que das una vez y nunca más

### Cómo funciona

Las calificaciones se guardan contra la ejecución específica (traza, versión de prompt, modelo, entrada). El agregador de fitness lee calificaciones + métricas objetivas (coste, duración, éxito) y calcula una puntuación de fitness por variante que se usa en la clasificación. La evolución del genoma (nivel Builder) usa las calificaciones como la presión de selección principal para elegir prompts padres a cruzar.

:::tip
Califica según lo que realmente quieres, no lo que es técnicamente impresionante. Una respuesta corta y correcta suele ganar a una larga y elaborada. El sistema optimiza contra tus preferencias, así que calificaciones honestas y consistentes producen agentes afinados a *tu* juicio.
:::
  `,

  "genome-evolution-basics": `
## Fundamentos de la evolución del genoma

La evolución del genoma (nivel Builder) cría automáticamente nuevas variantes de prompt a partir de tus pruebas pasadas mejor calificadas. Cada "generación" muta y recombina los prompts con mejor desempeño de la generación anterior; a lo largo de varias generaciones, los prompts convergen en configuraciones que puntúan consistentemente mejor que tu punto de partida. Es búsqueda evolutiva con tus calificaciones como función de fitness.

El proceso es sin supervisión una vez iniciado. Tú proporcionas el prompt inicial y la señal de fitness (típicamente tu historial de calificaciones más métricas objetivas opcionales como coste o duración), fijas el tamaño de la población y el conteo de generaciones, y lo dejas correr. Los disparadores normales del agente quedan en pausa durante la evolución para mantener limpia la comparación.

:::info
La evolución del genoma es sin supervisión una vez puesta en marcha. Fijas los parámetros, el motor crea variaciones, las prueba contra tu conjunto de entrada, las puntúa por tus calificaciones y recombina a los ganadores en la siguiente generación. Revisas la población final y adoptas al ganador manualmente: el sistema nunca cambia silenciosamente tu prompt en vivo.
:::

### Puntos clave

- **Variación + selección automáticas** — el motor genera mutaciones de los padres con mejor desempeño y selecciona vía fitness
- **Generaciones + poblaciones** — config típica es 5-10 generaciones de 8-12 variantes cada una
- **Función de fitness = tus calificaciones** — señal principal; señales secundarias (coste, duración) son pesos configurables
- **Todas las generaciones versionadas** — cada prompt generado se conserva en el historial de versiones del agente; nada se pierde
- **Adopción manual** — el motor nunca cambia silenciosamente tu prompt en vivo; tú revisas y adoptas al ganador

### Cómo funciona

Cada generación comienza con una población padre. El motor genera variantes hijas vía pequeñas mutaciones estructuradas (reescritura, reordenamiento de secciones, ajuste de ejemplos, etc.) y crossover (combinando segmentos de dos padres). Cada hijo corre contra tu conjunto de entrada; las calificaciones producen la puntuación de fitness; los hijos con mejor puntuación se convierten en la población padre para la siguiente generación. Tras el número configurado de generaciones, ves la población final clasificada y puedes adoptar cualquier variante.

### Velo en acción

:::usecases
**Ajuste de triaje de correos**
El prompt actual clasifica mal el 15 % de los correos
---
Ejecuta 5 generaciones de población 10. Terminas con una variante que clasifica mal el 3 %: adóptala con un clic.
===
**Consistencia de formato**
El formato de salida del agente es inconsistente entre formas de entrada
---
El genoma evoluciona en un conjunto de entradas diversas con la conformidad de formato como señal de fitness; la salida se estabiliza.
===
**Reducción de coste sin pérdida de calidad**
Quieres encontrar un prompt más liviano que aún produzca buena salida
---
Añade coste-por-token a la función de fitness con peso negativo; la evolución encuentra prompts más cortos que mantienen la calificación.
:::

:::info
Cada variante creada durante la evolución se versiona en el historial de prompts del agente. Si la variante N+1 adoptada resulta comportarse mal en producción, restaurar la variante N es un clic: no se pierde trabajo.
:::

:::tip
La paciencia paga. La generación 1 normalmente no es dramáticamente mejor que tu prompt inicial: las mutaciones son pequeñas y muchas son inútiles. Hacia la generación 3-4 la población sobreviviente se concentra en las mejoras reales; ahí es típicamente cuando verás un ganador claro.
:::
  `,

  "running-a-breeding-cycle": `
## Ejecutar un ciclo de cría

Un "ciclo de cría" es una ejecución de evolución completa: elige el agente, fija los parámetros, arranca, espera, revisa la población, adopta. Cada ciclo es N generaciones de M variantes probadas contra tu conjunto de entrada elegido. El coste total es aproximadamente \`generaciones × población × cantidad-de-entradas × coste-por-ejecución\`: predecible a partir de los parámetros.

La pestaña Genome en el Lab es el punto de entrada. Se abre con parámetros predeterminados afinados para un punto de partida representativo (5 generaciones × 10 variantes × 5 entradas), lo que es suficiente para ver un cambio significativo sin quemar tokens en exceso. Ajusta los parámetros antes de arrancar si quieres un ciclo más pesado o más ligero.

:::steps
1. **Abre Lab → Genome** sobre el agente que quieras evolucionar
2. **Elige el conjunto de entrada** — entrada manual, un conjunto guardado o reproducción desde historial
3. **Configura los pesos de fitness** — peso de calificación (principal), peso de coste (negativo si quieres más corto), peso de duración (negativo si quieres más rápido)
4. **Fija generaciones y población** — 5 × 10 es el predeterminado; sube ambas para problemas más difíciles, baja ambas para experimentos rápidos
5. **Haz clic en Start Cycle** — el motor corre sin supervisión; puedes dejar la app abierta o volver más tarde
6. **Revisa la población final** — clasificada por fitness, con la traza de cada variante disponible
7. **Adopta al ganador** — o cualquier otra variante que prefieras; el prompt activo del agente se actualiza y la población completa del ciclo se conserva en el historial de versiones
:::

### Cómo funciona

Cada generación corre en paralelo: el motor despacha las M variantes simultáneamente (sujeto a los límites de tasa del proveedor) a través del conjunto de entrada, recoge resultados, los puntúa vía función de fitness, selecciona a los mejores como padres, genera hijos para la siguiente generación y continúa. La UI de progreso muestra el mejor y el promedio de fitness por generación en vivo para que veas si la población está mejorando.

:::tip
Empieza con un conjunto de entrada pequeño (3-5 casos representativos) y el ciclo predeterminado 5 × 10. Si el resultado mejora claramente, has terminado. Si es ambiguo, expande el conjunto de entrada y ejecuta otro ciclo arrancando desde el ganador anterior. Iterar ciclos a menudo le gana a un único ciclo gigante.
:::
  `,

  "adopting-evolved-prompts": `
## Adoptar prompts evolucionados

Cuando un ciclo de cría termina, ves la población final clasificada por fitness con la variante superior resaltada. Adoptar es un clic: la variante se convierte en el prompt activo del agente, el prompt activo anterior se conserva en el historial de versiones (así que el rollback también es de un clic) y la población completa del ciclo también se conserva por si quieres adoptar otra variante después.

La acción de adoptar ejecuta la misma comprobación previa que cualquier otro cambio de prompt: el estado de configuración verifica que las credenciales y herramientas del agente siguen siendo válidas, la versión queda registrada en el historial y, si el agente tiene disparadores programados, la próxima ejecución programada usa automáticamente la variante adoptada.

### Puntos clave

- **Adopción con un clic** desde la vista de población clasificada
- **Versión anterior preservada** en el historial; restaurar también es un clic
- **Población completa preservada** — cualquier variante del ciclo sigue siendo adoptable después
- **Comprobación previa ejecutada** — verificación del estado de configuración, validación de credenciales, compatibilidad de disparadores
- **Los disparadores en vivo usan automáticamente la nueva variante** — sin paso aparte de "deploy"

### Cómo adoptar

:::steps
1. **Espera a que termine el ciclo de cría** — normalmente 10-30 minutos según los parámetros
2. **Abre la vista de población final** — variantes clasificadas por fitness con trazas accesibles por variante
3. **Lee el prompt de la variante superior** — comprobación rápida de cordura por si hay frases inesperadas o mutaciones extrañas
4. **Opcionalmente inspecciona las variantes en 2º / 3er lugar** — a veces un fitness ligeramente menor viene con un prompt mucho más corto / limpio
5. **Haz clic en Adopt** sobre tu elección; se ejecuta la comprobación previa; el prompt activo del agente se actualiza atómicamente
6. **Verifica la siguiente ejecución en vivo** — normalmente una Manual Run con una entrada representativa es la confirmación más barata de que la variante adoptada se comporta como prometieron las puntuaciones de prueba
:::

:::tip
Lee la variante adoptada antes de hacer clic en Adopt. La evolución encuentra prompts de alto fitness, pero ocasionalmente una variante puntúa bien explotando alguna peculiaridad de tu conjunto de entrada; leer el prompt es la comprobación de seguridad que detecta "esto también pasaría mis pruebas pero es raro".
:::
  `,

  "fitness-scoring-explained": `
## Puntuación de fitness explicada

Fitness es el número único que impulsa la selección de Matrix / Eval / Genome. Combina tus calificaciones manuales (señal principal) con métricas objetivas (coste, duración, tasa de éxito, conformidad de longitud-objetivo de salida, señales personalizadas) en una puntuación ponderada. Configuras los pesos por agente o por prueba: por defecto, las calificaciones dominan y las métricas objetivas son desempates.

La puntuación se calcula por variante por entrada y luego se agrega a través de todas las entradas del conjunto de prueba para producir un fitness por variante. Las variantes se clasifican por el fitness agregado; esa clasificación es lo que el algoritmo de selección del genoma consume y lo que la UI del Lab usa para resaltar a los ganadores.

### Puntos clave

- **Puntuación agregada única por variante** — típicamente 0.0–1.0 o 0–100 según preferencia de visualización
- **Múltiples fuentes de entrada** — calificación (principal), coste, duración, éxito, conformidad de formato de salida, funciones de fitness personalizadas
- **Pesos por agente** — enfatiza lo que importa; para agentes sensibles al coste, pesa más el coste; para sensibles a la calidad, pesa más la calificación
- **Agregación a través de entradas** — las variantes se puntúan en cada entrada y luego se promedian, así una variante brillante en una entrada y rota en otra puntúa peor que una mediocre estable
- **Desglose transparente** — haz clic en cualquier número de fitness para ver las contribuciones por señal

### Cómo funciona

El agregador de fitness lee los resultados de ejecución (coste, duración, éxito), el historial de calificaciones (por ejecución) y cualquier señal de fitness personalizada registrada para el agente. Cada una se normaliza a un rango 0-1, se multiplica por su peso configurado y se suma. El resultado es el fitness de la variante; agregar a través de todas las entradas en el conjunto de prueba es la puntuación mostrada.

:::tip
Los pesos por defecto (90 % calificación, 10 % coste) están afinados para la mayoría de los agentes. Si te encuentras en desacuerdo con los "ganadores" del sistema en pruebas eval / matrix, el ajuste más útil suele ser subir más el peso de calificación (95 %) para que el sistema confíe más en tu juicio. Sube el peso de coste para agentes de muy alto volumen donde el coste de tokens sea una preocupación real.
:::
  `,

  "test-history-and-trends": `
## Historial y tendencias de pruebas

Cada prueba del Lab que ejecutas se conserva en el historial de pruebas del agente. La vista de historial (Lab → History) muestra pruebas pasadas ordenadas por fecha con la etiqueta de modo, el conjunto de entrada, las puntuaciones de fitness y el resultado eventual (adoptada / rechazada / superada). Haz clic en cualquier prueba pasada para volver a abrirla en su modo original para revisarla o para clonar los parámetros en una nueva prueba.

La sub-pestaña Trends grafica métricas a nivel de agente a lo largo del tiempo: fitness del prompt actualmente activo, coste-por-ejecución, duración-por-ejecución, tasa de business-outcome. La gráfica está anotada con eventos significativos (cambios de prompt, cambios de modelo, adiciones de disparadores) así que puedes ver el impacto de cada cambio en las métricas en vivo del agente.

### Puntos clave

- **Cada prueba conservada** — entrada completa, salida, calificaciones, fitness; nada se elimina
- **Etiquetada por modo** — filtra por Arena / A-B / Matrix / Eval / Genome para encontrar una prueba pasada específica
- **Gráfica de tendencias** con auto-anotación en cada punto de cambio significativo
- **Compara una prueba pasada con el estado actual** — útil para "¿el prompt actual sigue siendo mejor que el que rechacé hace tres semanas?"
- **Exportable** — el historial de pruebas se exporta a CSV para análisis externo

### Cómo funciona

Los resultados de prueba se guardan en el mismo almacén de ejecución que las ejecuciones de producción, con la etiqueta de modo de prueba para filtrado. La vista Trends agrega desde este almacén; las auto-anotaciones se extraen del historial de versiones y del historial de configuración (que también son persistentes). Nada en el historial es mutable: las pruebas pasadas son registros inmutables de qué se probó y cuándo.

:::tip
La vista Trends es el mejor sitio para responder "¿está mejorando realmente mi agente con el tiempo?". Ábrela una vez al mes; si la tendencia de fitness es plana o decreciente, los cambios recientes no están ayudando y es momento de pensar en lugar de seguir lanzando cambios.
:::
  `,
};
