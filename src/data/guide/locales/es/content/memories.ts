export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Cómo funciona la memoria del agente

Tus agentes pueden recordar tareas pasadas y aprender de la experiencia. Cada vez que un agente se ejecuta, puede almacenar información útil: hechos, decisiones, patrones y lecciones aprendidas. Piénsalo como una libreta que tu agente lleva de tarea en tarea, acumulando conocimiento con el tiempo.

Esto significa que tus agentes se vuelven más inteligentes cuanto más los usas. Un agente que ha manejado cientos de consultas de clientes tendrá contexto sobre problemas comunes, soluciones preferidas y decisiones pasadas que un agente nuevo no conocería.

### Puntos clave

- Los agentes **aprenden automáticamente** de cada tarea que completan
- Las memorias persisten **entre ejecuciones**: tu agente recuerda trabajos anteriores
- Cada memoria está **categorizada y clasificada** por importancia
- Puedes **revisar, editar o eliminar** cualquier memoria en cualquier momento

### Cómo funciona

Durante una ejecución, si el agente encuentra algo que vale la pena recordar (un hecho útil, una decisión importante o una lección aprendida) crea una entrada de memoria. La próxima vez que el agente se ejecute, puede recordar memorias relevantes para tomar mejores decisiones. Tienes control total para revisar y gestionar lo que tu agente recuerda.

:::tip
La memoria funciona mejor cuando los agentes tienen tareas consistentes y enfocadas. Un agente que siempre maneja informes de gastos construirá memorias más útiles que uno que hace una tarea distinta cada vez.
:::
  `,

  "memory-categories": `
## Categorías de memoria

Las memorias se organizan en cinco categorías, cada una con un propósito distinto. Esta estructura ayuda a tu agente a recordar el tipo de conocimiento correcto en el momento adecuado, como capítulos en un libro de referencia.

Entender estas categorías te ayuda a revisar y gestionar el conocimiento de tu agente de forma más efectiva. Cada categoría te dice no solo *qué* sabe el agente, sino *qué tipo* de conocimiento es.

### Las cinco categorías

:::compare
**Fact**
Información concreta aprendida de tareas. Ejemplo: "El cliente prefiere lenguaje formal". Trozos sencillos de conocimiento que tu agente recoge.
---
**Decision**
Elecciones tomadas y el razonamiento detrás. Ejemplo: "Elegí envío Express porque el pedido era urgente". Registra el porqué, no solo el qué.
---
**Insight**
Patrones descubiertos a lo largo de varias ejecuciones. Ejemplo: "Los tickets de soporte aumentan cada lunes por la mañana". Se vuelve más inteligente con el tiempo.
---
**Learning**
Lecciones de errores o éxitos. Ejemplo: "Líneas de asunto más cortas obtienen mayores tasas de apertura". Mejora continua en acción.
---
**Warning**
Trampas a las que prestar atención. Ejemplo: "Nunca enviar facturas antes de que el contrato esté firmado". Evita que tu agente repita errores pasados.
:::

### Cómo funciona

Cuando un agente crea una memoria, la categoriza automáticamente según el contenido. Los hechos son trozos sencillos de información. Las decisiones registran elecciones con razonamiento. Los insights capturan patrones. Los aprendizajes vienen de reflexionar sobre los resultados. Las advertencias marcan cosas a evitar.

:::tip
Presta especial atención a la categoría Warnings durante tus revisiones. Estas memorias ayudan a tu agente a evitar repetir errores pasados: a menudo son las más valiosas.
:::
  `,

  "importance-levels": `
## Niveles de importancia

Cada memoria tiene una puntuación de importancia del 1 al 5. Una puntuación de 1 significa que es información rutinaria, mientras que 5 significa que es crítica. Las memorias importantes se recuerdan con más frecuencia, permanecen más tiempo y tienen más peso cuando el agente toma decisiones, igual que recuerdas mejor los grandes eventos de la vida que lo que comiste el martes pasado.

Este sistema de clasificación mantiene a tu agente enfocado en lo que más importa, en vez de ahogarse en detalles triviales.

### La escala

| Nivel | Etiqueta | Prioridad de recuerdo | Descripción |
|-------|-------|-----------------|-------------|
| 1 | Routine | Baja | Detalles menores que pueden ser útiles ocasionalmente |
| 2 | Useful | Moderada | Contexto útil que enriquece la comprensión |
| 3 | Important | Estándar | Conocimiento que influye regularmente en decisiones |
| 4 | Very Important | Alta | Información clave que el agente debería considerar casi siempre |
| 5 | Critical | Siempre | Conocimiento esencial que nunca debe olvidarse o ignorarse |

### Cómo funciona

La importancia se asigna automáticamente al crear una memoria, basándose en factores como con qué frecuencia se referencia la información y cuánto afectó a los resultados. También puedes ajustar los niveles de importancia manualmente si no estás de acuerdo con la asignación automática.

:::tip
Si un agente sigue cometiendo el mismo error, comprueba si existe la memoria relevante y si su nivel de importancia es lo bastante alto. Subirla a 4 o 5 garantiza que el agente le preste atención.
:::
  `,

  "searching-agent-memories": `
## Buscar memorias del agente

A medida que tus agentes acumulan conocimiento, poder buscar entre sus memorias se vuelve esencial. Escribe una palabra clave o frase y verás al instante cada memoria relacionada en todos tus agentes. Es como buscar en tu correo: rápido, sencillo, y puedes filtrar por categoría, importancia o fecha.

Buscar te ayuda a entender lo que tus agentes saben, verificar que han aprendido correctamente y encontrar información específica rápido.

### Puntos clave

- **Búsqueda de texto completo** — encuentra memorias por cualquier palabra o frase que contengan
- **Filtrar por categoría** — acota los resultados a hechos, decisiones, insights, aprendizajes o advertencias
- **Filtrar por importancia** — muestra solo memorias de alta prioridad o baja prioridad
- **Búsqueda entre agentes** — busca en todos tus agentes a la vez o céntrate en uno

### Cómo funciona

Abre la sección \`Memories\` y escribe tu consulta en la barra de búsqueda. Los resultados aparecen al instante con el texto coincidente resaltado. Usa los botones de filtro para acotar por categoría, nivel de importancia, rango de fechas o agente específico. Haz clic en cualquier resultado para ver la memoria completa con todo su contexto.

:::tip
Busca un tema antes de crear una memoria manual. Tu agente podría ya saber lo que estás a punto de enseñarle, en cuyo caso simplemente puedes actualizar la memoria existente.
:::
  `,

  "creating-memories-manually": `
## Crear memorias manualmente

A veces quieres que tu agente sepa algo antes de aprenderlo por su cuenta, como informar a un nuevo empleado en el primer día. Las memorias manuales te permiten enseñar a tus agentes hechos, preferencias o reglas específicas directamente, dándoles una ventaja sobre conocimiento que de otro modo tendrían que descubrir mediante la experiencia.

Esto es especialmente útil para información específica de la empresa, preferencias personales o reglas críticas que nunca deberían aprenderse por ensayo y error.

:::steps
1. **Abre la sección Memories** — haz clic en \`Memories\` en la barra lateral y luego en \`Add Memory\`
2. **Elige la categoría** — selecciona fact, decision, insight, learning o warning
3. **Escribe el contenido de la memoria** — describe el conocimiento en lenguaje claro
4. **Fija el nivel de importancia** — asigna una puntuación del 1 (rutinaria) al 5 (crítica)
5. **Asigna a un agente** — elige un agente específico o haz que la memoria esté disponible para todos los agentes
:::

### Cómo funciona

La memoria que creas se añade a la base de conocimiento del agente igual que una memoria aprendida automáticamente. La próxima vez que el agente se ejecute, puede acceder a esta información junto con todo lo que ha aprendido por su cuenta. Las memorias manuales se marcan con un pequeño ícono para que puedas distinguirlas de las automáticas.

:::tip
Crea unas pocas memorias de "Warning" para tus reglas más críticas antes de que un agente entre en producción. Por ejemplo: "Nunca compartas información de precios sin la aprobación del gerente".
:::
  `,

  "memory-tiers-explained": `
## Niveles de memoria explicados

No todas las memorias son iguales, y no todas necesitan estar accesibles de inmediato. Personas organiza las memorias en cuatro niveles según con qué frecuencia se usan y qué tan importantes son. Piénsalo como un sistema de archivado: los elementos más usados se quedan en tu escritorio, los menos usados van a un cajón y los rara vez necesitados se archivan en un mueble.

Este sistema por niveles mantiene a tu agente rápido y eficiente. Recuerda las memorias más relevantes al instante mientras sigue teniendo acceso a conocimiento antiguo cuando hace falta.

### Los cuatro niveles

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Siempre cargado. Reglas y hechos críticos permanentes. Anclados manualmente y nunca degradados. El conocimiento más importante de tu agente.
---
**Active**
Cargado al recordar. Memorias recientes accedidas con frecuencia. Auto-promovidas por frecuencia de uso. El "cajón del escritorio" de contexto útil.
---
**Working**
Alcance de sesión. Memorias de la tarea actual o sesiones recientes. Creadas durante la ejecución y maduran a Active con el tiempo.
---
**Archive**
Solo bajo demanda. Memorias antiguas no accedidas recientemente. Auto-degradadas tras inactividad pero preservadas indefinidamente. Nada se pierde nunca.
:::

### Cómo funciona

Las memorias se mueven entre niveles automáticamente según los patrones de uso. Una memoria recordada con frecuencia sube a un nivel más alto; una que no se ha accedido en un tiempo se mueve gradualmente hacia el archivo. También puedes anclar manualmente memorias al nivel Core para garantizar que siempre estén presentes para tu agente.

:::tip
Ancla tus reglas y hechos más importantes al nivel Core. Esto garantiza que tu agente siempre los considere, sin importar qué tan antiguas sean.
:::
  `,

  "memory-and-execution": `
## Memoria y ejecución

Cuando tu agente comienza una nueva tarea, no empieza con una pizarra en blanco. Recuerda automáticamente memorias relevantes de ejecuciones anteriores, trayendo contexto, preferencias y lecciones aprendidas a la ejecución actual. Esto hace que cada ejecución esté más informada que la anterior.

El proceso de recuerdo es inteligente: no vuelca cada memoria de golpe. En cambio, selecciona las más relevantes para la tarea actual, igual que recuerdas naturalmente experiencias relacionadas al enfrentar una situación familiar.

### Puntos clave

- **Recuerdo automático** — las memorias relevantes se cargan antes de cada ejecución
- **Consciente del contexto** — solo se recuerdan memorias relacionadas con la tarea actual
- **Ponderado por importancia** — las memorias de mayor importancia tienen más probabilidad de ser recordadas
- **Creación de memorias** — pueden crearse nuevas memorias durante la ejecución según los resultados

### Cómo funciona

Antes de que tu agente procese su tarea, el sistema de memoria escanea entradas relevantes según el contenido y el contexto de la tarea. Estas memorias se le proporcionan al modelo de IA junto con tus instrucciones. Tras completarse la tarea, el agente evalúa si se aprendió algo nuevo y crea memorias en consecuencia.

:::tip
Si un agente no está usando sus memorias de forma efectiva, comprueba que las memorias estén categorizadas y puntuadas correctamente. Las memorias bien organizadas se recuerdan con más fiabilidad.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Revisar y limpiar memorias

Con el tiempo, algunas memorias se vuelven obsoletas, incorrectas o redundantes. Las revisiones periódicas mantienen la base de conocimiento de tu agente precisa y al día. Piénsalo como una limpieza de primavera para el cerebro de tu agente: quitar información antigua para que tu agente tome decisiones basadas en conocimiento actual y correcto.

Una base de memoria limpia conduce a mejor rendimiento del agente. Un agente que se apoya en información obsoleta puede tomar malas decisiones sin darse cuenta de por qué.

### Puntos clave

- **Explora todas las memorias** con opciones de ordenamiento y filtrado
- **Edita** cualquier memoria para corregir inexactitudes o actualizar información obsoleta
- **Elimina** memorias que ya no son relevantes
- **Fusiona** memorias duplicadas o similares en una sola entrada clara

### Cómo funciona

Abre la sección \`Memories\` y explora la lista de memorias de tu agente. Ordena por fecha, importancia o categoría para enfocar tu revisión. Haz clic en cualquier memoria para editar su contenido, cambiar su nivel de importancia o eliminarla. El sistema también sugiere posibles duplicadas que podrían fusionarse.

:::tip
Programa una revisión mensual de las memorias de tus agentes más activos. Incluso 15 minutos de limpieza pueden mejorar notablemente la calidad de toma de decisiones de un agente.
:::
  `,

  "exporting-and-importing-memories": `
## Exportar e importar memorias

Puedes exportar toda la base de memoria de tu agente a un archivo, perfecto para respaldos, compartir conocimiento entre agentes o mudarte a una nueva computadora. Importar carga un archivo exportado previamente y añade esas memorias a la base de conocimiento del agente destino.

Esta función también es estupenda para dar a un nuevo agente el beneficio de la experiencia de otro. Exporta desde tu agente experimentado, importa al nuevo, y empieza con una gran cantidad de conocimiento en lugar de una pizarra en blanco.

### Puntos clave

- **Exportar a archivo** — guarda todas las memorias como un archivo portable que puedes almacenar o compartir
- **Importar desde archivo** — carga memorias en cualquier agente en cualquier dispositivo
- **Exportación selectiva** — elige categorías específicas o niveles de importancia a exportar
- **Manejo de conflictos** — los duplicados se detectan y se fusionan durante la importación

### Cómo funciona

Abre los ajustes de memoria de un agente y haz clic en \`Export\`. Elige qué memorias incluir (todas, o filtradas por categoría/importancia) y guarda el archivo. Para importar, abre los ajustes de memoria del agente destino, haz clic en \`Import\` y selecciona tu archivo. Personas detecta duplicados y te deja decidir cómo manejarlos.

:::tip
Antes de un cambio mayor al prompt de un agente, exporta sus memorias como respaldo. Si el nuevo prompt crea confusión, puedes restaurar las memorias originales.
:::
  `,

  "memory-best-practices": `
## Buenas prácticas de memoria

Sacar el máximo provecho de la memoria del agente se reduce a unos pocos hábitos clave. Como buenos hábitos de estudio para un estudiante, la forma en que estructures y mantengas las memorias marca una gran diferencia en cuán eficazmente tus agentes aprenden y recuerdan información.

Sigue estas pautas para construir agentes que mejoren genuinamente con el tiempo en lugar de acumular desorden.

### Buenas prácticas

- **Mantén a los agentes enfocados** — un agente con una tarea consistente construye memorias más útiles que un generalista
- **Revisa con regularidad** — comprueba las memorias mensualmente y elimina entradas obsoletas o incorrectas
- **Usa memorias manuales para reglas críticas** — no esperes a que el agente aprenda algo por las malas
- **Fija niveles de importancia apropiados** — no todo es crítico, y está bien
- **Ancla el conocimiento esencial** al nivel Core para que siempre esté disponible

### Cómo funciona

La buena gestión de la memoria es una práctica continua, no una configuración única. Empieza creando unas pocas memorias manuales para tus reglas más importantes. Deja que el agente aprenda naturalmente de sus ejecuciones. Revisa periódicamente para corregir errores y eliminar información obsoleta. Ajusta los niveles de importancia conforme tu comprensión de lo que importa evoluciona.

:::tip
Piensa en la gestión de memoria como cuidar un jardín. Pequeños esfuerzos regulares (podar, regar, replantar) producen mejores resultados que renovaciones grandes ocasionales.
:::
  `,
};
