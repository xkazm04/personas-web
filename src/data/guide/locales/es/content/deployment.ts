export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Ejecución local vs en la nube

Los agentes de Personas se ejecutan en dos lugares: en tu máquina local (el propio motor de la app de escritorio) o en un orquestador remoto (gestionado en la nube por nosotros, o BYOI en tu propia infraestructura). Local es el predeterminado y funciona de fábrica; la nube es opcional (nivel Team / Builder) y habilita disponibilidad 24/7 sin que tu máquina esté encendida. El mismo prompt, las mismas herramientas y las mismas credenciales del agente funcionan en cualquier entorno: cambiar es una decisión de despliegue, no un rediseño.

Los factores decisivos típicos son los requisitos de disponibilidad y observabilidad. Local funciona genial para desarrollo, pruebas, agentes exploratorios y cualquier cosa donde estés cerca para observar el trabajo. La nube es la elección correcta para ejecuciones programadas de noche, agentes de webhook que necesitan estar accesibles mientras duermes y cualquier automatización de nivel producción donde "mi portátil estaba cerrado" no pueda ser un modo de fallo.

:::compare
**Ejecución local** [default]
Corre en el motor de la app de escritorio. Disponible mientras la app esté abierta. Cero configuración. Los datos y credenciales nunca salen de tu máquina. Observabilidad completa en vivo en la misma UI con la que construyes. Ideal para desarrollo, pruebas, trabajo supervisado y cualquier cosa sensible a la privacidad.
---
**Ejecución en la nube**
Corre en el orquestador (nube gestionada o BYOI). Disponible 24/7 independientemente de tu máquina local. La configuración es de una sola vez. Los datos y credenciales se cifran en tránsito al orquestador y en reposo dentro de él. Los resultados se sincronizan a tu escritorio. Ideal para calendarios, webhooks y trabajo de nivel producción sin supervisión.
:::

### Cómo funciona

Los agentes locales los despacha el motor de ejecución dentro de la app, el mismo camino que usa todo lo demás en la app. Los agentes en la nube se despliegan: la configuración completa del agente (prompt, herramientas, credenciales por referencia, disparadores) se envía al orquestador, que ejecuta un proceso de agente de larga vida que maneja los disparadores del lado del servidor. Los resultados se transmiten de vuelta a la app de escritorio y aparecen en las mismas vistas de monitorización que las ejecuciones locales.

:::tip
Desarrolla y prueba localmente, luego despliega lo que funcione a la nube. El motor local tiene el bucle editar-probar más rápido; la nube es donde pones agentes cuyo calendario o disponibilidad importa. No tienes que elegir una u otra globalmente: las configuraciones típicas tienen la mayoría de los agentes locales y un puñado de los de producción en la nube.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Conectarse al orquestador en la nube

Abre Deployment → Cloud Deploy para conectarte a un orquestador. Dos caminos: el **orquestador gestionado** (lo alojamos nosotros; te autenticas con tu cuenta y listo en 30 segundos) o **BYOI** (alojas el orquestador en tu propia infraestructura; apuntas la app de escritorio a tu endpoint y proporcionas una clave de autenticación). De cualquier modo, la conexión es de una sola vez por máquina y persiste entre reinicios de la app.

Una vez conectado, la pestaña Settings de cada agente gana una opción "Deploy to cloud". Disparar el despliegue sube la configuración del agente al orquestador y arranca un proceso de larga vida del lado del servidor. Los agentes en la nube aparecen en las mismas vistas de monitorización que los locales, etiquetados con un pequeño ícono de nube.

:::steps
1. **Abre Deployment → Cloud Deploy** — barra lateral → Deployment → Cloud Deploy
2. **Elige entorno** — Managed Cloud (inicio de sesión con un clic) o BYOI (introduce tu URL de orquestador + clave de auth)
3. **Para BYOI**: pega la URL del orquestador y el token de auth; el asistente ejecuta una prueba de conexión y verifica la compatibilidad de versión del orquestador
4. **Para Managed**: haz clic en "Sign in"; el flujo OAuth se abre para autenticarte contra tu cuenta de Personas
5. **Guarda** — la conexión persiste; los agentes ahora muestran una opción "Deploy to cloud" en su pestaña Settings
:::

:::warning
Trata el token de auth de BYOI como cualquier otra credencial: guárdalo en la bóveda (Connections → Credentials → Custom), no lo pegues en chats ni lo subas a control de versiones. Quien tenga el token puede desplegar y retirar cualquier agente del orquestador.
:::

### Cómo funciona

El orquestador es un proceso de servidor de larga vida (uno por entorno) que mantiene las configuraciones de agente desplegadas y las ejecuta por calendario, por evento de webhook o bajo demanda. La comunicación entre la app de escritorio y el orquestador es por TLS con auth mutua. Las credenciales de los agentes desplegados se cifran en el momento del despliegue usando la clave por tenant del orquestador y se descifran solo dentro del proceso del orquestador en tiempo de ejecución.

:::tip
Prueba la conexión antes de desplegar nada. La prueba de conexión del asistente verifica la compatibilidad de versión y la alcanzabilidad; si falla, el fallo es mucho más fácil de diagnosticar ahora que después de haber intentado desplegar tres agentes.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Desplegar un agente en la nube

Con un orquestador conectado, desplegar cualquier agente es un solo botón en su pestaña Settings. La acción de desplegar empaqueta la configuración completa del agente (prompt, herramientas, referencias de credenciales, definiciones de disparador, ajustes) y la envía al orquestador por TLS. El orquestador valida, configura el agente y empieza a manejar sus disparadores del lado del servidor. La primera ejecución suele ocurrir en segundos.

Las copias local y en la nube del mismo agente se mantienen sincronizadas vía el mismo sistema de auto-sincronización que maneja toda la coordinación escritorio ↔ nube. Puedes seguir iterando sobre el agente localmente y volver a desplegar cuando esté listo; no tienes que elegir entre los dos entornos.

:::steps
1. **Verifica la conexión al orquestador** — Deployment → Cloud Deploy debería mostrar "Connected"
2. **Abre el agente** — página Agents → el que quieres desplegar
3. **Pestaña Settings → Deploy to Cloud** — botón en la sección de despliegue
4. **Revisa el resumen del despliegue** — credenciales enviadas, disparadores armados, selección de modelo, ajustes de alternativo; todo debería coincidir con lo que probaste localmente
5. **Confirma Deploy** — el orquestador recibe la configuración, valida, configura el agente; el estado pasa a "Deployed" en segundos
6. **Verifica en el panel** — Overview → Activity muestra el agente con un ícono de nube; el próximo evento programado / de webhook se enrutará a la instancia en la nube
:::

:::warning
Los agentes en la nube usan credenciales de la bóveda del lado de la nube, no directamente de tu bóveda local. La acción de despliegue envía *referencias* de credenciales (cifradas) y el orquestador las resuelve del lado del servidor. Si una credencial es solo local o no se ha replicado, el despliegue surfacea una advertencia de "credencial no disponible en la nube" y te pide que repliques o elijas un sustituto antes de completar.
:::

### Cómo funciona

El despliegue es atómico: o el orquestador acepta la configuración entera y el agente sale en vivo, o rechaza (con una razón específica) y nada cambia del lado del servidor. Una vez desplegado, el orquestador es dueño de la evaluación de disparadores: tu app local ya no dispara calendarios / webhooks para ese agente (de lo contrario habría duplicados). Las ejecuciones manuales desde la app de escritorio se enrutan a la instancia en la nube por la misma conexión.

:::tip
Despliega primero los agentes programados al empezar con la nube. Son los que más se benefician del uptime 24/7, y son los más fáciles de verificar (verás la ejecución aterrizar en su calendario esperado tengas el portátil abierto o no).
:::
  `,

  "cloud-execution-monitoring": `
## Monitorización de ejecución en la nube

Los agentes en la nube son visibles desde las mismas páginas de Overview que los agentes locales: mismo feed de Activity, misma pestaña Health, mismos desgloses de Usage. Un pequeño ícono de nube distingue a los agentes en la nube de los locales. Haz clic en cualquier ejecución en la nube y obtienes la traza completa igual que en una ejecución local: prompt renderizado, llamada al modelo, llamadas a herramientas, salida, coste.

La app de escritorio sondea al orquestador continuamente mientras está abierta y se suscribe a flujos de eventos en vivo mientras está conectada, así que lo que ves es el estado en vivo con un retraso medido en segundos, no en minutos. Cuando la app está cerrada, el orquestador mantiene todo en marcha por su cuenta; abrir la app después pone al día el estado local desde el almacén autoritativo del orquestador.

### Puntos clave

- **Superficie de monitorización unificada** — los agentes locales y en la nube comparten las mismas vistas Activity / Health / Usage
- **Streaming de eventos en vivo** mientras el escritorio está conectado; la persistencia del lado del orquestador garantiza que nada se pierde mientras estás desconectado
- **Ícono de nube** distingue a los agentes residentes en la nube
- **Atribución de coste a la nube** — los gráficos de uso incluyen tanto el gasto local como el de la nube, desglosados por entorno
- **Puesta al día al reconectarse** — abrir la app tras un periodo prolongado sin conexión sincroniza todos los eventos perdidos desde el orquestador

### Cómo funciona

Los agentes en la nube emiten los mismos registros de ejecución y eventos que los locales; el orquestador los guarda del lado del servidor y los replica a la app de escritorio al conectarse. El feed de Activity fusiona los flujos de eventos locales y en la nube en orden cronológico, así una configuración mixta local + nube se ve como una sola vista unificada en lugar de dos paralelas.

:::tip
Configura topes de presupuesto por día en los agentes en la nube desde el primer día. Los agentes en la nube no tienen la comprobación implícita de "estoy viendo esto suceder" que sí tienen las ejecuciones manuales locales; el tope por día es tu red de seguridad contra un prompt descontrolado durante la noche.
:::
  `,

  "github-actions-integration": `
## Integración con GitHub Actions

Los agentes pueden disparar workflows de GitHub Actions vía la herramienta GitHub en su pestaña Connectors, y GitHub Actions puede disparar agentes vía el disparador de webhook estándar. Los dos patrones combinan bien: un evento de GitHub (PR abierto, push a main, release etiquetado) dispara un webhook que inicia un agente de Personas, el agente hace lo suyo y (si hace falta) el agente dispara un workflow como parte de su salida.

El conector GitHub se incluye en el Catalog (Connections → Catalog → Developer Tools → GitHub). La auth es OAuth o un PAT de grano fino: OAuth es preferible cuando el agente solo necesita acceso de lectura; los PATs funcionan bien para operaciones de escritura como despachar workflows.

### Puntos clave

- **GitHub → Personas vía webhook entrante** — disparador de webhook estándar; configura GitHub para que haga POST a la URL del agente
- **Personas → GitHub vía la herramienta GitHub** — el agente puede despachar workflows, comentar en PRs, abrir issues, cualquier cosa que la API de GitHub exponga
- **Auth con scope** — OAuth para agentes de mayoría de lectura, PAT de grano fino para operaciones de escritura; scopes mínimos por agente
- **Sincronización de estado en vivo** — las trazas del agente muestran la petición de workflow_dispatch y la respuesta de GitHub; el agente puede esperar a que el workflow termine si hace falta

### Cómo funciona

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

La herramienta GitHub envuelve las APIs REST/GraphQL de GitHub y expone acciones de alto nivel al agente: "dispatch workflow", "comment on PR", "open issue", "merge PR", etc. El prompt del agente nombra la acción que debería tomar según el disparador; la herramienta maneja la auth, la construcción de la carga y el manejo de la respuesta.

:::warning
Usa PATs de grano fino sobre PATs clásicos siempre que tu plan de GitHub los soporte. Los PATs clásicos otorgan permisos amplios a nivel de toda la organización; los de grano fino restringen a repositorios específicos y scopes de permisos específicos, lo que reduce drásticamente el radio de explosión si el token llegara a filtrarse.
:::

:::tip
Empieza con un workflow de bajo riesgo como objetivo, como un workflow "notify Slack" que solo publica un mensaje. Una vez que el relevo agente → GitHub Actions esté probado, gradúate a objetivos de mayor riesgo (deploy, release-cut, etc.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Integración con GitLab CI/CD

Personas se integra con GitLab de dos formas: un plugin directo de GitLab que da a los agentes acceso a nivel de API (estado de pipeline, comentarios en MR, gestión de issues) y una exportación a YAML de GitLab CI que ejecuta agentes de Personas como pasos dentro de tus pipelines existentes. Ambas se incluyen; elige la que encaje con la forma del flujo de tu equipo.

El plugin (Plugins → GitLab) maneja la integración del lado API: instálalo, autentícate, y tus agentes obtienen una superficie de herramienta \`gitlab\` con las acciones de alto nivel (start pipeline, comment on MR, manage issues). La exportación a YAML de CI va en la otra dirección: tus agentes se convierten en pasos de tus pipelines de GitLab CI, ejecutados por los runners de GitLab, con resultados pasados hacia los pasos siguientes.

### Puntos clave

- **Plugin de GitLab** — integración a nivel de API; el agente usa GitLab como herramienta desde su pestaña Connectors
- **Exportación a YAML de CI** — el agente se convierte en un paso en tu pipeline de GitLab; corre en tus runners de GitLab
- **Bidireccional** — los eventos de GitLab pueden disparar agentes (webhook) y los agentes pueden disparar pipelines de GitLab (plugin)
- **Scopes de token** — usa project access tokens o group access tokens con scope a los permisos mínimos necesarios
- **Eventos de pipeline como disparadores** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` son todos consumibles vía disparador de webhook

### Cómo funciona

El plugin usa tokens de API de GitLab almacenados en la bóveda de credenciales. Cuando un agente invoca una acción de la herramienta GitLab, el motor despacha la llamada a la API, captura la respuesta y la pasa de vuelta como resultado de herramienta para el siguiente turno del modelo.

Para exportación CI: abre la pestaña Settings del agente → Export → GitLab CI YAML. El asistente genera una definición de job que envuelve al agente en una forma ejecutable por CI (típicamente una imagen Docker con el CLI de Personas más la referencia del agente). Confirma el YAML generado al \`.gitlab-ci.yml\` de tu repositorio; el agente corre como parte de tu pipeline junto a cualquier otro job de CI.

:::warning
El YAML de CI exportado referencia variables de credenciales para cosas como claves de proveedores de IA. Define estas como variables **enmascaradas, protegidas** de GitLab CI/CD en los ajustes de tu proyecto: nunca codifiques secretos en el propio archivo YAML, ya que el YAML del pipeline vive en tu repositorio y es visible para cualquiera con acceso de lectura.
:::

:::tip
El plugin es la opción más liviana para la mayoría de los equipos. La exportación a YAML de CI es más útil cuando el agente tiene que correr dentro de un runner de GitLab de todos modos (aislamiento de red, recursos de red interna, infraestructura mandatada por cumplimiento); si no, el plugin te permite mantener al agente en Personas, donde su observabilidad y depuración son más ricas.
:::
  `,

  "n8n-workflow-integration": `
## Integración con flujos de n8n

n8n es una herramienta popular de código abierto para automatización de flujos, y Personas se integra con ella bidireccionalmente. Puedes importar flujos existentes de n8n a Personas como plantillas (Templates → n8n Import): el asistente de importación analiza el JSON del flujo y mapea los nodos de n8n a agentes, conectores y disparadores equivalentes de Personas. También puedes llamar a agentes de Personas *desde* n8n usando nodos HTTP/webhook para invocar la URL de webhook entrante de un agente.

La importación desde n8n es unidireccional y de una sola vez: trae la *forma* del flujo a Personas, pero no mantiene el original de n8n sincronizado. Tras la importación, el pipeline importado es tuyo para editar de forma independiente.

### Puntos clave

- **Importación n8n → Personas** — Templates → n8n Import; analiza el JSON del flujo, mapea nodos a equivalentes de Personas
- **Disparo Personas → n8n** — los nodos HTTP/webhook de n8n pueden hacer POST a la URL de disparador de webhook de un agente
- **Disparo n8n → Personas** — n8n puede llamar al webhook de un agente de Personas como parte de un flujo de n8n; la respuesta del agente (configurable) fluye de vuelta a n8n
- **No sincronizados** — los pipelines importados divergen de su fuente n8n; trata la importación como un punto de partida único
- **Cobertura de nodos mapeados** — el importador maneja nodos comunes (HTTP, function, IF, switch); los nodos exóticos / de la comunidad pueden importarse como marcadores de posición para completar manualmente

### Cómo funciona

El asistente de importación lee el JSON del flujo de n8n (exportado desde n8n → "Download" sobre el flujo), mapea cada nodo a su equivalente más cercano de Personas (nodos HTTP → herramientas, nodos function → agentes, IF/switch → enrutamiento condicional, etc.) y deja el resultado como un pipeline que vista previa antes de aceptar. El mapeo es de mejor esfuerzo: cualquier cosa que el importador no pueda mapear con confianza se convierte en un marcador de posición con una nota para que la rellenes.

Para la dirección inversa, la URL de webhook del agente de Personas es solo una URL: cualquier nodo HTTP de n8n puede llamarla. Pasa la entrada como cuerpo de la petición; el agente procesa y (opcionalmente) responde de forma síncrona con su salida.

:::tip
n8n destaca en la "fontanería" de mover datos entre servicios; Personas destaca en "pensar": analizar, decidir, escribir. Los flujos combinados más fuertes usan n8n para la orquestación más agentes de Personas para puntos de decisión impulsados por IA, en lugar de intentar hacer todo de uno en el otro.
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Trae tu propia infraestructura

BYOI (nivel Builder) significa que tú mismo ejecutas el orquestador en lugar de usar nuestra nube gestionada. Instalas el software del orquestador (proporcionado como imagen Docker y chart de Kubernetes Helm) en tu propia infraestructura, lo configuras a tu gusto (auth, almacenamiento, red) y apuntas la app de escritorio a la URL de tu orquestador. A partir de ese momento, desplegar agentes funciona idénticamente que en la nube gestionada: solo corren en tu hardware.

BYOI es la elección correcta cuando importa la soberanía de los datos (entornos regulatorios, aislamiento de datos de cliente, redes air-gapped), cuando tienes infraestructura existente que quieres aprovechar (en lugar de pagar por hosting gestionado encima) o cuando quieres control total del entorno de ejecución (red personalizada, garantías específicas de disponibilidad, integración con tu stack de observabilidad existente).

### Puntos clave

- **Orquestador autoalojado** — imagen Docker + chart Helm publicados por release
- **Soberanía de datos** — datos de ejecución, credenciales y trazas nunca dejan tu infraestructura
- **Misma semántica de agente** — los agentes desplegados a un orquestador BYOI se comportan idénticamente a los de la nube gestionada
- **Tu auth, tu almacenamiento, tu red** — el orquestador se integra con tu proveedor de identidad existente, base de datos y políticas de red
- **Función de nivel Builder** — requiere suscripción Builder por la licencia del software del orquestador

### Cómo funciona

El orquestador corre como un proceso servidor de larga vida. La imagen Docker es autocontenida para despliegues de un solo nodo; el chart Helm admite configuraciones HA multi-nodo con almacenamiento compartido. La auth se integra con proveedores OIDC para que puedas usar tu SSO existente; el almacenamiento usa Postgres (gestionado o autoalojado); las claves de cifrado de la bóveda de credenciales viven en el KMS que elijas (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Desplegar un agente a un orquestador BYOI es idéntico a la nube gestionada desde la perspectiva de la app de escritorio: misma UI, mismo flujo, misma observabilidad. El endpoint del orquestador simplemente está configurado para apuntar a tu instalación en lugar de la nuestra.

:::info
BYOI es trabajo de infraestructura genuino. El software del orquestador está bien documentado y el chart Helm maneja la mayor parte del setup, pero aún necesitarás a alguien cómodo ejecutando software de servidor en producción. Para equipos sin esa capacidad, la nube gestionada es el mejor punto de partida: cambia a BYOI después si los requisitos cambian.
:::

:::tip
Ejecuta BYOI primero en un entorno de staging si eres nuevo en esto. La guía de setup incluye un "stack local mínimo" con Docker Compose que corre el orquestador + Postgres + Vault en una sola máquina, perfecto para tener las partes móviles funcionando antes de desplegar hardware de producción.
:::
  `,

  "syncing-desktop-and-cloud": `
## Sincronizar escritorio y nube

Cuando tienes agentes desplegados a un orquestador en la nube, la app de escritorio mantiene el estado sincronizado entre ambos automáticamente. Las ediciones locales a un agente desplegado (cambio de prompt, ajuste, rotación de credencial) se envían al orquestador al guardar. Los eventos del lado de la nube (resultados de ejecución, disparos, cambios de salud) se sincronizan de vuelta al escritorio y aparecen en las vistas de monitorización.

La sincronización corre en segundo plano de forma continua mientras el escritorio está conectado. Cuando la app está sin conexión, los cambios locales se encolan y se envían al reconectarse; los eventos de la nube se acumulan del lado del servidor y se descargan al reconectar. La barra de estado muestra el estado de sincronización con un pequeño indicador (verde = totalmente sincronizado, ámbar = sincronización en progreso / cambios encolados, rojo = error de sincronización que necesita atención).

### Puntos clave

- **Bidireccional, automática** — los cambios locales se envían al guardar; los eventos de la nube se descargan continuamente
- **Tolerante a falta de conexión** — los cambios locales se encolan estando sin conexión y se envían al reconectar; la nube preserva los eventos para puesta al día
- **Detección de conflictos** — si el mismo agente se edita local y remotamente (por ejemplo, por un compañero que usa el mismo orquestador), el escritorio pide resolver antes de confirmar
- **Indicador de estado** — el elemento de la barra inferior muestra el estado de sincronización en vivo
- **Sincronización manual** — haz clic en el indicador para disparar sincronización explícita; útil justo antes de desconectar

### Cómo funciona

La sincronización usa un vector de versión por recurso. Cada agente, credencial, disparador y registro de ejecución lleva una versión que se incrementa al cambiar. La sincronización es "envía mis versiones, recibe cualquier más nueva": eficiente, consciente de conflictos. Los conflictos (raros, pero posibles en configuraciones de orquestador compartido) aparecen como un prompt de resolución; tú eliges qué versión gana o haces merge manualmente.

:::tip
Echa un vistazo al indicador de sincronización tras cambios significativos. Verde significa que es seguro cerrar la app y confiar en que la nube tiene lo último. Ámbar significa que hay cambios en vuelo: espera unos segundos antes de desconectar si quieres estar seguro.
:::
  `,

  "cloud-troubleshooting": `
## Resolución de problemas en la nube

La mayoría de los problemas en la nube caen en un pequeño conjunto: orquestador inalcanzable (red / firewall / orquestador caído), desajuste de credencial (una credencial que el agente usa no está replicada al lado del orquestador), desajuste de versión (orquestador en una versión anterior a la del escritorio, faltan funciones) o configuración desincronizada (lo local tiene cambios sin guardar que no se han enviado). La página de estado Deployment → Cloud Deploy es la mejor superficie de diagnóstico: muestra la salud del orquestador, el estado de sincronización y el estado de despliegue por agente con razones de fallo específicas.

Para problemas a nivel de agente (agente desplegado pero no corriendo, ejecuciones fallando en la nube pero teniendo éxito localmente), la pestaña Health del agente muestra los mismos diagnósticos para la nube que para local: estado de credencial, razones de fallo recientes, completitud de configuración. La traza de ejecución también muestra si una ejecución se ejecutó en la nube o local, así que puedes aislar problemas "solo de la nube" rápidamente.

### Problemas comunes y arreglos

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Agente no corre en su calendario | Orquestador inalcanzable o disparador desactivado del lado de la nube | Revisa el estado en Deployment; vuelve a desplegar si el estado del disparador es obsoleto |
| Error de credencial en la primera ejecución en la nube | Credencial no replicada al orquestador | Deployment → Cloud Deploy → "Sync credentials"; verifica la pestaña Connectors del agente |
| Los resultados no aparecen en el escritorio | Sincronización pausada o app sin conexión cuando ocurrió la ejecución | Haz clic en el indicador de sincronización; los eventos se descargan al reconectar |
| Agente en la nube más lento que local | Modelo / proveedor distinto configurado al desplegar; o latencia de red del agente al proveedor de IA | Revisa la config efectiva del agente en la vista de detalle de Cloud Deploy |
| Error de "version mismatch" al desplegar | Orquestador en una versión anterior | Actualiza el orquestador (BYOI) o espera al rollout de la nube gestionada |

### Cómo funciona

La página de estado de Deployment sondea al orquestador continuamente mientras el escritorio está conectado y renderiza el resultado como un panel único. Cada agente desplegado tiene un estado por recurso (saludable / degradado / inalcanzable) con el problema específico nombrado. La mayoría de los problemas tienen una resolución de un clic ofrecida directamente desde la fila de estado.

:::warning
"Redeploy" es el arreglo más fácil para muchos problemas en la nube, pero envía el *estado local actual* al orquestador. Si tienes cambios locales que no has revisado (o, en un orquestador compartido, la nube tiene cambios que no han llegado a local), volver a desplegar puede sobrescribirlos. Comprueba siempre el estado de sincronización primero: si está en ámbar, resuelve la sincronización antes de volver a desplegar.
:::

:::tip
El problema en la nube más común con diferencia es "olvidé replicar una credencial a la bóveda de la nube". Antes de desplegar cualquier agente, el asistente de despliegue precomprueba la disponibilidad de credenciales y avisa; presta atención a esa advertencia en lugar de descartarla y la mayoría de los errores de credencial del lado de la nube desaparecen.
:::
  `,
};
