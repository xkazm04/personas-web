import type { Translations } from './en';

export const es: Translations = {
    notFound: {
      title: "P\u00e1gina no encontrada",
      description: "La p\u00e1gina que buscas no existe o se ha movido. Prueba con una de estas:",
      home: "Inicio",
      getStarted: "Empezar",
      backToHome: "Volver al inicio"
    },
    errorPage: {
      title: "Esta p\u00e1gina tuvo un problema inesperado",
      description: "Algo sali\u00f3 mal al cargar esta p\u00e1gina. Nuestro equipo ha sido notificado \u2014 intenta de nuevo o vuelve al inicio.",
      tryAgain: "Intentar de nuevo",
      errorReference: "Referencia del error",
      copyReference: "Copiar referencia del error",
      backToHome: "Volver al inicio"
    },
    nav: {
      home: "Personas",
      how: "C\u00f3mo funciona",
      connections: "Conexiones",
      roadmap: "Hoja de ruta",
      templates: "Plantillas",
      download: "Descargar",
      dashboard: "Panel",
      features: "Caracter\u00edsticas",
      guide: "Gu\u00eda",
      useCases: "Casos de uso",
      tour: "Recorrido",
      security: "Seguridad",
      blog: "Blog",
      changelog: "Registro de cambios",
      pricing: "Precios",
      menu: "Men\u00fa"
    },
    compareSection: {
      heading: "Todo es",
      headingGradient: "gratis",
      description: "La aplicaci\u00f3n de escritorio y todas las funciones siguientes son gratuitas para siempre. Sin niveles, sin precio por puesto: solo una plataforma de agentes completa que se ejecuta en tu m\u00e1quina.",
      offerBadges: [
        "Gratis para siempre",
        "Autoalojado",
        "Sin recargo por ejecuci\u00f3n",
        "C\u00f3digo abierto"
      ],
      offerBody: "Personas se ejecuta en tu m\u00e1quina. Sin recargos de orquestaci\u00f3n ni precios por asiento. La nube de pago y el soporte prioritario son opcionales, no obligatorios.",
      ctaLabel: "Empieza gratis",
      readGuide: "Leer la gu\u00eda",
      groups: {
        "agents-prompts": {
          title: "Agentes y Prompts",
          tagline: "Centrado en los usuarios",
          concepts: [
            "Creaci\u00f3n de personas en lenguaje natural",
            "40+ plantillas adoptables",
            "BYOM: Claude u Ollama local",
            "Modos de prompt estructurado + simple",
            "Memoria de agente persistente"
          ]
        },
        triggers: {
          title: "Orquestaci\u00f3n",
          tagline: "Todas las formas de iniciar un agente",
          concepts: [
            "Programaci\u00f3n (cron)",
            "Endpoints de webhook",
            "Vigilante de archivos",
            "Monitor del portapapeles",
            "Disparador en cadena / por evento",
            "Condiciones compuestas"
          ]
        },
        pipelines: {
          title: "Pipelines y Equipos",
          tagline: "Colaboraci\u00f3n ag\u00e9ntica visual",
          concepts: [
            "Lienzo de equipo visual",
            "Conexiones de flujo de datos",
            "Bus de eventos en vivo",
            "Ejecuci\u00f3n con autorreparaci\u00f3n",
            "Repetici\u00f3n de pipeline + viaje en el tiempo"
          ]
        },
        credentials: {
          title: "Credenciales y Seguridad",
          tagline: "Tus secretos permanecen en tu m\u00e1quina",
          concepts: [
            "B\u00f3veda AES-256-GCM",
            "Llavero nativo del SO",
            "OAuth asistido por IA",
            "Renovaci\u00f3n autom\u00e1tica de tokens",
            "Cero telemetr\u00eda, local primero"
          ]
        },
        monitoring: {
          title: "Monitorizaci\u00f3n",
          tagline: "Ver, costear y controlar cada ejecuci\u00f3n",
          concepts: [
            "Panel de observabilidad en vivo",
            "Trazado de spans por ejecuci\u00f3n",
            "Atribuci\u00f3n de costes por modelo",
            "Colas de revisi\u00f3n humana",
            "Alertas de presupuesto + aplicaci\u00f3n"
          ]
        },
        testing: {
          title: "Laboratorio de pruebas",
          tagline: "Evoluci\u00f3n automatizada",
          concepts: [
            "Arena para pruebas A/B",
            "Versionado de prompts + diffs",
            "Puntuaci\u00f3n de aptitud",
            "Ciclos de cr\u00eda",
            "Entornos aislados de herramientas simuladas"
          ]
        }
      }
    },
    footer: {
      tagline: "Agentes de IA que trabajan para ti",
      motto: "Agentes de IA que automatizan tu trabajo, para que puedas enfocarte en lo que m\u00e1s importa.",
      product: "Producto",
      resources: "Recursos",
      legal: "Legal",
      privacy: "Privacidad",
      terms: "T\u00e9rminos",
      copyright: "Personas. Todos los derechos reservados.",
      slogan: "Automatiza tu trabajo. Recupera tu tiempo."
    },
    pricing: {
      local: "Local",
      cloud: "Nube",
      enterprise: "Empresa",
      downloadLocal: "Descargar Local",
      goCloud: "Ir a la Nube",
      contactSales: "Contactar Ventas",
      comingSoon: "Pr\u00f3ximamente",
      bestFor: "Ideal para",
      forever: "para siempre",
      mo: "/mes",
      custom: "Personalizado",
      bestForLocal: "Desarrolladores individuales para comenzar",
      bestForCloud: "Equipos individuales \u00e1giles",
      bestForEnterprise: "Organizaciones con necesidades de cumplimiento y escala",
      features: {
        unlimitedLocalAgents: "Agentes locales ilimitados",
        localEventBus: "Bus de eventos y planificador local",
        fullObservability: "Panel de observabilidad completo",
        designEngine: "Motor de dise\u00f1o",
        teamCanvasLocal: "Lienzo de equipo (local)",
        everythingInFree: "Todo en el plan Gratuito",
        cloudWorkers3: "3 workers en la nube",
        executions1000: "1.000 ejecuciones/mes",
        events10000: "10.000 eventos/mes",
        burstAutoScaling: "Auto-escalado por r\u00e1fagas",
        everythingInPro: "Todo en Pro",
        ssoSaml: "SSO v\u00eda SAML y OIDC",
        multiTenantRbac: "Espacios de trabajo multi-tenant con RBAC",
        auditTrailExport: "Exportaci\u00f3n de auditor\u00eda de ejecuciones",
        dedicatedWorkers: "Workers dedicados en la nube y SLA",
        prioritySupport: "Soporte prioritario"
      }
    },
    hero: {
      title: "Agentes de IA que se ejecutan en tu m\u00e1quina",
      subtitle: "Una persona, muchas capacidades. Crea un asistente con una identidad estable y compone las tareas que realiza \u2014 a\u00f1ade, activa o retira capacidades sin empezar desde cero.",
      downloadCta: "Descargar",
      trustLine: "Sin registro, sin tarjeta de cr\u00e9dito. Se ejecuta en tu m\u00e1quina. Cero telemetr\u00eda.",
      cta: "Comenzar",
      badge: "Plataforma de Agentes IA",
      headingLine1: "Agentes inteligentes",
      headingLine2: "que trabajan para ti",
      description: "Dise\u00f1a agentes en lenguaje natural. Orqu\u00e9stalos de forma local o en la nube.",
      descriptionBold: "Sin diagramas de flujo. Sin enjambres de agentes. Sin c\u00f3digo.",
      mode1: "Capacidades componibles",
      mode2: "Configuraci\u00f3n sencilla",
      mode3: "Gratis",
      mode4: "IA multiproveedor",
      mode5: "Se mejora solo",
      viewOnGithub: "Ver en GitHub",
      downloadForWindows: "Descargar para Windows",
      joinWaitlist: "Unirse a la lista de espera de Windows",
      commandCenter: "Centro de Comando",
      adoptionSnapshot: "Panorama de adopci\u00f3n",
      scroll: "Desplazar",
      phases: "FASES",
      publicBeta: "BETA P\u00daBLICA",
      agents: "Agentes",
      executions: "Ejecuciones",
      connectors: "Conectores",
      templates: "Plantillas"
    },
    heroTransition: {
      ariaLabel: "Pilares principales del producto",
      speed: "R\u00e1pido",
      privacy: "Privado",
      scale: "Escalable",
      value: "Una persona, muchas capacidades \u2014 una identidad estable con un conjunto componible de tareas, ejecut\u00e1ndose donde viven tus datos y bajo tu control.",
      cta: "M\u00edralo en acci\u00f3n"
    },
    sections: {
      vision: "Visi\u00f3n",
      pricing: "Precios",
      faq: "Preguntas frecuentes",
      features: "Caracter\u00edsticas",
      useCases: "Casos de uso",
      eventBus: "Bus de eventos",
      download: "Descargar"
    },
    common: {
      skipToMain: "Ir al contenido principal",
      loading: "Cargando...",
      cancel: "Cancelar",
      close: "Cerrar",
      back: "Atr\u00e1s",
      next: "Siguiente",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar",
      noResults: "No se encontraron resultados",
      signOut: "Cerrar sesi\u00f3n",
      signingOut: "Cerrando sesi\u00f3n\u2026",
      signIn: "Iniciar sesi\u00f3n",
      notifyMe: "notif\u00edcame",
      step: "Paso",
      learnMore: "Saber m\u00e1s",
      viewAll: "Ver todo",
      status: "Estado",
      active: "activo",
      idle: "inactivo",
      total: "total",
      checking: "Comprobando\u2026",
      connected: "Conectado",
      disconnected: "Desconectado",
      demo: "Demo",
      viewFullSite: "Ver sitio completo"
    },
    useCasesSection: {
      heading: "Una persona,",
      headingGradient: "muchas capacidades",
      integrations: "integraciones",
      patterns: "capacidades",
      description: "Cada persona lleva una identidad estable y un conjunto componible de capacidades \u2014 haz clic en cualquier integraci\u00f3n para explorar las tareas que una persona puede realizar.",
      autoplayHint: "Rotaci\u00f3n autom\u00e1tica \u2014 haz clic para detener.",
      browseTemplates: "Ver Todas las Plantillas",
      whatCanAutomate: "Lo que Personas puede automatizar",
      gmail: {
        name: "Gmail",
        cases: [
          {
            title: "Inbox triage",
            desc: "Auto-label, prioritize, and draft replies for inbound emails based on sender and content."
          },
          {
            title: "Follow-up reminders",
            desc: "Detect unanswered threads and send gentle follow-ups after configurable delays."
          },
          {
            title: "Meeting prep",
            desc: "Scan upcoming calendar invites, pull relevant email threads, and summarize context."
          }
        ]
      },
      slack: {
        name: "Slack",
        cases: [
          {
            title: "Channel summarizer",
            desc: "Digest long channels into actionable summaries delivered to you every morning."
          },
          {
            title: "Standup collector",
            desc: "DM each team member for status updates, compile into a single standup post."
          },
          {
            title: "Alert router",
            desc: "Triage incoming alerts from monitoring tools and escalate to the right channel."
          }
        ]
      },
      github: {
        name: "GitHub",
        cases: [
          {
            title: "PR reviewer",
            desc: "Analyze pull requests for bugs, style issues, and missing tests \u2014 post inline comments."
          },
          {
            title: "Issue groomer",
            desc: "Auto-label stale issues, request more info, and suggest duplicates."
          },
          {
            title: "Release notes",
            desc: "Generate changelog entries from merged PRs grouped by category and impact."
          }
        ]
      },
      drive: {
        name: "Google Drive",
        cases: [
          {
            title: "Doc organizer",
            desc: "Auto-file documents into folders based on content, project tags, and ownership."
          },
          {
            title: "Permissions auditor",
            desc: "Weekly scan of shared files \u2014 flag over-shared docs and external access."
          },
          {
            title: "Content indexer",
            desc: "Build a searchable knowledge base from scattered Drive documents."
          }
        ]
      },
      jira: {
        name: "Jira",
        cases: [
          {
            title: "Sprint planner",
            desc: "Analyze velocity history and suggest optimal story point allocation for next sprint."
          },
          {
            title: "Blocker detector",
            desc: "Monitor ticket dependencies and alert when a critical path item is stuck."
          },
          {
            title: "Status syncer",
            desc: "Keep Jira tickets in sync with GitHub PRs \u2014 auto-transition on merge."
          }
        ]
      },
      notion: {
        name: "Notion",
        cases: [
          {
            title: "Meeting notes",
            desc: "Transcribe recordings, extract action items, and create linked Notion pages."
          },
          {
            title: "Wiki gardener",
            desc: "Find outdated docs, suggest updates, and archive pages with no recent views."
          },
          {
            title: "Template filler",
            desc: "Auto-populate project brief templates from intake form responses."
          }
        ]
      },
      stripe: {
        name: "Stripe",
        cases: [
          {
            title: "Failed payment recovery",
            desc: "Email customers with failed charges \u2014 offer retry links and alternative methods."
          },
          {
            title: "Revenue alerting",
            desc: "Monitor MRR changes and notify Slack when churn spikes or upgrades surge."
          },
          {
            title: "Invoice reconciler",
            desc: "Match Stripe payouts against your accounting system and flag discrepancies."
          }
        ]
      },
      calendar: {
        name: "Calendario",
        cases: [
          {
            title: "Schedule optimizer",
            desc: "Detect meeting-heavy days and suggest blocks for focus time automatically."
          },
          {
            title: "No-show handler",
            desc: "Track attendees who miss meetings and send rescheduling links."
          },
          {
            title: "Timezone coordinator",
            desc: "Find optimal meeting slots across global teams with minimal late-night asks."
          }
        ]
      },
      figma: {
        name: "Figma",
        cases: [
          {
            title: "Design handoff",
            desc: "Extract component specs, tokens, and assets \u2014 post to the dev channel."
          },
          {
            title: "Comment tracker",
            desc: "Aggregate unresolved Figma comments and create follow-up tasks."
          },
          {
            title: "Version differ",
            desc: "Compare file versions and summarize visual changes for stakeholder review."
          }
        ]
      }
    },
    faqSection: {
      heading: "Preguntas",
      headingGradient: "frecuentes",
      subtitle: "Todo lo que necesitas saber para comenzar con Personas.",
      stillQuestions: "\u00bfA\u00fan tienes preguntas?",
      joinDiscord: "Unirse a Discord",
      discordSubtitle: "\u00danete a nuestra comunidad de Discord para obtener ayuda y participar en discusiones.",
      questions: [
        {
          q: "What is Claude CLI and why do I need it?",
          a: "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally \u2014 it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas."
        },
        {
          q: "Does Personas collect any telemetry or usage data?",
          a: "No. Personas runs entirely on your machine with zero telemetry. We don't collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution."
        },
        {
          q: "How does the pricing model work?",
          a: "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription \u2014 we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine."
        },
        {
          q: "What is Bring Your Own Infrastructure (BYOI)?",
          a: "BYOI lets you connect your own cloud provider credentials (e.g., Fly.io API tokens) instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps \u2014 you only pay your cloud provider directly."
        },
        {
          q: "What's the difference between local and cloud execution?",
          a: "Local execution runs agents on your machine using Claude CLI \u2014 it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration. You can switch between modes per-agent."
        },
        {
          q: "Are there any limits on the number of agents?",
          a: "Locally, there are no limits \u2014 create as many agents as you want. Cloud plans have worker limits (1\u20135 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely."
        }
      ]
    },
    downloadSection: {
      heading: "\u00bfListo para construir tu",
      headingGradient: "agente?",
      subtitle: "Descarga Personas gratis. Empieza a construir en minutos.",
      downloadInstaller: "Descargar instalador",
      joinWaitlist: "Unirse a la lista de espera",
      connectCli: "Conectar Claude CLI",
      launchAgent: "Lanzar primer agente",
      exploreFirst: "Explorar capacidades primero",
      requiresCli: "Requiere Claude CLI",
      installerSize: "Instalador de 12 MB",
      noTelemetry: "Sin telemetr\u00eda",
      localFirst: "Seguridad local-first",
      windows: "Windows",
      macos: "macOS",
      linux: "Linux"
    },
    dashboard: {
      title: "Panel",
      overview: "Resumen",
      agents: "Agentes",
      executions: "Ejecuciones",
      events: "Eventos",
      reviews: "Revisiones",
      observability: "Observabilidad",
      knowledge: "Conocimiento",
      settings: "Configuraci\u00f3n",
      leaderboard: "Clasificaci\u00f3n",
      sla: "SLA",
      incidents: "Incidentes",
      health: "Estado",
      messages: "Mensajes",
      more: "M\u00e1s",
      greeting: {
        morning: "Buenos D\u00edas",
        afternoon: "Buenas Tardes",
        evening: "Buenas Noches"
      },
      agentsStatus: "Esto es lo que pasa con tus agentes",
      lastSeen: "\u00daltima visita",
      greetingFallback: "amigo",
      pendingReviews: "revisiones pendientes",
      totalExecutions: "ejecuciones totales",
      successRate: "tasa de \u00e9xito",
      activeAgents: "agentes activos",
      recentActivity: "Actividad Reciente",
      running: "ejecutando",
      noExecutionsYet: "A\u00fan no hay ejecuciones.",
      executeToSee: "Ejecuta un agente para ver actividad aqu\u00ed.",
      trafficErrors: "Tr\u00e1fico y Errores",
      last14Days: "\u00daltimos 14 d\u00edas",
      noTrafficYet: "A\u00fan sin tr\u00e1fico",
      deployed: "desplegado",
      metricsHealth: "M\u00e9tricas y salud",
      toolUtilization: "Utilizaci\u00f3n de herramientas",
      workers: "workers",
      usageAnalytics: "Anal\u00edticas de Uso",
      errorBoundary: {
        title: "El panel del panel de control no se pudo renderizar",
        description: "Esta secci\u00f3n tuvo un error inesperado. Puedes reintentar sin salir de la p\u00e1gina.",
        retry: "Reintentar",
        errorIdLabel: "ID de error",
        copyErrorId: "Copiar ID de error",
        copied: "Copiado"
      },
      unreadMessages: "mensajes sin leer",
      fleetHealth: "salud de la flota",
      fleet: {
        title: "Optimizaci\u00f3n de la flota",
        severity: {
          urgent: "Urgente",
          suggested: "Sugerido",
          insight: "Perspectiva"
        },
        expand: "Detalles",
        collapse: "Ocultar",
        dismiss: "Descartar"
      },
      staleness: {
        justNow: "Ahora mismo",
        secondsAgo: "hace {n}s",
        minutesAgo: "hace {n}m",
        hoursAgo: "hace {n}h",
        daysAgo: "hace {n}d",
        error: "Error al cargar"
      },
      scope: {
        allPersonas: "Todas las personas",
        personaLabel: "Filtro de persona",
        compare: "Comparar",
        dateRange: {
          last24h: "24h",
          last7d: "7d",
          last30d: "30d",
          last90d: "90d",
          custom: "Personalizado"
        }
      },
      home: {
        vitals: {
          runs: "Ejecuciones",
          alerts: "Alertas"
        },
        cockpit: {
          vitalsTitle: "Constantes de la flota",
          vitalsTrend: "\u00c9xito \u00b7 14 d\u00edas",
          triageTitle: "Cola de triaje",
          triageSubtitle: "Ordenado por urgencia",
          triageEmpty: "Todo en orden: nada requiere tu atenci\u00f3n ahora mismo.",
          triageKindBreach: "Incumplimiento de SLA",
          triageKindIncident: "Incidente",
          triageKindReview: "Revisi\u00f3n",
          tickerLabel: "En vivo",
          tickerSuccess: "\u00c9xito de la flota",
          tickerAgents: "Agentes en l\u00ednea",
          tickerProviders: "Proveedores",
          tickerNextRoutine: "Pr\u00f3xima rutina",
          tickerAlerts: "Alertas abiertas",
          tickerAllClear: "Todo en orden",
          instrumentsTitle: "Instrumentos"
        },
        heatmap: {
          title: "Actividad de ejecuci\u00f3n",
          subtitle: "Ejecuciones por agente \u00b7 \u00faltimos 7 d\u00edas",
          less: "Menos",
          more: "M\u00e1s",
          empty: "A\u00fan no hay ejecuciones."
        },
        topPerformers: {
          title: "Mejores agentes"
        },
        upcomingRoutines: {
          title: "Rutinas pr\u00f3ximas",
          subtitle: "Pr\u00f3ximas ejecuciones programadas",
          empty: "No hay rutinas programadas.",
          triggers: {
            schedule: "Programaci\u00f3n",
            polling: "Sondeo",
            webhook: "Webhook",
            event: "Evento"
          }
        },
        vaultChanges: {
          title: "B\u00f3veda de credenciales",
          subtitle: "Cambios recientes",
          empty: "Sin cambios recientes.",
          actions: {
            rotated: "Rotada",
            added: "A\u00f1adida",
            revoked: "Revocada",
            synced: "Sincronizada"
          }
        }
      }
    },
    dashboardUi: {
      status: {
        queued: "En cola",
        running: "En ejecuci\u00f3n",
        completed: "Completado",
        processed: "Procesado",
        failed: "Fallido",
        cancelled: "Cancelado",
        pending: "Pendiente",
        approved: "Aprobado",
        rejected: "Rechazado"
      },
      testFlow: "Probar flujo",
      eventTypes: "Tipos de eventos",
      stdout: "stdout",
      jumpToLatest: "Ir a lo \u00faltimo",
      loadMoreExecutions: "Cargar m\u00e1s ejecuciones ({visible}/{total})",
      cancelling: "Cancelando...",
      cancelQueuedRun: "Cancelar ejecuci\u00f3n en cola",
      conflict: "Conflicto",
      manualReviews: "Revisiones manuales",
      manualReviewsSubtitle: "Revisa y aprueba decisiones del agente que requieren supervisi\u00f3n humana",
      content: "Contenido",
      selectReview: "Selecciona una revisi\u00f3n",
      selectReviewDesc: "Elige una revisi\u00f3n de la lista para ver los detalles y tomar una acci\u00f3n",
      navigate: "navegar",
      execution: "Ejecuci\u00f3n",
      reviewerNotes: "Notas del revisor",
      notesPlaceholder: "Agrega notas opcionales antes de resolver...",
      selected: "seleccionado",
      selectReviewsBulk: "Selecciona revisiones para acciones masivas",
      noReviewsInFilter: "No hay revisiones en este filtro",
      refreshing: "Actualizando...",
      rejectSelectedTitle: "\u00bfRechazar las revisiones seleccionadas?",
      rejectSelectedBody: "Esto rechazar\u00e1 {count} revisi\u00f3n{plural} seleccionada. Tendr\u00e1s 5 segundos para deshacer esta acci\u00f3n.",
      undo: "Deshacer",
      retry: "Reintentar",
      bulkFailedApprove: "No se pudieron aprobar {failed} de {total}",
      bulkFailedReject: "No se pudieron rechazar {failed} de {total}",
      bulkSucceededReselected: "{count} con \u00e9xito \u00b7 elementos fallidos vueltos a seleccionar",
      allShortcuts: "Todos los atajos",
      keyboardShortcuts: "Atajos de teclado",
      searchShortcuts: "Buscar atajos...",
      noShortcutsMatch: "Ning\u00fan atajo coincide con \"{query}\"",
      failedAgentDetails: "No se pudieron cargar los detalles del agente",
      retryAgentDetails: "Reintentar",
      recentExecutions: "Ejecuciones recientes",
      noExecutionsYet: "A\u00fan no hay ejecuciones",
      subscription: "suscripci\u00f3n",
      subscriptions: "suscripciones",
      trigger: "disparador",
      triggers: "disparadores",
      closeAgentDetails: "Cerrar detalles del agente",
      metricConcurrency: "Concurrencia",
      metricTimeout: "Tiempo de espera",
      metricBudget: "Presupuesto",
      metricConcurrencyTitle: "Hasta {n} ejecuciones simult\u00e1neas",
      metricTimeoutTitle: "Tiempo de espera de ejecuci\u00f3n: {n} segundos",
      metricBudgetTitle: "L\u00edmite de presupuesto: {n} por ejecuci\u00f3n",
      sessionVerifyFailed: "No se pudo verificar tu sesi\u00f3n",
      sessionHelp: "Si esto sigue ocurriendo, revisa tu red o alg\u00fan bloqueador de anuncios.",
      devModeMock: "Modo desarrollo - usando datos simulados",
      signInTitlePrefix: "Inicia sesi\u00f3n en tu",
      signInTitleDashboard: "Panel de control",
      devSignInDesc: "Haz clic abajo para entrar al panel de control con datos de ejemplo y explorar la interfaz.",
      prodSignInDesc: "Monitorea tus agentes en la nube, revisa ejecuciones y gestiona eventos desde un solo lugar.",
      signingIn: "Iniciando sesi\u00f3n...",
      enterDemoDashboard: "Entrar al panel de demostraci\u00f3n",
      continueWithGoogle: "Continuar con Google",
      tryDemo: "Probar demo",
      devNoAuth: "No se requiere autenticaci\u00f3n en modo desarrollo",
      securedBySupabase: "Protegido por la autenticaci\u00f3n de Supabase",
      errorBoundaryFallback: "Esta vista sigue fallando. Actualiza la p\u00e1gina o contacta con soporte con el ID de error indicado arriba.",
      brandName: "Personas",
      connected: "Conectado",
      weekAbbr: "sem",
      disconnected: "Desconectado",
      totalLabel: "Total",
      agent: "Agente",
      connections: "Conexiones",
      eventAnimationPaused: "Animaci\u00f3n del flujo de eventos pausada (movimiento reducido)",
      node: "nodo",
      eventBus: "Bus de eventos",
      eventType: "Tipo de evento",
      timestamp: "Marca de tiempo",
      trafficVolume: "Volumen de tr\u00e1fico",
      samplePayload: "Payload de ejemplo",
      systemHealth: "Estado del sistema",
      health: "Estado",
      memoryInsights: "Perspectivas de memoria",
      suggestion: "sugerencia",
      suggestions: "sugerencias",
      dismissAction: "Descartar: {title}",
      allSuggestionsDismissed: "Todas las sugerencias fueron descartadas. Vuelve m\u00e1s tarde.",
      noDataAvailable: "A\u00fan no hay datos disponibles",
      errors: "Errores",
      totalLower: "total",
      copyPayload: "Copiar payload"
    },
    memoriesPage: {
      title: "Memorias",
      subtitle: "Patrones aprendidos que tus agentes aplican autom\u00e1ticamente",
      totalCount: "{n} memorias",
      filters: {
        all: "Todas",
        throttle: "Limitaci\u00f3n",
        schedule: "Programaci\u00f3n",
        alert: "Alerta",
        config: "Configuraci\u00f3n",
        routing: "Enrutamiento"
      },
      status: {
        active: "Activa",
        pending: "Pendiente",
        archived: "Archivada"
      },
      uses: "{n} usos",
      empty: "Ninguna memoria coincide con este filtro",
      seeAll: "Ver todas",
      conflicts: {
        count: "{n} conflictos",
        resolveButton: "Resolver conflictos",
        modalTitle: "Resolver {n} conflictos",
        modalSubtitle: "Acepta o rechaza cada uno para mantener consistente tu almac\u00e9n de memoria.",
        accept: "Aceptar",
        reject: "Rechazar",
        cancel: "Cancelar",
        apply: "Aplicar",
        allResolved: "Todos los conflictos resueltos",
        discardTitle: "\u00bfDescartar tus decisiones?",
        discardBody: "Has clasificado {n} conflictos. Cerrar ahora los descarta sin aplicarlos.",
        discardConfirm: "Descartar",
        discardKeep: "Seguir editando"
      }
    },
    knowledgePage: {
      viewSwitcherLabel: "Vistas de conocimiento",
      title: "Grafo de conocimiento",
      subtitle: "Patrones aprendidos de las ejecuciones de agentes",
      denseTable: "Tabla densa",
      graph: "Grafo",
      memories: "Memorias",
      type: "Tipo",
      patternKey: "Clave del patr\u00f3n",
      agent: "Agente",
      success: "\u00c9xito",
      successLower: "\u00e9xito",
      failures: "Fallos",
      failuresLower: "fallos",
      fails: "Fallos",
      rate: "Tasa",
      rateLower: "tasa",
      cost: "Coste",
      tokens: "Tokens",
      retries: "Reintentos",
      duration: "Duraci\u00f3n",
      confidence: "Confianza",
      lastSeen: "Visto por \u0102\u015fltima vez",
      nodes: "Nodos",
      agents: "Agentes",
      clusters: "Cl\u0102\u015fsteres",
      avgConfidence: "Conf. media",
      all: "Todo",
      agentLinks: "Enlaces de agentes",
      nodeSize: "Tama\u00f1o del nodo",
      confidenceLegend: "= confianza",
      low: "baja",
      high: "alta",
      patterns: "Patrones",
      avgCost: "Coste medio",
      clear: "Limpiar",
      noPatterns: "Ning\u00fan patr\u00f3n coincide con los filtros actuales",
      types: {
        tool_sequence: "Secuencia de herramientas",
        failure_pattern: "Patr\u00f3n de fallo",
        cost_quality: "Coste / calidad",
        model_performance: "Rendimiento del modelo",
        data_flow: "Flujo de datos"
      }
    },
    reviewsPage: {
      selectReview: "Seleccionar revisi\u00f3n",
      selectAllPending: "Seleccionar todas las revisiones pendientes",
      focus: {
        enter: "Modo enfoque",
        exit: "Salir",
        volume: "Volumen",
        skipTo: "Ir a",
        chapterHome: "Inicio",
        progress: "{n} de {total}",
        skip: "Saltar",
        empty: "Todo al d\u00eda \u2014 no hay revisiones pendientes",
        approve: "Aprobar",
        reject: "Rechazar"
      },
      parseError: {
        label: "Error de an\u00e1lisis",
        detail: "Payload mal formado \u2014 escalado a cr\u00edtico hasta ser revisado"
      }
    },
    leaderboardPage: {
      title: "Clasificaci\u00f3n",
      subtitle: "Ranking de flota por rendimiento compuesto",
      rank: "Puesto",
      composite: "Compuesto",
      delta: "Cambio",
      sortBy: "Ordenar por {field}",
      compare: "Comparar",
      versus: "vs",
      radarTitle: "Perfil de m\u00e9tricas",
      rankBy: "Clasificar por",
      overall: "General",
      metrics: {
        reliability: "Fiabilidad",
        cost: "Costo",
        tokens: "Tokens",
        retries: "Reintentos",
        speed: "Velocidad",
        quality: "Calidad",
        volume: "Volumen",
        skipTo: "Ir a",
        chapterHome: "Inicio"
      },
      trend: {
        up: "En alza",
        down: "En baja",
        flat: "Estable"
      }
    },
    slaPage: {
      title: "SLA",
      subtitle: "Objetivos de nivel de servicio, cumplimiento e historial de incumplimientos",
      compliance: "Cumplimiento",
      activeBreaches: "Incumplimientos activos",
      objectives: "Objetivos",
      target: "Objetivo",
      current: "Actual",
      timeInSla: "Tiempo dentro del SLA",
      targetFilter: {
        all: "Todos",
        atRisk: "En riesgo",
        healthy: "Saludable"
      },
      metricType: {
        availability: "Disponibilidad",
        latency: "Latencia p95",
        successRate: "Tasa de \u00e9xito"
      },
      severity: {
        minor: "Menor",
        major: "Mayor",
        critical: "Cr\u00edtico"
      },
      breachLog: {
        title: "Registro de incumplimientos",
        all: "Todas",
        started: "Inicio",
        resolved: "Resuelto",
        otherBreaches: "Otras infracciones de {persona}: {n}",
        timeToResolve: "Tiempo de resoluci\u00f3n",
        elapsed: "Transcurrido",
        empty: "No hay incumplimientos en los \u00faltimos 7 d\u00edas.",
        ongoing: "En curso",
        duration: "{n} min"
      }
    },
    incidentsPage: {
      title: "Incidentes",
      subtitle: "Incidentes del registro de auditor\u00eda en toda la flota",
      open: "Abiertos",
      total: "Total",
      bySeverity: "Por gravedad",
      bySource: "Por origen",
      incidents: "incidentes",
      groupByLabel: "Agrupar por",
      clearFilters: "Borrar filtros",
      allPersonas: "Todas las personas",
      statusLabel: "Estado",
      severity: {
        critical: "Cr\u00edtico",
        high: "Alto",
        medium: "Medio",
        low: "Bajo"
      },
      status: {
        all: "Todos",
        open: "Abierto",
        resolved: "Resuelto",
        ignored: "Ignorado",
        escalated: "Escalado"
      },
      source: {
        all: "Todos los or\u00edgenes",
        executions: "Ejecuciones",
        events: "Eventos",
        triggers: "Disparadores",
        vault: "B\u00f3veda",
        messages: "Mensajes",
        reviews: "Revisiones"
      },
      groupBy: {
        none: "Ninguno",
        agent: "Agente",
        severity: "Gravedad",
        source: "Origen"
      },
      badges: {
        circuitBreaker: "Cortacircuitos",
        autoFixed: "Corregido autom\u00e1ticamente"
      },
      detail: {
        recommendation: "Acci\u00f3n recomendada",
        source: "Origen",
        category: "Categor\u00eda",
        persona: "Agente",
        detected: "Detectado",
        resolved: "Resuelto",
        ongoing: "En curso"
      },
      empty: {
        title: "Sin incidentes",
        description: "La flota est\u00e1 en buen estado \u2014 no hay incidentes de auditor\u00eda registrados.",
        filteredTitle: "Sin incidentes coincidentes",
        filteredDescription: "Ning\u00fan incidente coincide con los filtros actuales."
      }
    },
    healthPage: {
      title: "Estado del sistema",
      subtitle: "Runtime, servicios, recursos e integraciones",
      sections: {
        runtime: "Tiempo de ejecuci\u00f3n",
        services: "Servicios",
        resources: "Recursos",
        integrations: "Integraciones"
      },
      status: {
        ok: "Correcto",
        warn: "Advertencia",
        error: "Error",
        info: "Informaci\u00f3n"
      },
      diskUsage: "Uso de disco",
      used: "usado",
      free: "libre",
      actions: {
        install: "Instalar",
        configure: "Configurar"
      },
      toast: {
        configured: "configurado (demo)",
        installed: "activado (demo)"
      }
    },
    messagesPage: {
      title: "Mensajes",
      subtitle: "Comentarios as\u00edncronos de cada persona en la flota",
      unread: "No le\u00eddo",
      read: "Le\u00eddo",
      empty: "No hay mensajes en esta p\u00e1gina.",
      expand: "Mostrar payload",
      collapse: "Ocultar payload",
      pagination: {
        prev: "Anterior",
        next: "Siguiente",
        page: "P\u00e1gina {n} de {total}"
      },
      markAllRead: "Marcar todo como le\u00eddo",
      viewThreads: "Hilos",
      viewList: "Lista",
      reply: "Respuesta"
    },
    observabilityPage: {
      usageInsight: "{top} se usa {ratio} veces m\u00e1s que {second}, lo que la convierte en tu integraci\u00f3n de herramientas m\u00e1s utilizada.",
      title: "Observabilidad",
      subtitle: "M\u00e9tricas de rendimiento, seguimiento de costos y uso de herramientas",
      tabPerformance: "Rendimiento",
      tabUsage: "Uso de herramientas",
      tabActivity: "Actividad",
      circuitBreaker: "Cortacircuitos",
      autoFixed: "Corregido autom?ticamente",
      resolved: "Resuelto",
      autoFixApplied: "Correcci?n autom?tica aplicada",
      costAnomalyDetected: "Anomal?a de coste detectada el",
      budgetThresholdExceeded: "Umbral de presupuesto superado para",
      totalCost: "Coste total",
      executions: "Ejecuciones",
      successRate: "Tasa de ?xito",
      activePersonas: "Personas activas",
      costOverTime: "Coste en el tiempo",
      previousPeriod: "vs periodo anterior",
      executionHealth: "Salud de ejecuci?n",
      latencyDistribution: "Distribuci?n de latencia",
      latencyPercentiles: "P50 / P95 / P99",
      spendByAgent: "Gasto por agente",
      noSpendData: "Sin datos de gasto",
      healthIssues: "Problemas de salud",
      open: "abiertos",
      analyzing: "Analizando...",
      runAnalysis: "Ejecutar an?lisis",
      runningAnalysis: "Ejecutando an?lisis de salud en todos los servicios monitorizados...",
      allSystemsHealthy: "Todos los sistemas est?n sanos",
      noIssuesDetected: "No se detectaron problemas en los servicios monitorizados",
      noSeverityIssues: "Sin problemas de severidad {severity}",
      exampleDataNotice: "Se muestran datos de ejemplo. Las anal?ticas reales aparecer?n cuando los agentes empiecen a ejecutar tareas.",
      toolInvocations: "Invocaciones de herramientas",
      distribution: "Distribuci?n",
      usageOverTime: "Uso en el tiempo",
      last14Days: "?ltimos 14 d?as",
      toolUsageByAgent: "Uso de herramientas por agente",
      other: "Otros",
      athenaUsage: "Uso de Athena",
      athenaSubtitle: "Costo del Companion por acci\u00f3n",
      athenaActions: {
        invoke: "Invocar",
        recall: "Recuperar",
        fallback: "Reserva"
      },
      valueRollup: "Resumen de valor",
      valueDelivered: "Valor entregado",
      costPerValue: "Costo por valor",
      outcomes: {
        delivered: "Entregado",
        partial: "Parcial",
        blocked: "Bloqueado"
      },
      severity: {
        all: "todo",
        critical: "cr?tico",
        high: "alto",
        medium: "medio",
        low: "bajo"
      }
    },
    agentsPage: {
      statusLive: "Activo",
      statusOff: "Apagado",
      title: "Agentes",
      noAgents: "No hay agentes desplegados",
      noAgentsDesc: "Implementa tu primer agente desde la aplicaci\u00f3n de escritorio Personas y luego vuelve aqu\u00ed para monitorearlo.",
      agentDeployed: "agente desplegado",
      agentsDeployed: "agentes desplegados",
      manualExecution: "Ejecuci\u00f3n manual desde el panel",
      maxConcurrent: "m?x.",
      timeoutSeconds: "timeout {n}s",
      budget: "presupuesto",
      execute: "Ejecutar",
      executing: "Ejecutando\u2026",
      executeQueued: "Ejecuci\u00f3n en cola para {name}",
      executeFailed: "No se pudo iniciar {name}",
      details: "Detalles"
    },
    executionsPage: {
      title: "Ejecuciones",
      all: "Todas",
      active: "Activas",
      completed: "Completadas",
      failed: "Fallidas",
      cancelled: "Canceladas",
      agent: "Agente",
      duration: "Duraci\u00f3n",
      cost: "Costo",
      tokens: "Tokens",
      retries: "Reintentos",
      started: "Iniciado",
      noExecutions: "A\u00fan no hay ejecuciones",
      noExecutionsDesc: "Ejecuta un agente para ver resultados aqu\u00ed",
      waitingForWorker: "Esperando worker...",
      noOutputYet: "A\u00fan sin resultados",
      noFilteredActive: "No hay ejecuciones activas en esta vista",
      noFilteredCompleted: "No hay ejecuciones completadas en esta vista",
      noFilteredFailed: "No hay ejecuciones fallidas en esta vista",
      noFilteredCancelled: "No hay ejecuciones canceladas en esta vista",
      filteredEmptyDesc: "Existen otras ejecuciones, pero ninguna coincide con este filtro.",
      showAllExecutions: "Mostrar todas"
    },
    eventsPage: {
      title: "Eventos",
      subtitle: "Actividad del bus de eventos en todos los agentes",
      tabEvents: "Eventos",
      tabSubscriptions: "Suscripciones",
      tabVisualization: "Visualizaci\u00f3n",
      tabSwimlane: "L\u00ednea de tiempo",
      event: "Evento",
      source: "Origen",
      time: "Hora",
      id: "ID",
      sourceLabel: "Origen",
      processed: "Procesado",
      retry: "Reintentar",
      selectForBulkRetry: "Seleccionar para reintento masivo",
      showRelatedEvents: "Mostrar {count} eventos relacionados",
      retriedCount: "Reintentado {count} vez",
      retryEvent: "Reintentar evento",
      searchPlaceholder: "Buscar payloads, tipos de evento, or?genes, errores...",
      clearSearch: "Limpiar b?squeda",
      eventType: "Tipo de evento",
      sourceType: "Tipo de origen",
      clearFilters: "Borrar filtros",
      chain: "Cadena",
      events: "eventos",
      result: "resultado",
      results: "resultados",
      noDeadLetters: "Sin dead letters",
      noDeadLettersDescription: "Los eventos fallidos con errores aparecer?n aqu? para reintento",
      noMatchingEvents: "No hay eventos coincidentes",
      noEvents: "No hay eventos",
      noMatchingEventsDescription: "Prueba a ajustar la b?squeda o los filtros",
      noEventsDescription: "Los eventos aparecer?n aqu? cuando los agentes procesen disparadores y suscripciones",
      loadMore: "Cargar m?s eventos",
      failedEventSelected: "evento fallido seleccionado",
      failedEventsSelected: "eventos fallidos seleccionados",
      selectAllFailed: "Seleccionar todos los fallidos",
      retryAll: "Reintentar todos",
      active: "Activo",
      disabled: "Desactivado",
      created: "Creado",
      match: "coincidencia",
      matches: "coincidencias",
      deleteSubscription: "Eliminar suscripci\u00f3n",
      unknownAgent: "Agente desconocido",
      disableSubscription: "Desactivar suscripci\u00f3n",
      enableSubscription: "Activar suscripci\u00f3n",
      createSubscription: "Crear suscripci\u00f3n",
      persona: "Persona",
      selectPersona: "Selecciona una persona...",
      selectEventType: "Selecciona un tipo de evento...",
      sourceFilter: "Filtro de origen",
      optional: "opcional",
      sourceFilterPlaceholder: "p. ej. github, pagerduty...",
      create: "Crear",
      newSubscription: "Nueva suscripci\u00f3n",
      noMatchingSubscriptions: "No hay suscripciones coincidentes",
      noSubscriptions: "No hay suscripciones",
      noSubscriptionsDescription: "Crea suscripciones para dirigir eventos a tus agentes",
      swimlane: {
        title: "Carriles de eventos",
        subtitle: "Traza de eventos por persona ordenada en el tiempo",
        empty: "No hay eventos en la ventana seleccionada"
      },
      connectionStatus: {
        connected: "Tiempo real: conectado",
        reconnecting: "Reconectando al flujo de eventos\u2026",
        polling: "Consultando actualizaciones (con retraso)"
      }
    },
    settingsPage: {
      title: "Configuraci\u00f3n",
      subtitle: "Configuraci\u00f3n de cuenta y conexi\u00f3n a la nube",
      account: "Cuenta",
      cloudConnection: "Conexi\u00f3n a la Nube",
      orchestrator: "Orquestador",
      notConfigured: "No configurado",
      totalWorkers: "Workers Totales",
      queueLength: "Longitud de Cola",
      activeExecutions: "Ejecuciones Activas",
      notifications: {
        title: "Notificaciones",
        subtitle: "Alertas de auto-reparaci\u00f3n y res\u00famenes",
        weeklyDigest: "Resumen semanal de estado",
        voice: {
          label: "Anunciar nuevas revisiones en voz alta",
          preview: "Vista previa",
          newReviewRequest: "Nueva solicitud de revisi\u00f3n",
          announcement: "Nueva revisi\u00f3n {severity} de {persona}",
          unknownPersona: "un agente",
          severity: {
            critical: "cr\u00edtica",
            warning: "de advertencia",
            info: "informativa"
          }
        },
        severity: {
          critical: "Cr\u00edtico",
          high: "Alto",
          medium: "Medio",
          low: "Bajo"
        }
      },
      providers: {
        title: "Proveedores de modelos",
        subtitle: "Qu\u00e9 modelos pueden usar tus agentes",
        allowed: "Permitido",
        requests: "solicitudes"
      },
      rotation: {
        title: "Rotaci\u00f3n de credenciales",
        subtitle: "Estado de rotaci\u00f3n de la b\u00f3veda",
        hasPolicy: "Pol\u00edtica",
        noPolicy: "Sin pol\u00edtica",
        auto: "Autom\u00e1tico",
        manual: "Manual",
        anomaly: "Anomal\u00eda",
        next: "Pr\u00f3xima",
        overdue: "Vencida"
      }
    },
    legalPage: {
      title: "Legal",
      heading: "P\u00e1ginas legales pr\u00f3ximamente",
      description: "Nuestra pol\u00edtica de privacidad y t\u00e9rminos de servicio est\u00e1n siendo finalizados. Mientras tanto, si tienes alguna pregunta no dudes en contactarnos."
    },
    waitlist: {
      title: "Unirse a la Lista de Espera",
      subtitle: "S\u00e9 el primero en saber cu\u00e1ndo lancemos para",
      emailPlaceholder: "Ingresa tu email",
      earlyBeta: "Quiero acceso anticipado a la beta",
      submit: "Unirse a la Lista",
      joining: "Uni\u00e9ndose...",
      success: "\u00a1Est\u00e1s en la lista!",
      successDesc: "Te avisaremos en cuanto la versi\u00f3n est\u00e9 lista.",
      duplicate: "Ya registrado",
      duplicateDesc: "Ya est\u00e1s en la lista de espera. Te avisaremos cuando est\u00e9 lista.",
      shareTitle: "Comparte con amigos",
      copied: "\u00a1Copiado!",
      copyLink: "Copiar enlace",
      peopleWaiting: "personas esperando",
      errorGeneric: "Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo."
    },
    templatesPage: {
      title: "Plantillas de agentes",
      subtitle: "Explora {count} plantillas de agentes predefinidas agrupadas por el tipo de trabajo que realizan. Elige una categor\u00eda para ver las plantillas dentro.",
      gridHeading: "Explora plantillas por categor\u00eda",
      gridDescription: "Las plantillas son Personas preconfiguradas que puedes adoptar con un clic. Cada plantilla ya tiene el prompt, las herramientas y los disparadores configurados para una tarea espec\u00edfica \u2014 no requiere configuraci\u00f3n adicional.",
      changeCategory: "Cambiar categor\u00eda",
      complexityAll: "Todas",
      complexityBasic: "B\u00e1sico",
      complexityProfessional: "Profesional",
      complexityEnterprise: "Empresarial",
      searchPlaceholder: "Busca plantillas, herramientas, servicios...",
      searchAriaLabel: "Buscar plantillas",
      showingCount: "Mostrando {shown} de {total} plantillas",
      noMatches: "Ninguna plantilla coincide con tus filtros",
      clearFilters: "Limpiar filtros",
      viewDetails: "Ver detalles",
      filterByComplexity: "Filtrar por complejidad",
      backToTemplates: "Volver a plantillas",
      keyBenefits: "Beneficios clave",
      triggers: "Disparadores",
      services: "Servicios",
      configuration: "Configuraci?n",
      copied: "Copiado",
      copy: "Copiar",
      copyFailed: "Error al copiar",
      copyConfiguration: "Copiar configuraci?n",
      getStartedTitle: "Empieza con esta plantilla",
      getStartedDescription: "Importa esta plantilla directamente en Personas o copia la configuraci?n para personalizarla t? mismo.",
      openInPersonas: "Abrir en Personas",
      moreTemplates: "M?s plantillas de {category}",
      appNotFoundTitle: "Aplicaci?n Personas no encontrada",
      appNotFoundDescription: "Parece que Personas a?n no est? instalado en tu dispositivo. Desc?rgalo para importar plantillas directamente o copia la configuraci?n para configurarla manualmente.",
      templateNotFound: "Plantilla no encontrada",
      templateNotFoundDescription: "Esta plantilla no existe o se ha retirado. Explora la galer?a para ver la colecci?n actual.",
      browseTemplates: "Explorar plantillas",
      backToHome: "Volver al inicio",
      customTrigger: "Disparador personalizado"
    },
    roadmapSection: {
      inProgress: "En Progreso",
      next: "Siguiente",
      planned: "Planificado",
      completed: "Completado",
      empty: "No hay nada planeado por ahora.",
      emptyHint: "Vuelve pronto \u2014 los pr\u00f3ximos hitos aparecer\u00e1n aqu\u00ed a medida que los planifiquemos.",
      heading: "Hoja de ruta del",
      gradient: "producto",
      description: "D\u00f3nde se encuentra hoy cada \u00e1rea de Personas: cumplimiento de izquierda a derecha, no promesas de arriba abajo.",
      progress: {
        phasesComplete: "{completed} de {total} fases completadas",
        noneDone: "A\u00fan no hay fases completadas",
        firstDone: "Fase 1 completada",
        rangeDone: "Fases 1-{count} completadas",
        toGoOne: "Queda {count} fase",
        toGoOther: "Quedan {count} fases"
      },
      areas: {
        i18n: {
          title: "Internacionalizaci\u00f3n",
          caption: "{count} idiomas, traducidos a mano: cada bandera se revela con la cobertura"
        },
        devices: {
          title: "Compatibilidad de dispositivos",
          caption: "Personas en cada equipo que tienes"
        },
        collaboration: {
          title: "Colaboraci\u00f3n",
          caption: "De un solo operador a toda la organizaci\u00f3n"
        },
        platform: {
          title: "Plataforma principal",
          caption: "Modo dev, ejecuci\u00f3n en la nube, conectores, instalaciones sencillas"
        },
        templates: {
          title: "Galer\u00eda de plantillas",
          caption: "Agentes iniciales por categor\u00eda: recuentos en vivo de la galer\u00eda"
        }
      },
      bars: {
        europe: "Europa",
        asiaPacific: "Asia-Pac\u00edfico",
        southAsia: "Asia del Sur",
        middleEast: "Oriente Medio \u00b7 RTL",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        web: "Web",
        mobileCompanion: "App m\u00f3vil complementaria",
        solo: "Individual",
        team: "Equipo",
        enterprise: "Empresa",
        devMode: "Modo dev",
        connectors: "Conectores",
        cloudExecution: "Ejecuci\u00f3n en la nube",
        installersUpdates: "Instaladores y actualizaciones",
        allCategories: "Todas las categor\u00edas",
        devops: "DevOps",
        productivity: "Productividad",
        communication: "Comunicaci\u00f3n",
        marketing: "Marketing",
        research: "Investigaci\u00f3n",
        security: "Seguridad",
        financeCluster: "Finanzas \u00b7 Ventas \u00b7 Soporte \u00b7 Legal"
      },
      detail: {
        localeOne: "{n} idioma",
        localeOther: "{n} idiomas",
        shipped: "disponible",
        inDevelopment: "en desarrollo",
        thisSite: "este sitio",
        preview: "vista previa",
        sharedAgents: "agentes compartidos",
        ssoAudit: "SSO \u00b7 auditor\u00eda",
        instantPreview: "vista previa instant\u00e1nea",
        services: "{n} servicios",
        runs247: "ejecuci\u00f3n 24/7",
        autoUpdate: "actualizaci\u00f3n autom\u00e1tica",
        templatesTotal: "{n} / {total} plantillas"
      },
      barAria: "{label}: {pct}%"
    },
    featureVoting: {
      eyebrow: "Comunidad",
      heading: "Vota por",
      headingGradient: "lo que viene",
      subheading: "Ay\u00fadanos a priorizar. Elige las funciones que m\u00e1s te importan y da forma al futuro de Personas.",
      features: {
        macos: {
          title: "Compatibilidad con macOS",
          description: "Compilaci\u00f3n de macOS totalmente nativa con optimizaci\u00f3n para Apple Silicon, integraci\u00f3n con Spotlight y controles de agentes desde la barra de men\u00fas."
        },
        i18n: {
          title: "Internacionalizaci\u00f3n",
          description: "Instrucciones de agentes multiling\u00fces, interfaz localizada y programaci\u00f3n adaptada a la regi\u00f3n para equipos de todo el mundo."
        },
        dashboard: {
          title: "Panel web",
          description: "Panel basado en navegador para la supervisi\u00f3n de agentes en tiempo real, el historial de ejecuci\u00f3n y la gesti\u00f3n de flotas desde cualquier dispositivo."
        },
        enterprise: {
          title: "Proyectos empresariales",
          description: "Espacios de trabajo multiinquilino, RBAC, registros de auditor\u00eda, integraci\u00f3n con SSO y plantillas de agentes compartidas en toda tu organizaci\u00f3n."
        }
      },
      voteAria: "Votar por {feature}",
      commentsToggleAria: "Mostrar comentarios de {feature}",
      discussion: "Debate",
      noComments: "A\u00fan no hay comentarios. S\u00e9 el primero en compartir tu opini\u00f3n.",
      replying: "Respondiendo",
      reply: "Responder",
      addCommentPlaceholder: "A\u00f1adir un comentario...",
      writeReplyPlaceholder: "Escribir una respuesta...",
      sendCommentAria: "Enviar comentario",
      summary: {
        totalVotes: "{count} votos en total",
        commentOne: "{count} comentario",
        commentOther: "{count} comentarios",
        boostOne: "{count} impulso",
        boostOther: "{count} impulsos",
        live: "En vivo"
      },
      boost: {
        label: "Impulsar",
        toggleAria: "Impulsar {feature}",
        tierAria: "Impulsar con {amount}"
      },
      request: {
        title: "\u00bfTienes otra idea?",
        subtitle: "Sugerir una funci\u00f3n",
        placeholder: "Describe la funci\u00f3n que te gustar\u00eda ver...",
        submitAria: "Enviar sugerencia",
        success: "\u00a1Gracias! Tu sugerencia ha sido registrada.",
        errorNetwork: "Error de red: comprueba tu conexi\u00f3n e int\u00e9ntalo de nuevo.",
        errorRateLimit: "Est\u00e1s enviando sugerencias demasiado r\u00e1pido. Espera un momento.",
        errorInvalid: "Introduce una sugerencia v\u00e1lida (1\u20131000 caracteres).",
        errorGeneric: "Algo sali\u00f3 mal al guardar tu sugerencia. Int\u00e9ntalo de nuevo.",
        sponsor: "Patrocinar esta solicitud"
      },
      timeAgo: {
        justNow: "ahora mismo",
        minutes: "hace {n} min",
        hours: "hace {n} h",
        days: "hace {n} d"
      }
    },
    eventBusSection: {
      dynamicSwarm: "Enjambre Din\u00e1mico",
      latencyLanes: "Carriles de Latencia",
      ephemeralConnections: "Conexiones ef\u00edmeras",
      queueDepth: "Profundidad de cola + rendimiento"
    },
    guide: {
      title: "Usuario",
      subtitle: "Todo lo que necesitas saber sobre Personas \u2014 desde tu primer agente hasta canalizaciones multiagente avanzadas.",
      searchPlaceholder: "Buscar en 100+ temas...",
      searchInCategory: "Buscar en esta categor\u00eda...",
      topics: "temas",
      backToGuide: "Volver a la gu\u00eda",
      showAllResults: "Mostrar todos los resultados",
      noResults: "No se encontraron temas. Prueba con otro t\u00e9rmino de b\u00fasqueda.",
      stillQuestions: "\u00c2\u017cA\u0102\u015fn tienes preguntas?",
      joinDiscord: "\u00danete a nuestro Discord",
      copyAnchor: "Copiar enlace a la secci\u00f3n",
      categories: {
        "getting-started": "Primeros Pasos",
        "agents-prompts": "Agentes y Prompts",
        triggers: "Disparadores y programaci\u00f3n",
        credentials: "Credenciales y Seguridad",
        pipelines: "Pipelines y Equipos",
        testing: "Pruebas y optimizaci\u00f3n",
        memories: "Memorias y Conocimiento",
        monitoring: "Monitoreo y Costos",
        deployment: "Despliegue e Integraciones",
        troubleshooting: "Soluci\u00f3n de problemas"
      },
      categoryDescriptions: {
        "getting-started": "Instala Personas, crea tu primer agente y aprende lo b\u00e1sico en menos de 10 minutos.",
        credentials: "Con\u00e9ctate a servicios de forma segura. Entiende la b\u00f3veda cifrada y c\u00f3mo tus datos se mantienen seguros.",
        "agents-prompts": "Crea, configura y ajusta tus agentes de IA. Domina los modos de prompt simple y estructurado.",
        triggers: "Configura cu\u00e1ndo y c\u00f3mo se ejecutan tus agentes \u2014 programaciones, webhooks, vigilancia de archivos y m\u00e1s.",
        pipelines: "Conecta agentes en pipelines visuales. Construye flujos de trabajo multi-agente en el canvas de equipo.",
        memories: "Tus agentes aprenden y recuerdan. Gestiona lo que saben y c\u00f3mo usan la experiencia pasada.",
        monitoring: "Sigue cada ejecuci\u00f3n en tiempo real. Observa qu\u00e9 hacen tus agentes, c\u00f3mo rinden y cu\u00e1nto cuestan.",
        testing: "Ejecuta pruebas de arena, comparaciones A/B y deja que el sistema Genome evolucione tus mejores prompts.",
        deployment: "Implementa agentes en la nube, con\u00e9ctate a GitHub Actions, GitLab CI y flujos de n8n.",
        troubleshooting: "Soluciona problemas comunes, comprende los mensajes de error y pon a tus agentes de nuevo en marcha."
      }
    },
    featurePages: {
      orchestration: {
        headline: "Agentes que trabajan juntos",
        description: "Crea canalizaciones visuales donde varios agentes colaboran en tareas complejas. La salida de un agente alimenta al siguiente \u2014 sin c\u00f3digo de conexi\u00f3n, sin pasos manuales, sin l\u00edmites en lo que puedes orquestar.",
        cta: "Construye tu primer pipeline"
      },
      security: {
        headline: "Tus secretos son solo tuyos",
        description: "Cada contrase\u00f1a, clave de API y token de acceso se cifra en tu dispositivo con cifrado AES-256 de nivel bancario. Tus credenciales se almacenan en la propia b\u00f3veda segura de tu sistema operativo \u2014 nunca se env\u00edan a la nube.",
        cta: "Asegura tus conexiones"
      },
      "multi-provider": {
        headline: "Sin ataduras a una sola IA",
        description: "Usa Claude, OpenAI, Gemini o ejecuta modelos localmente con Ollama. Cambia de proveedor libremente, asigna diferentes modelos a diferentes agentes y, si un proveedor falla, tus agentes cambian autom\u00e1ticamente a otro.",
        cta: "Elige tu IA"
      },
      genome: {
        headline: "Tus agentes se vuelven m\u00e1s inteligentes autom\u00e1ticamente",
        description: "En lugar de ajustar manualmente los prompts durante horas, deja que el sistema Genome lo haga por ti. Prueba variaciones, conserva lo que funciona y descarta el resto \u2014 como la selecci\u00f3n natural para tus agentes de IA.",
        cta: "Evoluciona tus agentes"
      }
    },
    blogPage: {
      eyebrow: "Blog",
      heading: "Novedades e",
      headingGradient: "ideas",
      description: "Anuncios de producto, an?lisis t?cnicos, tutoriales y casos de uso reales del equipo de Personas.",
      searchPlaceholder: "Buscar publicaciones...",
      searchAriaLabel: "Buscar publicaciones del blog",
      clearSearch: "Limpiar b?squeda",
      showing: "Mostrando",
      of: "de",
      posts: "publicaciones",
      noMatches: "Ninguna publicaci?n coincide con tu b?squeda",
      clearFilters: "Borrar todos los filtros",
      allPosts: "Todas las publicaciones",
      featured: "Destacado",
      min: "min",
      minRead: "min de lectura",
      read: "Leer",
      readArticle: "Leer art?culo",
      article: "Art?culo",
      backToBlog: "Volver al blog",
      published: "Publicado",
      continueExploring: "Seguir explorando",
      seeItInAction: "Verlo en acci?n",
      browseTemplates: "Explorar plantillas",
      postNotFound: "Publicaci?n no encontrada",
      postNotFoundDescription: "No encontramos el art?culo que buscas. Puede que se haya renombrado o movido.",
      browseAllPosts: "Ver todas las publicaciones",
      backToHome: "Volver al inicio"
    },
    accessibility: {
      changeLanguage: "Cambiar idioma",
      selectLanguage: "Seleccionar idioma",
      selectTheme: "Seleccionar tema: {name}"
    },
    pageNav: {
      onThisPage: "En esta p\u00e1gina",
      closeMenu: "Cerrar men\u00fa"
    },
    themes: {
      midnight: "Medianoche",
      cyan: "Cian",
      bronze: "Bronce",
      frost: "Escarcha",
      purple: "P\u0102\u015frpura",
      pink: "Rosa",
      red: "Rojo",
      matrix: "Matrix",
      light: "Claro",
      ice: "Hielo",
      news: "Noticias"
    },
    themeDescriptions: {
      midnight: "Tema oscuro azul marino",
      cyan: "Tema oscuro con acento turquesa",
      bronze: "Tema oscuro \u00e1mbar c\u00e1lido",
      frost: "Tema oscuro plateado fr\u00edo",
      purple: "Tema oscuro con acento violeta",
      pink: "Tema oscuro con acento magenta",
      red: "Tema oscuro con acento carmes\u00ed",
      matrix: "Tema oscuro verde ne\u00f3n",
      light: "Tema claro cl\u00e1sico",
      ice: "Tema claro azul fr\u00edo",
      news: "Tema claro de alto contraste"
    },
    tour: {
      launch: "Iniciar el recorrido",
      play: "Reproducir",
      pause: "Pausar",
      next: "Paso siguiente",
      previous: "Paso anterior",
      exit: "Salir del recorrido",
      volume: "Volumen",
      skipTo: "Ir a",
      chapterHome: "Inicio",
      begin: "Empezar",
      skip: "Saltar",
      introTitle: "Conoce a Athena, tu gu\u00eda",
      introBody: "Athena te guiar\u00e1 por Personas en aproximadamente un minuto \u2014 qu\u00e9 es una persona, c\u00f3mo funciona y c\u00f3mo empezar. Pausa, omite o repite cualquier paso.",
      bridgePrompt: "Eso es Personas de un vistazo. \u00bfQuieres profundizar y ver c\u00f3mo funciona realmente cada pieza, funci\u00f3n por funci\u00f3n?",
      bridgeConfirm: "Mu\u00e9strame las funciones",
      bridgeDismiss: "Quiz\u00e1s m\u00e1s tarde",
      bridgeToDashboardPrompt: "Ahora ve Personas en acci\u00f3n \u2014 prueba el panel de demostraci\u00f3n.",
      bridgeToDashboardConfirm: "Abrir el panel",
      step1: "Conoce a una persona \u2014 un \u00fanico agente de IA con una identidad estable y un conjunto de habilidades combinables. Dale las herramientas que necesita, desde Gmail y Slack hasta GitHub y tu calendario, y aprende a actuar en todas ellas. Una persona, muchas tareas, todo trabajando en conjunto.",
      step2: "Ahora dale a esa persona un objetivo en lenguaje natural, como \"tr\u00eda mi Gmail\". Observa c\u00f3mo trabaja su mente en tiempo real: lee la petici\u00f3n, la divide en pasos y planifica su enfoque antes de tocar nada. Luego ejecuta \u2014 y te muestra cada movimiento a medida que avanza.",
      step3: "Un agente solo es tan \u00fatil como los momentos para los que despierta. Personas puede activarse de diez maneras \u2014 seg\u00fan una programaci\u00f3n, por un evento, sondeando una fuente o desde un webhook entrante. El orquestador dirige cada se\u00f1al al agente correcto y mantiene todo en marcha, autorrepar\u00e1ndose si un paso falla alguna vez.",
      step4: "Todo esto se apoya en una plataforma dise\u00f1ada para la confianza y la escala. Una b\u00f3veda cifrada protege tus credenciales, las plantillas listas te ponen en marcha r\u00e1pido y \"trae tu propio modelo\" te mantiene al control de la IA. La monitorizaci\u00f3n en vivo, un laboratorio de experimentaci\u00f3n y la orquestaci\u00f3n de equipos lo completan \u2014 seis pilares, un solo lugar.",
      step5: "\u00bfListo para poner a trabajar a una persona? Personas se ejecuta en tu propia m\u00e1quina a trav\u00e9s de Claude Code \u2014 la herramienta de l\u00ednea de comandos de Anthropic \u2014 as\u00ed que mantienes tu privacidad y control. Descarga el instalador para Windows 11, conecta el CLI y tu primer agente estar\u00e1 activo en minutos.",
      features1: "Cada agente nace de una sola frase de intenci\u00f3n. Personas lee lo que quieres y llena una matriz de persona de ocho dimensiones \u2014 tareas, memoria, disparadores, revisi\u00f3n y m\u00e1s \u2014 y solo te pregunta cuando de verdad necesita una decisi\u00f3n. En segundos, una idea vaga se convierte en un agente estructurado y ejecutable.",
      features2: "Luego empieza a aprender. Cada tarea que ejecuta deja un rastro, y las lecciones que importan ascienden a sus capas de memoria mientras el ruido se asienta abajo. Cuanto m\u00e1s trabaja tu agente, m\u00e1s afinado y consciente del contexto se vuelve.",
      features3: "El trabajo real falla a veces, por eso Personas est\u00e1 dise\u00f1ado para recuperarse. Cuando un paso falla, el circuito no se detiene \u2014 diagnostica qu\u00e9 sali\u00f3 mal, repara la ruta y reintenta por s\u00ed solo. Sin alertas a las 3 a.m., sin reinicios manuales; el flujo de trabajo simplemente sigue avanzando.",
      features4: "Y nunca pierdes de vista nada de esto. Cada ejecuci\u00f3n, mensaje, evento y memoria fluye en vivo por un \u00fanico panel de observabilidad \u2014 minigr\u00e1ficos, costes y estado, todo en tiempo real. Transparencia total, cero configuraci\u00f3n.",
      features5: "Los buenos agentes rara vez aciertan a la primera, por eso el Lab es donde los perfeccionas. Chatea con una persona para entrenarla, enfrenta dos versiones en la arena, evoluci\u00f3nala a trav\u00e9s de generaciones o calif\u00edcala en las dimensiones que importan. Cada mejora que conservas queda versionada y es reversible.",
      features6: "Personas incluye seis plugins especializados, cada uno un espacio de trabajo aut\u00f3nomo que tus agentes pueden manejar. Mira Dev Tools: convierte a una persona en un compa\u00f1ero de programaci\u00f3n que ejecuta tareas, lee la salida e itera. Cambia de pesta\u00f1a y conoces a otro especialista \u2014 todos comparten las mismas credenciales y memoria.",
      dashboardHome: "Bienvenido al centro de control: toda tu flota en una sola pantalla. Arriba, los signos vitales: tasa de \u00e9xito, ejecuciones en curso, agentes activos, alertas abiertas y revisiones que te esperan. Debajo, el optimizador muestra una mejora de alto impacto a la vez \u2014 ahora mismo, un cambio de enrutamiento que recorta costes sin tocar la calidad. Los dos paneles inferiores siguen la salud de cada agente y los nuevos recuerdos que han aprendido y quieren promover. Luego la imagen en vivo: cada ejecuci\u00f3n seg\u00fan llega a la izquierda, catorce d\u00edas de tr\u00e1fico y errores a la derecha. El mapa de calor muestra las ejecuciones por agente, d\u00eda a d\u00eda, y la fila inferior lo completa: tus mejores agentes, las pr\u00f3ximas rutinas programadas y cada rotaci\u00f3n de credenciales. Una p\u00e1gina, toda la operaci\u00f3n.",
      dashboardAgents: "Esta es tu plantilla. Cada tarjeta es una persona: un \u00fanico agente con una identidad y un conjunto de habilidades que puede combinar. El retrato se genera para reflejar su car\u00e1cter; debajo, las estad\u00edsticas en vivo: tasa de \u00e9xito, ejecuciones y gasto. Pulsa Ejecutar para lanzar uno bajo demanda, o abre Detalles para inspeccionar su configuraci\u00f3n e historial reciente. Cinco agentes aqu\u00ed, cada uno haciendo bien su \u00fanica tarea.",
      dashboardExecutions: "Cada ejecuci\u00f3n que la flota ha realizado vive aqu\u00ed, la m\u00e1s reciente primero. La tabla muestra la persona, el estado, la duraci\u00f3n, el costo y cu\u00e1ndo empez\u00f3 \u2014 filtra solo los fallos, o los que a\u00fan se est\u00e1n ejecutando. Haz clic en cualquier fila y se abre la ejecuci\u00f3n completa: una franja de m\u00e9tricas, cualquier explicaci\u00f3n de error y la salida en vivo transmiti\u00e9ndose l\u00ednea por l\u00ednea, tal como el agente la produjo.",
      dashboardEvents: "Los agentes no trabajan de forma aislada: reaccionan a eventos. Este es el bus de eventos: cada se\u00f1al que fluye por el sistema, desde programaciones y webhooks hasta mensajes entre agentes. Cada fila muestra el tipo de evento, su origen, el estado y hace cu\u00e1nto se dispar\u00f3. Los eventos fallidos pueden reintentarse en el momento, y los eventos relacionados se encadenan para que sigas una sola cascada de principio a fin.",
      dashboardReviews: "Algunas decisiones necesitan a una persona. Cuando un agente se topa con algo que no deber\u00eda decidir solo, se detiene y deriva el caso aqu\u00ed. Cada elemento lleva la persona, el contexto y la acci\u00f3n que propone \u2014 apru\u00e9balo, rech\u00e1zalo u om\u00edtelo para m\u00e1s tarde, con un clic o con el teclado. Nada arriesgado se publica sin tu visto bueno, y la cola mantiene en marcha al resto de la flota mientras decides.",
      roadmap1: "Aqu\u00ed es donde estamos ahora: cada fase de la hoja de ruta se califica seg\u00fan su estado a medida que se lanza.",
      roadmap2: "Lo que viene despu\u00e9s depende de ti \u2014 vota por las funciones que m\u00e1s quieres, y las mejores ideas dan forma a lo que construimos.",
      roadmap3: "Y aqu\u00ed est\u00e1 todo lo ya lanzado \u2014 cada versi\u00f3n ordenada, la m\u00e1s reciente primero."
    },
    playgroundPage: {
      heroHeading: "Mira los agentes en",
      heroHeadingGradient: "acci\u00f3n",
      heroDescription: "Elige una tarea a continuaci\u00f3n y observa c\u00f3mo un agente de Personas la descompone, selecciona las herramientas adecuadas y entrega resultados \u2014 todo en segundos.",
      ctaTitle: "\u00bfListo para crear tus propios agentes?",
      ctaDescription: "Descarga Personas y crea agentes aut\u00f3nomos que se conecten a tus herramientas, sigan tus reglas y funcionen seg\u00fan tu horario.",
      ctaDownload: "Descargar Personas",
      ctaBrowseTemplates: "Explorar plantillas",
      selectTask: "Selecciona una tarea arriba para iniciar la simulaci\u00f3n",
      simulatedExecution: "Ejecuci\u00f3n simulada",
      statusExecuting: "ejecutando\u2026",
      statusComplete: "completado",
      statusReady: "listo",
      chromeTitle: "agent-playground \u2014 en vivo",
      reset: "Restablecer"
    }
  };
