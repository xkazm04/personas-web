export const content: Record<string, string> = {
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

};
