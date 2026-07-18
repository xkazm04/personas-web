import type { Translations } from './en';

export const fr: Translations = {
    notFound: {
      title: "Page introuvable",
      description: "La page que vous recherchez n'existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e. Essayez plut\u00f4t l'une de ces options :",
      home: "Accueil",
      getStarted: "Commencer",
      backToHome: "Retour \u00e0 l'accueil"
    },
    errorPage: {
      title: "Cette page a rencontr\u00e9 un probl\u00e8me inattendu",
      description: "Une erreur s'est produite lors du chargement de cette page. Notre \u00e9quipe a \u00e9t\u00e9 notifi\u00e9e \u2014 r\u00e9essayez, ou retournez \u00e0 l'accueil.",
      tryAgain: "R\u00e9essayer",
      errorReference: "R\u00e9f\u00e9rence de l'erreur",
      copyReference: "Copier la r\u00e9f\u00e9rence de l'erreur",
      backToHome: "Retour \u00e0 l'accueil"
    },
    nav: {
      home: "Personas",
      how: "Comment \u00e7a marche",
      connections: "Connexions",
      roadmap: "Feuille de route",
      templates: "Mod\u00e8les",
      download: "T\u00e9l\u00e9charger",
      dashboard: "Tableau de bord",
      features: "Fonctionnalit\u00e9s",
      guide: "Guide",
      useCases: "Cas d'usage",
      tour: "Visite",
      security: "S\u00e9curit\u00e9",
      blog: "Blog",
      changelog: "Journal des modifications",
      pricing: "Tarifs",
      menu: "Menu"
    },
    compareSection: {
      heading: "Tout est",
      headingGradient: "gratuit",
      description: "L'application de bureau et toutes les fonctionnalit\u00e9s ci-dessous sont gratuites pour toujours. Pas de paliers, pas de tarif par utilisateur \u2014 juste une plateforme d'agents compl\u00e8te qui tourne sur votre machine.",
      offerBadges: [
        "Gratuit \u00e0 vie",
        "Auto-h\u00e9berg\u00e9",
        "Aucune majoration par ex\u00e9cution",
        "Open source"
      ],
      offerBody: "Personas fonctionne sur votre machine. Aucune majoration d'orchestration et aucune tarification par si\u00e8ge. Le cloud payant et le support prioritaire sont optionnels, pas obligatoires.",
      ctaLabel: "Commencer gratuitement",
      readGuide: "Lire le guide",
      groups: {
        "agents-prompts": {
          title: "Agents et Prompts",
          tagline: "Centr\u00e9 sur les utilisateurs",
          concepts: [
            "Cr\u00e9ation de personas en langage naturel",
            "40+ mod\u00e8les adoptables",
            "BYOM \u2014 Claude ou Ollama en local",
            "Modes de prompt structur\u00e9s et simples",
            "M\u00e9moire d'agent persistante"
          ]
        },
        triggers: {
          title: "Orchestration",
          tagline: "Toutes les fa\u00e7ons de d\u00e9marrer un agent",
          concepts: [
            "Planification (cron)",
            "Points de terminaison webhook",
            "Surveillance de fichiers",
            "Moniteur de presse-papiers",
            "D\u00e9clencheur en cha\u00eene / par \u00e9v\u00e9nement",
            "Conditions composites"
          ]
        },
        pipelines: {
          title: "Pipelines et \u00c9quipes",
          tagline: "Collaboration agentique visuelle",
          concepts: [
            "Canevas d'\u00e9quipe visuel",
            "Connexions de flux de donn\u00e9es",
            "Bus d'\u00e9v\u00e9nements en direct",
            "Ex\u00e9cution auto-r\u00e9paratrice",
            "Relecture de pipeline + voyage dans le temps"
          ]
        },
        credentials: {
          title: "Identifiants et S\u00e9curit\u00e9",
          tagline: "Vos secrets restent sur votre machine",
          concepts: [
            "Coffre AES-256-GCM",
            "Trousseau natif du syst\u00e8me",
            "OAuth assist\u00e9 par IA",
            "Renouvellement automatique des jetons",
            "Z\u00e9ro t\u00e9l\u00e9m\u00e9trie, local d'abord"
          ]
        },
        monitoring: {
          title: "Surveillance",
          tagline: "Voir, chiffrer et contr\u00f4ler chaque ex\u00e9cution",
          concepts: [
            "Tableau de bord d'observabilit\u00e9 en direct",
            "Tra\u00e7age des spans par ex\u00e9cution",
            "Attribution des co\u00fbts par mod\u00e8le",
            "Files d'attente de revue humaine",
            "Alertes de budget + application"
          ]
        },
        testing: {
          title: "Labo de test",
          tagline: "\u00c9volution automatis\u00e9e",
          concepts: [
            "Ar\u00e8ne pour tests A/B",
            "Versionnage de prompts + diffs",
            "Notation de fitness",
            "Cycles de reproduction",
            "Bacs \u00e0 sable d'outils simul\u00e9s"
          ]
        }
      }
    },
    footer: {
      tagline: "Des agents IA qui travaillent pour vous",
      motto: "Des agents IA qui automatisent votre travail, pour que vous puissiez vous concentrer sur l\u2019essentiel.",
      product: "Produit",
      resources: "Ressources",
      legal: "Mentions l\u00e9gales",
      privacy: "Confidentialit\u00e9",
      terms: "Conditions",
      copyright: "Personas. Tous droits r\u00e9serv\u00e9s.",
      slogan: "Automatisez votre travail. R\u00e9cup\u00e9rez votre temps."
    },
    pricing: {
      local: "Local",
      cloud: "Cloud",
      enterprise: "Entreprise",
      downloadLocal: "T\u00e9l\u00e9charger Local",
      goCloud: "Passer au Cloud",
      contactSales: "Contacter les ventes",
      comingSoon: "Bient\u00f4t disponible",
      bestFor: "Id\u00e9al pour",
      forever: "pour toujours",
      mo: "/mois",
      custom: "Sur mesure",
      bestForLocal: "Les cr\u00e9ateurs solo qui d\u00e9butent",
      bestForCloud: "Les \u00e9quipes individuelles rapides",
      bestForEnterprise: "Organisations avec besoins de conformit\u00e9 et d'\u00e9chelle",
      features: {
        unlimitedLocalAgents: "Agents locaux illimit\u00e9s",
        localEventBus: "Bus d\u2019\u00e9v\u00e9nements local et planificateur",
        fullObservability: "Tableau de bord d'observabilit\u00e9 complet",
        designEngine: "Moteur de design",
        teamCanvasLocal: "Canvas d\u2019\u00e9quipe (local)",
        everythingInFree: "Tout ce qui est inclus dans Gratuit",
        cloudWorkers3: "3 workers cloud",
        executions1000: "1 000 ex\u00e9cutions/mois",
        events10000: "10 000 \u00e9v\u00e9nements/mois",
        burstAutoScaling: "Auto-scaling en rafale",
        everythingInPro: "Tout ce qui est inclus dans Pro",
        ssoSaml: "SSO via SAML et OIDC",
        multiTenantRbac: "Espaces de travail multi-tenant avec RBAC",
        auditTrailExport: "Export de la piste d\u2019audit des ex\u00e9cutions",
        dedicatedWorkers: "Workers cloud d\u00e9di\u00e9s et SLA",
        prioritySupport: "Support prioritaire"
      }
    },
    hero: {
      title: "Des agents IA qui tournent sur votre machine",
      subtitle: "Un persona, de multiples capacit\u00e9s. Cr\u00e9ez un assistant \u00e0 l'identit\u00e9 stable et composez les t\u00e2ches qu'il effectue \u2014 ajoutez, activez ou retirez des capacit\u00e9s sans repartir de z\u00e9ro.",
      downloadCta: "T\u00e9l\u00e9charger",
      trustLine: "Aucune inscription, aucune carte bancaire. Fonctionne sur votre machine. Z\u00e9ro t\u00e9l\u00e9m\u00e9trie.",
      cta: "Commencer",
      badge: "Plateforme d\u2019agents IA",
      headingLine1: "Des agents intelligents",
      headingLine2: "qui travaillent pour vous",
      description: "Concevez des agents en langage naturel. Orchestrez-les en local ou dans le cloud.",
      descriptionBold: "Pas de diagrammes. Pas d\u2019essaims d\u2019agents. Pas de code.",
      mode1: "Capacit\u00e9s composables",
      mode2: "Configuration simple",
      mode3: "Gratuit",
      mode4: "IA multi-fournisseurs",
      mode5: "Auto-am\u00e9lioration",
      viewOnGithub: "Voir sur GitHub",
      downloadForWindows: "T\u00e9l\u00e9charger pour Windows",
      joinWaitlist: "Rejoindre la liste d\u2019attente Windows",
      commandCenter: "Centre de commande",
      adoptionSnapshot: "Aper\u00e7u de l\u2019adoption",
      scroll: "D\u00e9filer",
      phases: "PHASES",
      publicBeta: "B\u00caTA PUBLIQUE",
      agents: "Agents",
      executions: "Ex\u00e9cutions",
      connectors: "Connecteurs",
      templates: "Mod\u00e8les"
    },
    heroTransition: {
      ariaLabel: "Piliers fondamentaux du produit",
      speed: "Rapide",
      privacy: "Priv\u00e9",
      scale: "\u00c9volutif",
      value: "Un persona, de multiples capacit\u00e9s \u2014 une identit\u00e9 stable avec un ensemble de t\u00e2ches composables, s'ex\u00e9cutant l\u00e0 o\u00f9 vivent vos donn\u00e9es et restant sous votre contr\u00f4le.",
      cta: "Voir en action"
    },
    sections: {
      vision: "Vision",
      pricing: "Tarifs",
      faq: "FAQ",
      features: "Fonctionnalit\u00e9s",
      useCases: "Cas d\u2019usage",
      eventBus: "Bus d\u2019\u00e9v\u00e9nements",
      download: "T\u00e9l\u00e9charger"
    },
    common: {
      skipToMain: "Aller au contenu principal",
      loading: "Chargement...",
      cancel: "Annuler",
      close: "Fermer",
      back: "Retour",
      next: "Suivant",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      search: "Rechercher",
      noResults: "Aucun r\u00e9sultat trouv\u00e9",
      signOut: "Se d\u00e9connecter",
      signingOut: "D\u00e9connexion en cours\u2026",
      signIn: "Se connecter",
      notifyMe: "me notifier",
      step: "\u00c9tape",
      learnMore: "En savoir plus",
      viewAll: "Tout voir",
      status: "Statut",
      active: "actif",
      idle: "inactif",
      total: "total",
      checking: "V\u00e9rification\u2026",
      connected: "Connect\u00e9",
      disconnected: "D\u00e9connect\u00e9",
      demo: "D\u00e9mo",
      viewFullSite: "Afficher le site complet"
    },
    useCasesSection: {
      heading: "Un persona,",
      headingGradient: "de nombreuses capacit\u00e9s",
      integrations: "int\u00e9grations",
      patterns: "capacit\u00e9s",
      description: "Chaque persona porte une identit\u00e9 stable et un ensemble de capacit\u00e9s composables \u2014 cliquez sur une int\u00e9gration pour explorer les t\u00e2ches qu'un persona peut accomplir.",
      autoplayHint: "D\u00e9filement automatique \u2014 cliquez pour arr\u00eater.",
      browseTemplates: "Parcourir tous les mod\u00e8les",
      whatCanAutomate: "Ce que Personas peut automatiser",
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
        name: "Calendrier",
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
      heading: "Questions",
      headingGradient: "fr\u00e9quentes",
      subtitle: "Tout ce que vous devez savoir pour d\u00e9marrer avec Personas.",
      stillQuestions: "Encore des questions ?",
      joinDiscord: "Rejoindre Discord",
      discordSubtitle: "Rejoignez notre communaut\u00e9 Discord pour de l'aide et des discussions.",
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
      heading: "Pr\u00eat \u00e0 cr\u00e9er votre",
      headingGradient: "agent ?",
      subtitle: "T\u00e9l\u00e9chargez Personas gratuitement. Commencez \u00e0 cr\u00e9er en quelques minutes.",
      downloadInstaller: "T\u00e9l\u00e9charger l\u2019installeur",
      joinWaitlist: "Rejoindre la liste d\u2019attente",
      connectCli: "Connecter Claude CLI",
      launchAgent: "Lancer le premier agent",
      exploreFirst: "Explorer les capacit\u00e9s d\u2019abord",
      requiresCli: "N\u00e9cessite Claude CLI",
      installerSize: "Installeur de 12 Mo",
      noTelemetry: "Aucune t\u00e9l\u00e9m\u00e9trie",
      localFirst: "S\u00e9curit\u00e9 locale d'abord",
      windows: "Windows",
      macos: "macOS",
      linux: "Linux"
    },
    dashboard: {
      title: "Tableau de bord",
      overview: "Vue d\u2019ensemble",
      agents: "Agents",
      executions: "Ex\u00e9cutions",
      events: "\u00c9v\u00e9nements",
      reviews: "Revues",
      observability: "Observabilit\u00e9",
      knowledge: "Connaissances",
      settings: "Param\u00e8tres",
      leaderboard: "Classement",
      sla: "SLA",
      incidents: "Incidents",
      health: "\u00c9tat",
      messages: "Messages",
      more: "Plus",
      greeting: {
        morning: "Bonjour",
        afternoon: "Bon apr\u00e8s-midi",
        evening: "Bonsoir"
      },
      agentsStatus: "Voici ce qui se passe avec vos agents",
      lastSeen: "Derni\u00e8re visite",
      greetingFallback: "ami",
      pendingReviews: "revues en attente",
      totalExecutions: "ex\u00e9cutions totales",
      successRate: "taux de r\u00e9ussite",
      activeAgents: "agents actifs",
      recentActivity: "Activit\u00e9 r\u00e9cente",
      running: "en cours",
      noExecutionsYet: "Aucune ex\u00e9cution pour le moment.",
      executeToSee: "Ex\u00e9cutez un agent pour voir l'activit\u00e9 ici.",
      trafficErrors: "Trafic et erreurs",
      last14Days: "14 derniers jours",
      noTrafficYet: "Aucun trafic pour l'instant",
      deployed: "d\u00e9ploy\u00e9",
      metricsHealth: "M\u00e9triques et sant\u00e9",
      toolUtilization: "Utilisation des outils",
      workers: "workers",
      usageAnalytics: "Analyses d\u2019utilisation",
      errorBoundary: {
        title: "\u00c9chec du rendu du panneau du tableau de bord",
        description: "Cette section a rencontr\u00e9 une erreur inattendue. Vous pouvez r\u00e9essayer sans quitter la page.",
        retry: "R\u00e9essayer",
        errorIdLabel: "ID d'erreur",
        copyErrorId: "Copier l'ID d'erreur",
        copied: "Copi\u00e9"
      },
      unreadMessages: "messages non lus",
      fleetHealth: "sant\u00e9 de la flotte",
      fleet: {
        title: "Optimisation de la flotte",
        severity: {
          urgent: "Urgent",
          suggested: "Sugg\u00e9r\u00e9",
          insight: "Aper\u00e7u"
        },
        expand: "D\u00e9tails",
        collapse: "Masquer",
        dismiss: "Ignorer"
      },
      staleness: {
        justNow: "\u00c0 l'instant",
        secondsAgo: "il y a {n}s",
        minutesAgo: "il y a {n}m",
        hoursAgo: "il y a {n}h",
        daysAgo: "il y a {n}j",
        error: "\u00c9chec du chargement"
      },
      scope: {
        allPersonas: "Tous les personas",
        personaLabel: "Filtre persona",
        compare: "Comparer",
        dateRange: {
          last24h: "24h",
          last7d: "7j",
          last30d: "30j",
          last90d: "90j",
          custom: "Personnalis\u00e9"
        }
      },
      home: {
        vitals: {
          runs: "Ex\u00e9cutions",
          alerts: "Alertes"
        },
        cockpit: {
          vitalsTitle: "Constantes de la flotte",
          vitalsTrend: "Succ\u00e8s \u00b7 14 jours",
          triageTitle: "File de triage",
          triageSubtitle: "Class\u00e9 par urgence",
          triageEmpty: "Tout va bien \u2014 rien ne requiert votre attention pour le moment.",
          triageKindBreach: "Violation de SLA",
          triageKindIncident: "Incident",
          triageKindReview: "Examen",
          tickerLabel: "En direct",
          tickerSuccess: "Succ\u00e8s de la flotte",
          tickerAgents: "Agents en ligne",
          tickerProviders: "Fournisseurs",
          tickerNextRoutine: "Prochaine routine",
          tickerAlerts: "Alertes ouvertes",
          tickerAllClear: "Tout va bien",
          instrumentsTitle: "Instruments"
        },
        heatmap: {
          title: "Activit\u00e9 d'ex\u00e9cution",
          subtitle: "Ex\u00e9cutions par agent \u00b7 7 derniers jours",
          less: "Moins",
          more: "Plus",
          empty: "Aucune ex\u00e9cution pour le moment."
        },
        topPerformers: {
          title: "Meilleurs agents"
        },
        upcomingRoutines: {
          title: "Routines \u00e0 venir",
          subtitle: "Prochaines ex\u00e9cutions planifi\u00e9es",
          empty: "Aucune routine planifi\u00e9e.",
          triggers: {
            schedule: "Planification",
            polling: "Sondage",
            webhook: "Webhook",
            event: "\u00c9v\u00e9nement"
          }
        },
        vaultChanges: {
          title: "Coffre d'identifiants",
          subtitle: "Changements r\u00e9cents",
          empty: "Aucun changement r\u00e9cent.",
          actions: {
            rotated: "Pivot\u00e9e",
            added: "Ajout\u00e9e",
            revoked: "R\u00e9voqu\u00e9e",
            synced: "Synchronis\u00e9e"
          }
        }
      }
    },
    dashboardUi: {
      status: {
        queued: "En file d'attente",
        running: "En cours",
        completed: "Termin\u00e9",
        processed: "Trait\u00e9",
        failed: "\u00c9chou\u00e9",
        cancelled: "Annul\u00e9",
        pending: "En attente",
        approved: "Approuv\u00e9",
        rejected: "Rejet\u00e9"
      },
      testFlow: "Tester le flux",
      eventTypes: "Types d'\u00e9v\u00e9nements",
      stdout: "stdout",
      jumpToLatest: "Aller au plus r\u00e9cent",
      loadMoreExecutions: "Charger plus d'ex\u00e9cutions ({visible}/{total})",
      cancelling: "Annulation...",
      cancelQueuedRun: "Annuler l'ex\u00e9cution en file d'attente",
      conflict: "Conflit",
      manualReviews: "R\u00e9visions manuelles",
      manualReviewsSubtitle: "Examinez et approuvez les d\u00e9cisions des agents n\u00e9cessitant une supervision humaine",
      content: "Contenu",
      selectReview: "S\u00e9lectionnez une r\u00e9vision",
      selectReviewDesc: "Choisissez une r\u00e9vision dans la liste pour voir les d\u00e9tails et agir",
      navigate: "naviguer",
      execution: "Ex\u00e9cution",
      reviewerNotes: "Notes du r\u00e9viseur",
      notesPlaceholder: "Ajouter des notes optionnelles avant de r\u00e9soudre...",
      selected: "s\u00e9lectionn\u00e9(s)",
      selectReviewsBulk: "S\u00e9lectionner des r\u00e9visions pour des actions group\u00e9es",
      noReviewsInFilter: "Aucune r\u00e9vision dans ce filtre",
      refreshing: "Actualisation...",
      rejectSelectedTitle: "Rejeter les r\u00e9visions s\u00e9lectionn\u00e9es ?",
      rejectSelectedBody: "Cela rejettera {count} r\u00e9vision{plural} s\u00e9lectionn\u00e9e. Vous aurez 5 secondes pour annuler cette action.",
      undo: "Annuler",
      retry: "R\u00e9essayer",
      bulkFailedApprove: "\u00c9chec de l'approbation de {failed} sur {total}",
      bulkFailedReject: "\u00c9chec du rejet de {failed} sur {total}",
      bulkSucceededReselected: "{count} r\u00e9ussi(s) \u00b7 \u00e9l\u00e9ments en \u00e9chec res\u00e9lectionn\u00e9s",
      allShortcuts: "Tous les raccourcis",
      keyboardShortcuts: "Raccourcis clavier",
      searchShortcuts: "Rechercher des raccourcis...",
      noShortcutsMatch: "Aucun raccourci ne correspond \u00e0 \"{query}\"",
      failedAgentDetails: "\u00c9chec du chargement des d\u00e9tails de l'agent",
      retryAgentDetails: "R\u00e9essayer",
      recentExecutions: "Ex\u00e9cutions r\u00e9centes",
      noExecutionsYet: "Aucune ex\u00e9cution pour l'instant",
      subscription: "abonnement",
      subscriptions: "abonnements",
      trigger: "d\u00e9clencheur",
      triggers: "d\u00e9clencheurs",
      closeAgentDetails: "Fermer les d\u00e9tails de l'agent",
      metricConcurrency: "Concurrence",
      metricTimeout: "D\u00e9lai d'expiration",
      metricBudget: "Budget",
      metricConcurrencyTitle: "Jusqu'\u00e0 {n} ex\u00e9cutions simultan\u00e9es",
      metricTimeoutTitle: "D\u00e9lai d'expiration d'ex\u00e9cution : {n} secondes",
      metricBudgetTitle: "Plafond budg\u00e9taire : {n} par ex\u00e9cution",
      sessionVerifyFailed: "Impossible de v\u00e9rifier votre session",
      sessionHelp: "Si le probl\u00e8me persiste, v\u00e9rifiez votre r\u00e9seau ou vos bloqueurs de publicit\u00e9.",
      devModeMock: "Mode d\u00e9veloppement - utilisation de donn\u00e9es fictives",
      signInTitlePrefix: "Connectez-vous \u00e0 votre",
      signInTitleDashboard: "Tableau de bord",
      devSignInDesc: "Cliquez ci-dessous pour acc\u00e9der au tableau de bord avec des donn\u00e9es d'exemple et explorer l'interface.",
      prodSignInDesc: "Surveillez vos agents cloud, examinez les ex\u00e9cutions et g\u00e9rez les \u00e9v\u00e9nements depuis un seul endroit.",
      signingIn: "Connexion en cours...",
      enterDemoDashboard: "Acc\u00e9der au tableau de bord de d\u00e9monstration",
      continueWithGoogle: "Continuer avec Google",
      tryDemo: "Essayer la d\u00e9mo",
      devNoAuth: "Aucune authentification requise en mode d\u00e9veloppement",
      securedBySupabase: "S\u00e9curis\u00e9 par l'authentification Supabase",
      errorBoundaryFallback: "Cette vue \u00e9choue syst\u00e9matiquement. Veuillez actualiser la page ou contacter le support avec l'ID d'erreur ci-dessus.",
      brandName: "Personas",
      connected: "Connect\u00e9",
      weekAbbr: "s",
      disconnected: "D\u00e9connect\u00e9",
      totalLabel: "Total",
      agent: "Agent",
      connections: "Connexions",
      eventAnimationPaused: "Animation du flux d'\u00e9v\u00e9nements en pause (mouvement r\u00e9duit)",
      node: "n\u0153ud",
      eventBus: "Bus d'\u00e9v\u00e9nements",
      eventType: "Type d'\u00e9v\u00e9nement",
      timestamp: "Horodatage",
      trafficVolume: "Volume de trafic",
      samplePayload: "Exemple de charge utile",
      systemHealth: "Sant\u00e9 du syst\u00e8me",
      health: "Sant\u00e9",
      memoryInsights: "Aper\u00e7us m\u00e9moire",
      suggestion: "suggestion",
      suggestions: "suggestions",
      dismissAction: "Ignorer : {title}",
      allSuggestionsDismissed: "Toutes les suggestions ont \u00e9t\u00e9 ignor\u00e9es. Revenez plus tard.",
      noDataAvailable: "Aucune donn\u00e9e disponible pour l'instant",
      errors: "Erreurs",
      totalLower: "total",
      copyPayload: "Copier la charge utile"
    },
    memoriesPage: {
      title: "M\u00e9moires",
      subtitle: "Mod\u00e8les appris que vos agents appliquent automatiquement",
      totalCount: "{n} m\u00e9moires",
      filters: {
        all: "Toutes",
        throttle: "Limitation",
        schedule: "Planification",
        alert: "Alerte",
        config: "Configuration",
        routing: "Routage"
      },
      status: {
        active: "Actif",
        pending: "En attente",
        archived: "Archiv\u00e9"
      },
      uses: "{n} utilisations",
      empty: "Aucune m\u00e9moire ne correspond \u00e0 ce filtre",
      seeAll: "Voir tout",
      conflicts: {
        count: "{n} conflits",
        resolveButton: "R\u00e9soudre les conflits",
        modalTitle: "R\u00e9soudre {n} conflits",
        modalSubtitle: "Acceptez ou rejetez chacun pour garder votre m\u00e9moire coh\u00e9rente.",
        accept: "Accepter",
        reject: "Rejeter",
        cancel: "Annuler",
        apply: "Appliquer",
        allResolved: "Tous les conflits r\u00e9solus",
        discardTitle: "Abandonner vos d\u00e9cisions ?",
        discardBody: "Vous avez class\u00e9 {n} conflits. Fermer maintenant les abandonnera sans les appliquer.",
        discardConfirm: "Abandonner",
        discardKeep: "Continuer l'\u00e9dition"
      }
    },
    knowledgePage: {
      viewSwitcherLabel: "Vues des connaissances",
      title: "Graphe de connaissances",
      subtitle: "Mod\u00e8les appris des ex\u00e9cutions d'agents",
      denseTable: "Table dense",
      graph: "Graphe",
      memories: "M\u00e9moires",
      type: "Type",
      patternKey: "Cl\u00e9 du mod\u00e8le",
      agent: "Agent",
      success: "Succ\u00e8s",
      successLower: "succ\u00e8s",
      failures: "\u00c9checs",
      failuresLower: "\u00e9checs",
      fails: "\u00c9choue",
      rate: "Taux",
      rateLower: "taux",
      cost: "Co\u00fbt",
      tokens: "Jetons",
      retries: "Tentatives",
      duration: "Dur\u00e9e",
      confidence: "Confiance",
      lastSeen: "Vu en dernier",
      nodes: "N\u0153uds",
      agents: "Agents",
      clusters: "Clusters",
      avgConfidence: "Conf. moy.",
      all: "Tous",
      agentLinks: "Liens d'agents",
      nodeSize: "Taille du n\u0153ud",
      confidenceLegend: "= confiance",
      low: "faible",
      high: "\u00e9lev\u00e9",
      patterns: "Mod\u00e8les",
      avgCost: "Co\u00fbt moyen",
      clear: "Effacer",
      noPatterns: "Aucun mod\u00e8le ne correspond aux filtres actuels",
      types: {
        tool_sequence: "S\u00e9quence d'outils",
        failure_pattern: "Mod\u00e8le d'\u00e9chec",
        cost_quality: "Co\u00fbt / Qualit\u00e9",
        model_performance: "Performance du mod\u00e8le",
        data_flow: "Flux de donn\u00e9es"
      }
    },
    reviewsPage: {
      selectReview: "S\u00e9lectionner la revue",
      selectAllPending: "S\u00e9lectionner toutes les revues en attente",
      focus: {
        enter: "Mode focus",
        exit: "Quitter",
        volume: "Volume",
        skipTo: "Aller \u00e0",
        chapterHome: "Accueil",
        progress: "{n} sur {total}",
        skip: "Passer",
        empty: "Tout est \u00e0 jour \u2014 aucune r\u00e9vision en attente",
        approve: "Approuver",
        reject: "Rejeter"
      },
      parseError: {
        label: "Erreur d'analyse",
        detail: "Charge utile malform\u00e9e \u2014 escalad\u00e9e en critique jusqu'\u00e0 r\u00e9vision"
      }
    },
    leaderboardPage: {
      title: "Classement",
      subtitle: "Classement de la flotte par performance composite",
      rank: "Rang",
      composite: "Composite",
      delta: "Variation",
      sortBy: "Trier par {field}",
      compare: "Comparer",
      versus: "vs",
      radarTitle: "Profil des m\u00e9triques",
      rankBy: "Classer par",
      overall: "Global",
      metrics: {
        reliability: "Fiabilit\u00e9",
        cost: "Co\u00fbt",
        tokens: "Jetons",
        retries: "Tentatives",
        speed: "Vitesse",
        quality: "Qualit\u00e9",
        volume: "Volume",
        skipTo: "Aller \u00e0",
        chapterHome: "Accueil"
      },
      trend: {
        up: "En hausse",
        down: "En baisse",
        flat: "Stable"
      }
    },
    slaPage: {
      title: "SLA",
      subtitle: "Objectifs de niveau de service, conformit\u00e9 et historique des violations",
      compliance: "Conformit\u00e9",
      activeBreaches: "Violations actives",
      objectives: "Objectifs",
      target: "Cible",
      current: "Actuel",
      timeInSla: "Temps dans le SLA",
      targetFilter: {
        all: "Tous",
        atRisk: "\u00c0 risque",
        healthy: "Sain"
      },
      metricType: {
        availability: "Disponibilit\u00e9",
        latency: "Latence p95",
        successRate: "Taux de r\u00e9ussite"
      },
      severity: {
        minor: "Mineure",
        major: "Majeure",
        critical: "Critique"
      },
      breachLog: {
        title: "Journal des violations",
        all: "Toutes",
        started: "D\u00e9but",
        resolved: "R\u00e9solu",
        otherBreaches: "Autres violations de {persona} : {n}",
        timeToResolve: "Temps de r\u00e9solution",
        elapsed: "\u00c9coul\u00e9",
        empty: "Aucune violation au cours des 7 derniers jours.",
        ongoing: "En cours",
        duration: "{n} min"
      }
    },
    incidentsPage: {
      title: "Incidents",
      subtitle: "Incidents du journal d'audit sur toute la flotte",
      open: "Ouverts",
      total: "Total",
      bySeverity: "Par gravit\u00e9",
      bySource: "Par source",
      incidents: "incidents",
      groupByLabel: "Grouper par",
      clearFilters: "Effacer les filtres",
      allPersonas: "Toutes les personas",
      statusLabel: "Statut",
      severity: {
        critical: "Critique",
        high: "\u00c9lev\u00e9e",
        medium: "Moyenne",
        low: "Faible"
      },
      status: {
        all: "Tous",
        open: "Ouvert",
        resolved: "R\u00e9solu",
        ignored: "Ignor\u00e9",
        escalated: "Escalad\u00e9"
      },
      source: {
        all: "Toutes les sources",
        executions: "Ex\u00e9cutions",
        events: "\u00c9v\u00e9nements",
        triggers: "D\u00e9clencheurs",
        vault: "Coffre",
        messages: "Messages",
        reviews: "Revues"
      },
      groupBy: {
        none: "Aucun",
        agent: "Agent",
        severity: "Gravit\u00e9",
        source: "Source"
      },
      badges: {
        circuitBreaker: "Disjoncteur",
        autoFixed: "Corrig\u00e9 automatiquement"
      },
      detail: {
        recommendation: "Action recommand\u00e9e",
        source: "Source",
        category: "Cat\u00e9gorie",
        persona: "Agent",
        detected: "D\u00e9tect\u00e9",
        resolved: "R\u00e9solu",
        ongoing: "En cours"
      },
      empty: {
        title: "Aucun incident",
        description: "La flotte est saine \u2014 aucun incident d'audit enregistr\u00e9.",
        filteredTitle: "Aucun incident correspondant",
        filteredDescription: "Aucun incident ne correspond aux filtres actuels."
      }
    },
    healthPage: {
      title: "\u00c9tat du syst\u00e8me",
      subtitle: "Runtime, services, ressources et int\u00e9grations",
      sections: {
        runtime: "Runtime",
        services: "Services",
        resources: "Ressources",
        integrations: "Int\u00e9grations"
      },
      status: {
        ok: "Sain",
        warn: "Avertissement",
        error: "Erreur",
        info: "Info"
      },
      diskUsage: "Utilisation du disque",
      used: "utilis\u00e9",
      free: "libre",
      actions: {
        install: "Installer",
        configure: "Configurer"
      },
      toast: {
        configured: "configur\u00e9 (d\u00e9mo)",
        installed: "activ\u00e9 (d\u00e9mo)"
      }
    },
    messagesPage: {
      title: "Messages",
      subtitle: "Retours asynchrones de chaque persona de la flotte",
      unread: "Non lu",
      read: "Lu",
      empty: "Aucun message sur cette page.",
      expand: "Afficher la charge utile",
      collapse: "Masquer la charge utile",
      pagination: {
        prev: "Pr\u00e9c\u00e9dent",
        next: "Suivant",
        page: "Page {n} sur {total}"
      },
      markAllRead: "Tout marquer comme lu",
      viewThreads: "Fils",
      viewList: "Liste",
      reply: "R\u00e9ponse"
    },
    observabilityPage: {
      usageInsight: "{top} est utilis\u00e9 {ratio}x plus que {second}, ce qui en fait votre int\u00e9gration d'outil la plus utilis\u00e9e.",
      title: "Observabilit\u00e9",
      subtitle: "M\u00e9triques de performance, suivi des co\u00fbts et utilisation des outils",
      tabPerformance: "Performance",
      tabUsage: "Utilisation des outils",
      tabActivity: "Activit\u00e9",
      circuitBreaker: "Disjoncteur",
      autoFixed: "Corrig? automatiquement",
      resolved: "R?solu",
      autoFixApplied: "Correction automatique appliqu?e",
      costAnomalyDetected: "Anomalie de co?t d?tect?e le",
      budgetThresholdExceeded: "Seuil de budget d?pass? pour",
      totalCost: "Co?t total",
      executions: "Ex?cutions",
      successRate: "Taux de r?ussite",
      activePersonas: "Personas actives",
      costOverTime: "Co?t dans le temps",
      previousPeriod: "vs p?riode pr?c?dente",
      executionHealth: "Sant? des ex?cutions",
      latencyDistribution: "Distribution de latence",
      latencyPercentiles: "P50 / P95 / P99",
      spendByAgent: "D?penses par agent",
      noSpendData: "Aucune donn?e de d?pense",
      healthIssues: "Probl?mes de sant?",
      open: "ouverts",
      analyzing: "Analyse...",
      runAnalysis: "Lancer l?analyse",
      runningAnalysis: "Analyse de sant? en cours sur tous les services surveill?s...",
      allSystemsHealthy: "Tous les syst?mes sont sains",
      noIssuesDetected: "Aucun probl?me d?tect? sur les services surveill?s",
      noSeverityIssues: "Aucun probl?me de s?v?rit? {severity}",
      exampleDataNotice: "Des donn?es d?exemple sont affich?es. Les vraies analyses appara?tront quand les agents lanceront des ex?cutions.",
      toolInvocations: "Appels d?outils",
      distribution: "Distribution",
      usageOverTime: "Utilisation dans le temps",
      last14Days: "14 derniers jours",
      toolUsageByAgent: "Utilisation des outils par agent",
      other: "Autre",
      athenaUsage: "Utilisation d'Athena",
      athenaSubtitle: "Co\u00fbt du Companion par action",
      athenaActions: {
        invoke: "Invocation",
        recall: "Rappel",
        fallback: "Repli"
      },
      valueRollup: "Bilan de valeur",
      valueDelivered: "Valeur livr\u00e9e",
      costPerValue: "Co\u00fbt par valeur",
      outcomes: {
        delivered: "Livr\u00e9",
        partial: "Partiel",
        blocked: "Bloqu\u00e9"
      },
      severity: {
        all: "tous",
        critical: "critique",
        high: "?lev?e",
        medium: "moyenne",
        low: "faible"
      }
    },
    agentsPage: {
      statusLive: "En ligne",
      statusOff: "D\u00e9sactiv\u00e9",
      title: "Agents",
      noAgents: "Aucun agent d\u00e9ploy\u00e9",
      noAgentsDesc: "D\u00e9ployez votre premier agent depuis l\u2019application Personas, puis revenez ici pour le surveiller.",
      agentDeployed: "agent d\u00e9ploy\u00e9",
      agentsDeployed: "agents d\u00e9ploy\u00e9s",
      manualExecution: "Ex\u00e9cution manuelle depuis le tableau de bord",
      maxConcurrent: "max",
      timeoutSeconds: "d?lai {n}s",
      budget: "budget",
      execute: "Ex?cuter",
      executing: "Ex\u00e9cution\u2026",
      executeQueued: "Ex\u00e9cution mise en file d\u2019attente pour {name}",
      executeFailed: "Impossible de d\u00e9marrer {name}",
      details: "D?tails"
    },
    executionsPage: {
      title: "Ex\u00e9cutions",
      all: "Toutes",
      active: "Actives",
      completed: "Termin\u00e9es",
      failed: "\u00c9chou\u00e9es",
      cancelled: "Annul\u00e9es",
      agent: "Agent",
      duration: "Dur\u00e9e",
      cost: "Co\u00fbt",
      tokens: "Jetons",
      retries: "Tentatives",
      started: "D\u00e9marr\u00e9",
      noExecutions: "Aucune ex\u00e9cution pour le moment",
      noExecutionsDesc: "Ex\u00e9cutez un agent pour voir les r\u00e9sultats ici",
      waitingForWorker: "En attente d\u2019un worker...",
      noOutputYet: "Pas encore de sortie",
      noFilteredActive: "Aucune ex\u00e9cution active dans cette vue",
      noFilteredCompleted: "Aucune ex\u00e9cution termin\u00e9e dans cette vue",
      noFilteredFailed: "Aucune ex\u00e9cution \u00e9chou\u00e9e dans cette vue",
      noFilteredCancelled: "Aucune ex\u00e9cution annul\u00e9e dans cette vue",
      filteredEmptyDesc: "D'autres ex\u00e9cutions existent mais aucune ne correspond \u00e0 ce filtre.",
      showAllExecutions: "Tout afficher"
    },
    eventsPage: {
      title: "\u00c9v\u00e9nements",
      subtitle: "Activit\u00e9 du bus d'\u00e9v\u00e9nements sur tous les agents",
      tabEvents: "\u00c9v\u00e9nements",
      tabSubscriptions: "Abonnements",
      tabVisualization: "Visualisation",
      tabSwimlane: "Chronologie",
      event: "?v?nement",
      source: "Source",
      time: "Heure",
      id: "ID",
      sourceLabel: "Source",
      processed: "Trait?",
      retry: "R?essayer",
      selectForBulkRetry: "S?lectionner pour r?essai group?",
      showRelatedEvents: "Afficher {count} ?v?nements li?s",
      retriedCount: "R?essay? {count} fois",
      retryEvent: "R?essayer l??v?nement",
      searchPlaceholder: "Rechercher payloads, types d??v?nements, sources, erreurs...",
      clearSearch: "Effacer la recherche",
      eventType: "Type d??v?nement",
      sourceType: "Type de source",
      clearFilters: "Effacer les filtres",
      chain: "Cha?ne",
      events: "?v?nements",
      result: "r?sultat",
      results: "r?sultats",
      noDeadLetters: "Aucune dead letter",
      noDeadLettersDescription: "Les ?v?nements ?chou?s avec erreurs appara?tront ici pour r?essai",
      noMatchingEvents: "Aucun ?v?nement correspondant",
      noEvents: "Aucun ?v?nement",
      noMatchingEventsDescription: "Essayez d?ajuster votre recherche ou vos filtres",
      noEventsDescription: "Les ?v?nements appara?tront ici lorsque les agents traiteront les d?clencheurs et abonnements",
      loadMore: "Charger plus d??v?nements",
      failedEventSelected: "?v?nement ?chou? s?lectionn?",
      failedEventsSelected: "?v?nements ?chou?s s?lectionn?s",
      selectAllFailed: "S?lectionner tous les ?checs",
      retryAll: "Tout r?essayer",
      active: "Actif",
      disabled: "D\u00e9sactiv\u00e9",
      created: "Cr\u00e9\u00e9",
      match: "correspondance",
      matches: "correspondances",
      deleteSubscription: "Supprimer l'abonnement",
      unknownAgent: "Agent inconnu",
      disableSubscription: "D\u00e9sactiver l'abonnement",
      enableSubscription: "Activer l'abonnement",
      createSubscription: "Cr\u00e9er un abonnement",
      persona: "Persona",
      selectPersona: "S\u00e9lectionnez un persona...",
      selectEventType: "S\u00e9lectionnez un type d'\u00e9v\u00e9nement...",
      sourceFilter: "Filtre de source",
      optional: "optionnel",
      sourceFilterPlaceholder: "ex. github, pagerduty...",
      create: "Cr\u00e9er",
      newSubscription: "Nouvel abonnement",
      noMatchingSubscriptions: "Aucun abonnement correspondant",
      noSubscriptions: "Aucun abonnement",
      noSubscriptionsDescription: "Cr\u00e9ez des abonnements pour router les \u00e9v\u00e9nements vers vos agents",
      swimlane: {
        title: "Couloirs d'\u00e9v\u00e9nements",
        subtitle: "Trace d'\u00e9v\u00e9nements par persona, ordonn\u00e9e dans le temps",
        empty: "Aucun \u00e9v\u00e9nement dans la fen\u00eatre s\u00e9lectionn\u00e9e"
      },
      connectionStatus: {
        connected: "Temps r\u00e9el : connect\u00e9",
        reconnecting: "Reconnexion au flux d'\u00e9v\u00e9nements\u2026",
        polling: "Interrogation pour les mises \u00e0 jour (diff\u00e9r\u00e9)"
      }
    },
    settingsPage: {
      title: "Param\u00e8tres",
      subtitle: "Configuration du compte et de la connexion cloud",
      account: "Compte",
      cloudConnection: "Connexion cloud",
      orchestrator: "Orchestrateur",
      notConfigured: "Non configur\u00e9",
      totalWorkers: "Workers totaux",
      queueLength: "Longueur de la file",
      activeExecutions: "Ex\u00e9cutions actives",
      notifications: {
        title: "Notifications",
        subtitle: "Alertes d'auto-r\u00e9paration et r\u00e9sum\u00e9s",
        weeklyDigest: "R\u00e9sum\u00e9 hebdomadaire de sant\u00e9",
        voice: {
          label: "Annoncer les nouvelles r\u00e9visions \u00e0 voix haute",
          preview: "Aper\u00e7u",
          newReviewRequest: "Nouvelle demande de r\u00e9vision",
          announcement: "Nouvelle r\u00e9vision {severity} de {persona}",
          unknownPersona: "un agent",
          severity: {
            critical: "critique",
            warning: "d'avertissement",
            info: "informative"
          }
        },
        severity: {
          critical: "Critique",
          high: "\u00c9lev\u00e9",
          medium: "Moyen",
          low: "Faible"
        }
      },
      providers: {
        title: "Fournisseurs de mod\u00e8les",
        subtitle: "Quels mod\u00e8les vos agents peuvent utiliser",
        allowed: "Autoris\u00e9",
        requests: "requ\u00eates"
      },
      rotation: {
        title: "Rotation des identifiants",
        subtitle: "\u00c9tat de rotation du coffre",
        hasPolicy: "Politique",
        noPolicy: "Sans politique",
        auto: "Auto",
        manual: "Manuel",
        anomaly: "Anomalie",
        next: "Prochaine",
        overdue: "En retard"
      }
    },
    legalPage: {
      title: "Mentions l\u00e9gales",
      heading: "Pages l\u00e9gales bient\u00f4t disponibles",
      description: "Notre politique de confidentialit\u00e9 et nos conditions d'utilisation sont en cours de finalisation. En attendant, si vous avez des questions, n'h\u00e9sitez pas \u00e0 nous contacter."
    },
    waitlist: {
      title: "Rejoindre la liste d\u2019attente",
      subtitle: "Soyez le premier inform\u00e9 de notre lancement pour",
      emailPlaceholder: "Entrez votre e-mail",
      earlyBeta: "Je veux un acc\u00e8s b\u00eata anticip\u00e9",
      submit: "Rejoindre la liste",
      joining: "Inscription...",
      success: "Vous \u00eates sur la liste !",
      successDesc: "Nous vous notifierons d\u00e8s que la version sera pr\u00eate.",
      duplicate: "D\u00e9j\u00e0 inscrit",
      duplicateDesc: "Vous \u00eates d\u00e9j\u00e0 sur la liste d'attente. Nous vous informerons d\u00e8s que ce sera pr\u00eat.",
      shareTitle: "Partager avec des amis",
      copied: "Copi\u00e9 !",
      copyLink: "Copier le lien",
      peopleWaiting: "personnes en attente",
      errorGeneric: "Quelque chose s\u2019est mal pass\u00e9. Veuillez r\u00e9essayer."
    },
    templatesPage: {
      title: "Mod\u00e8les d'agents",
      subtitle: "Parcourez {count} mod\u00e8les d'agents pr\u00eats \u00e0 l'emploi, regroup\u00e9s par type de travail. Choisissez une cat\u00e9gorie pour voir les mod\u00e8les \u00e0 l'int\u00e9rieur.",
      gridHeading: "Parcourir les mod\u00e8les par cat\u00e9gorie",
      gridDescription: "Les mod\u00e8les sont des Personas pr\u00e9configur\u00e9s que vous pouvez adopter en un clic. Chaque mod\u00e8le a d\u00e9j\u00e0 le prompt, les outils et les d\u00e9clencheurs configur\u00e9s pour une t\u00e2che sp\u00e9cifique \u2014 aucune configuration requise.",
      changeCategory: "Changer de cat\u00e9gorie",
      complexityAll: "Tous",
      complexityBasic: "Basique",
      complexityProfessional: "Professionnel",
      complexityEnterprise: "Entreprise",
      searchPlaceholder: "Rechercher des mod\u00e8les, outils, services...",
      searchAriaLabel: "Rechercher des mod\u00e8les",
      showingCount: "Affichage de {shown} sur {total} mod\u00e8les",
      noMatches: "Aucun mod\u00e8le ne correspond \u00e0 vos filtres",
      clearFilters: "Effacer les filtres",
      viewDetails: "Voir les d?tails",
      filterByComplexity: "Filtrer par complexit?",
      backToTemplates: "Retour aux mod?les",
      keyBenefits: "Avantages cl?s",
      triggers: "D?clencheurs",
      services: "Services",
      configuration: "Configuration",
      copied: "Copi?",
      copy: "Copier",
      copyFailed: "?chec de la copie",
      copyConfiguration: "Copier la configuration",
      getStartedTitle: "D?marrer avec ce mod?le",
      getStartedDescription: "Importez ce mod?le directement dans Personas, ou copiez la configuration pour la personnaliser vous-m?me.",
      openInPersonas: "Ouvrir dans Personas",
      moreTemplates: "Plus de mod?les {category}",
      appNotFoundTitle: "Application Personas introuvable",
      appNotFoundDescription: "Il semble que Personas ne soit pas encore install? sur votre appareil. T?l?chargez-le pour importer les mod?les directement, ou copiez la configuration pour l?installer manuellement.",
      templateNotFound: "Mod?le introuvable",
      templateNotFoundDescription: "Ce mod?le n?existe pas ou a ?t? retir?. Parcourez la galerie pour voir la collection actuelle.",
      browseTemplates: "Parcourir les mod?les",
      backToHome: "Retour ? l?accueil",
      customTrigger: "D?clencheur personnalis?"
    },
    roadmapSection: {
      inProgress: "En cours",
      next: "Suivant",
      planned: "Planifi\u00e9",
      completed: "Termin\u00e9",
      empty: "Rien de pr\u00e9vu pour le moment.",
      emptyHint: "Revenez bient\u00f4t \u2014 les prochains jalons appara\u00eetront ici au fur et \u00e0 mesure de leur planification.",
      heading: "Feuille de route",
      gradient: "produit",
      description: "O\u00f9 en est chaque domaine de Personas aujourd'hui \u2014 l'accomplissement de gauche \u00e0 droite, pas des promesses de haut en bas.",
      progress: {
        phasesComplete: "{completed} phases sur {total} termin\u00e9es",
        noneDone: "Aucune phase termin\u00e9e pour l\u2019instant",
        firstDone: "Phase 1 termin\u00e9e",
        rangeDone: "Phases 1-{count} termin\u00e9es",
        toGoOne: "Encore {count} phase",
        toGoOther: "Encore {count} phases"
      },
      areas: {
        i18n: {
          title: "Internationalisation",
          caption: "{count} locales, traduites \u00e0 la main \u2014 chaque drapeau \u00e9volue avec la couverture"
        },
        devices: {
          title: "Prise en charge des appareils",
          caption: "Personas sur chacune de vos machines"
        },
        collaboration: {
          title: "Collaboration",
          caption: "D'un seul op\u00e9rateur \u00e0 toute l'organisation"
        },
        platform: {
          title: "Plateforme principale",
          caption: "Mode dev, ex\u00e9cution cloud, connecteurs, installations sans effort"
        },
        templates: {
          title: "Galerie de mod\u00e8les",
          caption: "Agents de d\u00e9part par cat\u00e9gorie \u2014 d\u00e9comptes en direct de la galerie"
        }
      },
      bars: {
        europe: "Europe",
        asiaPacific: "Asie-Pacifique",
        southAsia: "Asie du Sud",
        middleEast: "Moyen-Orient \u00b7 RTL",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        web: "Web",
        mobileCompanion: "Application mobile compagnon",
        solo: "Solo",
        team: "\u00c9quipe",
        enterprise: "Entreprise",
        devMode: "Mode dev",
        connectors: "Connecteurs",
        cloudExecution: "Ex\u00e9cution cloud",
        installersUpdates: "Installateurs et mises \u00e0 jour",
        allCategories: "Toutes les cat\u00e9gories",
        devops: "DevOps",
        productivity: "Productivit\u00e9",
        communication: "Communication",
        marketing: "Marketing",
        research: "Recherche",
        security: "S\u00e9curit\u00e9",
        financeCluster: "Finance \u00b7 Ventes \u00b7 Support \u00b7 Juridique"
      },
      detail: {
        localeOne: "{n} langue",
        localeOther: "{n} langues",
        shipped: "disponible",
        inDevelopment: "en d\u00e9veloppement",
        thisSite: "ce site",
        preview: "aper\u00e7u",
        sharedAgents: "agents partag\u00e9s",
        ssoAudit: "SSO \u00b7 audit",
        instantPreview: "aper\u00e7u instantan\u00e9",
        services: "{n} services",
        runs247: "ex\u00e9cution 24/7",
        autoUpdate: "mise \u00e0 jour automatique",
        templatesTotal: "{n} / {total} mod\u00e8les"
      },
      barAria: "{label} : {pct}%"
    },
    featureVoting: {
      eyebrow: "Communaut\u00e9",
      heading: "Votez pour",
      headingGradient: "la suite",
      subheading: "Aidez-nous \u00e0 prioriser. Choisissez les fonctionnalit\u00e9s qui comptent le plus pour vous et fa\u00e7onnez l'avenir de Personas.",
      features: {
        macos: {
          title: "Prise en charge de macOS",
          description: "Version macOS enti\u00e8rement native avec optimisation Apple Silicon, int\u00e9gration Spotlight et contr\u00f4les d\u2019agents dans la barre de menus."
        },
        i18n: {
          title: "Internationalisation",
          description: "Instructions d'agent multilingues, interface localis\u00e9e, et planification tenant compte des fuseaux r\u00e9gionaux pour les \u00e9quipes internationales."
        },
        dashboard: {
          title: "Tableau de bord web",
          description: "Tableau de bord dans le navigateur pour la surveillance des agents en temps r\u00e9el, l\u2019historique d\u2019ex\u00e9cution et la gestion de flotte depuis n\u2019importe quel appareil."
        },
        enterprise: {
          title: "Projets d\u2019entreprise",
          description: "Espaces de travail multilocataires, RBAC, journaux d\u2019audit, int\u00e9gration SSO et mod\u00e8les d\u2019agents partag\u00e9s dans toute votre organisation."
        }
      },
      voteAria: "Voter pour {feature}",
      commentsToggleAria: "Afficher les commentaires pour {feature}",
      discussion: "Discussion",
      noComments: "Aucun commentaire pour l'instant. Soyez le premier \u00e0 partager votre avis.",
      replying: "R\u00e9ponse en cours",
      reply: "R\u00e9pondre",
      addCommentPlaceholder: "Ajouter un commentaire...",
      writeReplyPlaceholder: "\u00c9crire une r\u00e9ponse...",
      sendCommentAria: "Envoyer le commentaire",
      summary: {
        totalVotes: "{count} votes au total",
        commentOne: "{count} commentaire",
        commentOther: "{count} commentaires",
        boostOne: "{count} vote",
        boostOther: "{count} votes",
        live: "En direct"
      },
      boost: {
        label: "Booster",
        toggleAria: "Booster {feature}",
        tierAria: "Booster avec {amount}"
      },
      request: {
        title: "Une autre id\u00e9e en t\u00eate ?",
        subtitle: "Proposer une fonctionnalit\u00e9",
        placeholder: "D\u00e9crivez la fonctionnalit\u00e9 que vous aimeriez voir...",
        submitAria: "Envoyer la suggestion",
        success: "Merci ! Votre suggestion a \u00e9t\u00e9 enregistr\u00e9e.",
        errorNetwork: "Erreur r\u00e9seau \u2014 veuillez v\u00e9rifier votre connexion et r\u00e9essayer.",
        errorRateLimit: "Vous envoyez des suggestions trop rapidement. Veuillez patienter un instant.",
        errorInvalid: "Veuillez saisir une suggestion valide (1\u20131000 caract\u00e8res).",
        errorGeneric: "Une erreur s\u2019est produite lors de l\u2019enregistrement de votre suggestion. Veuillez r\u00e9essayer.",
        sponsor: "Parrainer cette demande"
      },
      timeAgo: {
        justNow: "\u00e0 l'instant",
        minutes: "il y a {n} min",
        hours: "il y a {n} h",
        days: "il y a {n} j"
      }
    },
    eventBusSection: {
      dynamicSwarm: "Essaim dynamique",
      latencyLanes: "Voies de latence",
      ephemeralConnections: "Connexions \u00e9ph\u00e9m\u00e8res",
      queueDepth: "Profondeur de file et d\u00e9bit"
    },
    guide: {
      title: "Utilisateur",
      subtitle: "Tout ce que vous devez savoir sur Personas \u2014 de votre premier agent aux pipelines multi-agents avanc\u00e9s.",
      searchPlaceholder: "Rechercher parmi 100+ sujets...",
      searchInCategory: "Rechercher dans cette cat\u00e9gorie...",
      topics: "sujets",
      backToGuide: "Retour au Guide",
      showAllResults: "Afficher tous les r\u00e9sultats",
      noResults: "Aucun sujet trouv\u00e9. Essayez un autre terme de recherche.",
      stillQuestions: "Encore des questions ?",
      joinDiscord: "Rejoignez notre Discord",
      copyAnchor: "Copier le lien de la section",
      categories: {
        "getting-started": "Prise en main",
        "agents-prompts": "Agents et Prompts",
        triggers: "D\u00e9clencheurs et planification",
        credentials: "Identifiants et s\u00e9curit\u00e9",
        pipelines: "Pipelines et \u00e9quipes",
        testing: "Tests et Optimisation",
        memories: "M\u00e9moires et connaissances",
        monitoring: "Surveillance et co\u00fbts",
        deployment: "D\u00e9ploiement et int\u00e9grations",
        troubleshooting: "D\u00e9pannage"
      },
      categoryDescriptions: {
        "getting-started": "Installez Personas, cr\u00e9ez votre premier agent et apprenez les bases en moins de 10 minutes.",
        credentials: "Connectez-vous aux services en toute s\u00e9curit\u00e9. Comprenez le coffre-fort chiffr\u00e9 et comment vos donn\u00e9es restent en s\u00e9curit\u00e9.",
        "agents-prompts": "Cr\u00e9ez, configurez et affinez vos agents IA. Ma\u00eetrisez les modes de prompt simples et structur\u00e9s.",
        triggers: "Configurez quand et comment vos agents s'ex\u00e9cutent \u2014 planifications, webhooks, surveillance de fichiers, et plus encore.",
        pipelines: "Connectez les agents entre eux dans des pipelines visuels. Cr\u00e9ez des flux de travail multi-agents sur le canevas d'\u00e9quipe.",
        memories: "Vos agents apprennent et se souviennent. G\u00e9rez ce qu'ils savent et comment ils utilisent leur exp\u00e9rience pass\u00e9e.",
        monitoring: "Suivez chaque ex\u00e9cution en temps r\u00e9el. Voyez ce que font vos agents, leur performance et leur co\u00fbt.",
        testing: "Ex\u00e9cutez des tests d'ar\u00e8ne, des comparaisons A/B, et laissez le syst\u00e8me de g\u00e9nome faire \u00e9voluer vos meilleurs prompts.",
        deployment: "D\u00e9ployez des agents sur le cloud, connectez-vous \u00e0 GitHub Actions, GitLab CI, et aux workflows n8n.",
        troubleshooting: "R\u00e9solvez les probl\u00e8mes courants, comprenez les messages d'erreur, et remettez vos agents sur les rails."
      }
    },
    featurePages: {
      orchestration: {
        headline: "Des agents qui travaillent ensemble",
        description: "Cr\u00e9ez des pipelines visuels o\u00f9 plusieurs agents collaborent sur des t\u00e2ches complexes. Le r\u00e9sultat d'un agent alimente le suivant \u2014 pas de code de liaison, pas d'\u00e9tapes manuelles, aucune limite \u00e0 ce que vous pouvez orchestrer.",
        cta: "Cr\u00e9ez votre premier pipeline"
      },
      security: {
        headline: "Vos secrets restent les v\u00f4tres",
        description: "Chaque mot de passe, cl\u00e9 API et jeton d'acc\u00e8s est chiffr\u00e9 sur votre appareil gr\u00e2ce au chiffrement AES-256 de niveau bancaire. Vos identifiants sont stock\u00e9s dans le coffre-fort s\u00e9curis\u00e9 de votre propre syst\u00e8me d'exploitation \u2014 rien n'est jamais envoy\u00e9 au cloud.",
        cta: "S\u00e9curisez vos connexions"
      },
      "multi-provider": {
        headline: "Non li\u00e9 \u00e0 une seule IA",
        description: "Utilisez Claude, OpenAI, Gemini, ou ex\u00e9cutez des mod\u00e8les localement avec Ollama. Basculez librement entre fournisseurs, attribuez diff\u00e9rents mod\u00e8les \u00e0 diff\u00e9rents agents, et si un fournisseur tombe en panne \u2014 vos agents basculent automatiquement vers un autre.",
        cta: "Choisissez votre IA"
      },
      genome: {
        headline: "Vos agents deviennent plus intelligents automatiquement",
        description: "Au lieu d'ajuster manuellement les prompts pendant des heures, laissez le syst\u00e8me Genome le faire pour vous. Il teste des variations, garde ce qui fonctionne, et \u00e9limine le reste \u2014 comme une s\u00e9lection naturelle pour vos agents IA.",
        cta: "Faites \u00e9voluer vos agents"
      }
    },
    blogPage: {
      eyebrow: "Blog",
      heading: "Actualit?s et",
      headingGradient: "analyses",
      description: "Annonces produit, analyses techniques, tutoriels et cas d?usage concrets par l??quipe Personas.",
      searchPlaceholder: "Rechercher des articles...",
      searchAriaLabel: "Rechercher dans le blog",
      clearSearch: "Effacer la recherche",
      showing: "Affichage",
      of: "sur",
      posts: "articles",
      noMatches: "Aucun article ne correspond ? votre recherche",
      clearFilters: "Effacer tous les filtres",
      allPosts: "Tous les articles",
      featured: "? la une",
      min: "min",
      minRead: "min de lecture",
      read: "Lire",
      readArticle: "Lire l?article",
      article: "Article",
      backToBlog: "Retour au blog",
      published: "Publi?",
      continueExploring: "Continuer l?exploration",
      seeItInAction: "Voir en action",
      browseTemplates: "Parcourir les mod?les",
      postNotFound: "Article introuvable",
      postNotFoundDescription: "Nous n?avons pas trouv? l?article recherch?. Il a peut-?tre ?t? renomm? ou d?plac?.",
      browseAllPosts: "Voir tous les articles",
      backToHome: "Retour ? l?accueil"
    },
    accessibility: {
      changeLanguage: "Changer de langue",
      selectLanguage: "S\u00e9lectionner la langue",
      selectTheme: "S\u00e9lectionner le th\u00e8me : {name}"
    },
    pageNav: {
      onThisPage: "Sur cette page",
      closeMenu: "Fermer le menu"
    },
    themes: {
      midnight: "Minuit",
      cyan: "Cyan",
      bronze: "Bronze",
      frost: "Givre",
      purple: "Violet",
      pink: "Rose",
      red: "Rouge",
      matrix: "Matrix",
      light: "Clair",
      ice: "Glace",
      news: "Journal"
    },
    themeDescriptions: {
      midnight: "Th\u00e8me sombre bleu marine profond",
      cyan: "Th\u00e8me sombre \u00e0 accent sarcelle",
      bronze: "Th\u00e8me sombre ambr\u00e9 chaud",
      frost: "Th\u00e8me sombre argent\u00e9 froid",
      purple: "Th\u00e8me sombre \u00e0 accent violet",
      pink: "Th\u00e8me sombre \u00e0 accent magenta",
      red: "Th\u00e8me sombre \u00e0 accent cramoisi",
      matrix: "Th\u00e8me sombre vert n\u00e9on",
      light: "Th\u00e8me clair classique",
      ice: "Th\u00e8me clair bleu froid",
      news: "Th\u00e8me clair \u00e0 contraste \u00e9lev\u00e9"
    },
    tour: {
      launch: "Lancer la visite",
      play: "Lecture",
      pause: "Pause",
      next: "\u00c9tape suivante",
      previous: "\u00c9tape pr\u00e9c\u00e9dente",
      exit: "Quitter la visite",
      volume: "Volume",
      skipTo: "Aller \u00e0",
      chapterHome: "Accueil",
      begin: "Commencer",
      skip: "Passer",
      introTitle: "Rencontrez Athena, votre guide",
      introBody: "Athena va vous pr\u00e9senter Personas en environ une minute \u2014 ce qu'est un persona, comment il fonctionne, et comment d\u00e9marrer. Mettez en pause, passez, ou rejouez n'importe quelle \u00e9tape.",
      bridgePrompt: "Voil\u00e0 Personas en un coup d'\u0153il. Voulez-vous approfondir et voir comment chaque \u00e9l\u00e9ment fonctionne r\u00e9ellement, fonctionnalit\u00e9 par fonctionnalit\u00e9 ?",
      bridgeConfirm: "Voir les fonctionnalit\u00e9s",
      bridgeDismiss: "Plus tard peut-\u00eatre",
      bridgeToDashboardPrompt: "Voyez maintenant Personas en action \u2014 essayez le tableau de bord de d\u00e9monstration.",
      bridgeToDashboardConfirm: "Ouvrir le tableau de bord",
      step1: "D\u00e9couvrez un persona \u2014 un seul agent IA avec une identit\u00e9 stable et un ensemble de comp\u00e9tences composables. Donnez-lui les outils dont il a besoin, de Gmail et Slack \u00e0 GitHub et votre calendrier, et il apprend \u00e0 agir sur tous ces fronts. Un persona, de multiples t\u00e2ches, tout fonctionnant ensemble.",
      step2: "Maintenant, confiez \u00e0 ce persona un objectif en langage simple, comme \"trier mon Gmail\". Observez son raisonnement en temps r\u00e9el : il lit la demande, la d\u00e9compose en \u00e9tapes, et planifie son approche avant de toucher \u00e0 quoi que ce soit. Puis il ex\u00e9cute \u2014 et vous montre chaque action au fur et \u00e0 mesure.",
      step3: "Un agent n'est utile que pour les moments o\u00f9 il se r\u00e9veille. Les Personas peuvent \u00eatre d\u00e9clench\u00e9s de dix fa\u00e7ons \u2014 sur un planning, par un \u00e9v\u00e9nement, en interrogeant une source, ou depuis un webhook entrant. L'orchestrateur route chaque signal vers le bon agent et garde tout en mouvement, se r\u00e9parant lui-m\u00eame si une \u00e9tape \u00e9choue.",
      step4: "Tout cela repose sur une plateforme unique con\u00e7ue pour la confiance et l'\u00e9chelle. Un coffre-fort chiffr\u00e9 prot\u00e8ge vos identifiants, des mod\u00e8les pr\u00eats \u00e0 l'emploi vous font d\u00e9marrer rapidement, et l'option d'apporter votre propre mod\u00e8le vous laisse le contr\u00f4le de l'IA. Surveillance en direct, laboratoire d'exp\u00e9rimentation, et orchestration d'\u00e9quipe compl\u00e8tent le tout \u2014 six piliers, un seul endroit.",
      step5: "Pr\u00eat \u00e0 mettre un persona au travail ? Personas fonctionne sur votre propre machine via Claude Code \u2014 l'outil en ligne de commande d'Anthropic \u2014 pour que vous restiez priv\u00e9 et en contr\u00f4le. T\u00e9l\u00e9chargez l'installateur pour Windows 11, connectez le CLI, et votre premier agent est actif en quelques minutes.",
      features1: "Chaque agent na\u00eet d'une seule phrase d'intention. Personas lit ce que vous voulez et remplit une matrice de persona \u00e0 huit dimensions \u2014 t\u00e2ches, m\u00e9moire, d\u00e9clencheurs, r\u00e9vision, et plus \u2014 ne vous interrogeant que lorsqu'une d\u00e9cision est r\u00e9ellement n\u00e9cessaire. En quelques instants, une id\u00e9e vague devient un agent structur\u00e9 et ex\u00e9cutable.",
      features2: "Puis il commence \u00e0 apprendre. Chaque t\u00e2che qu'il ex\u00e9cute laisse une trace, et les le\u00e7ons importantes remontent dans ses couches de m\u00e9moire tandis que le bruit se d\u00e9pose au fond. Plus votre agent travaille, plus il devient pr\u00e9cis et conscient du contexte.",
      features3: "Le travail r\u00e9el comporte des pannes, donc Personas est con\u00e7u pour se r\u00e9tablir. Quand une \u00e9tape \u00e9choue, le circuit ne s'arr\u00eate pas \u2014 il diagnostique le probl\u00e8me, r\u00e9pare le chemin, et retente de lui-m\u00eame. Pas d'alertes \u00e0 3 heures du matin, pas de red\u00e9marrages manuels ; le flux de travail continue tout simplement.",
      features4: "Et vous ne perdez jamais rien de vue. Chaque ex\u00e9cution, message, \u00e9v\u00e9nement, et m\u00e9moire circule en direct via un seul tableau d'observabilit\u00e9 \u2014 sparklines, co\u00fbts, et statuts, tout en temps r\u00e9el. Transparence totale, z\u00e9ro configuration.",
      features5: "Les bons agents sont rarement parfaits du premier coup, c'est pourquoi le Lab est l'endroit o\u00f9 vous les affinez. Discutez avec un persona pour le coacher, opposez deux versions dans l'ar\u00e8ne, faites-le \u00e9voluer \u00e0 travers des g\u00e9n\u00e9rations, ou \u00e9valuez-le sur les dimensions qui comptent. Chaque am\u00e9lioration que vous conservez est versionn\u00e9e et r\u00e9versible.",
      features6: "Personas est livr\u00e9 avec six plugins sp\u00e9cialis\u00e9s, chacun un espace de travail autonome que vos agents peuvent piloter. Prenez Dev Tools : il transforme un persona en co\u00e9quipier de code qui ex\u00e9cute des t\u00e2ches, lit le r\u00e9sultat, et it\u00e8re. Changez d'onglet et vous rencontrez un autre sp\u00e9cialiste \u2014 tous partageant les m\u00eames identifiants et la m\u00eame m\u00e9moire.",
      dashboardHome: "Bienvenue au centre de contr\u00f4le \u2014 toute votre flotte sur un seul \u00e9cran. En haut, les signes vitaux : taux de r\u00e9ussite, ex\u00e9cutions en cours, agents actifs, alertes ouvertes, et r\u00e9visions en attente pour vous. En dessous, l'optimiseur fait remonter un correctif \u00e0 fort impact \u00e0 la fois \u2014 en ce moment, un changement de routage qui r\u00e9duit les co\u00fbts sans toucher \u00e0 la qualit\u00e9. Les deux panneaux en dessous suivent la sant\u00e9 de chaque agent et les nouvelles m\u00e9moires qu'ils ont apprises et souhaitent promouvoir. Puis l'image en direct : chaque ex\u00e9cution au fur et \u00e0 mesure qu'elle arrive \u00e0 gauche, quatorze jours de trafic et d'erreurs \u00e0 droite. La carte thermique montre les ex\u00e9cutions par agent, jour par jour, et la ligne du bas compl\u00e8te le tout \u2014 vos meilleurs performeurs, les prochaines routines planifi\u00e9es, et chaque rotation d'identifiants. Une seule page, toute l'op\u00e9ration.",
      dashboardAgents: "Voici votre effectif. Chaque carte est un persona \u2014 un seul agent avec une identit\u00e9 et un ensemble de comp\u00e9tences qu'il peut composer. Le portrait est g\u00e9n\u00e9r\u00e9 pour correspondre \u00e0 son caract\u00e8re ; en dessous, les statistiques en direct : taux de r\u00e9ussite, ex\u00e9cutions, et d\u00e9penses. Cliquez sur Ex\u00e9cuter pour en lancer un \u00e0 la demande, ou ouvrez D\u00e9tails pour inspecter sa configuration et son historique r\u00e9cent. Cinq agents ici, chacun faisant tranquillement bien son travail.",
      dashboardExecutions: "Chaque ex\u00e9cution r\u00e9alis\u00e9e par la flotte se trouve ici, la plus r\u00e9cente en premier. Le tableau affiche la persona, le statut, la dur\u00e9e, le co\u00fbt et l'heure de d\u00e9marrage \u2014 filtrez sur les seuls \u00e9checs ou celles encore en cours. Cliquez sur une ligne et l'ex\u00e9cution compl\u00e8te s'ouvre : une bande de m\u00e9triques, toute explication d'erreur et la sortie en direct diffus\u00e9e ligne par ligne, exactement telle que l'agent l'a produite.",
      dashboardEvents: "Les agents ne travaillent pas isol\u00e9ment \u2014 ils r\u00e9agissent aux \u00e9v\u00e9nements. Voici le bus d'\u00e9v\u00e9nements : chaque signal traversant le syst\u00e8me, des plannings et webhooks aux messages entre agents. Chaque ligne montre le type d'\u00e9v\u00e9nement, sa source, son statut, et depuis combien de temps il s'est d\u00e9clench\u00e9. Les \u00e9v\u00e9nements \u00e9chou\u00e9s peuvent \u00eatre r\u00e9essay\u00e9s sur place, et les \u00e9v\u00e9nements li\u00e9s s'encha\u00eenent pour que vous puissiez suivre une seule cascade de bout en bout.",
      dashboardReviews: "Certaines d\u00e9cisions n\u00e9cessitent un humain. Quand un agent rencontre quelque chose qu'il ne devrait pas d\u00e9cider seul, il se met en pause et route la d\u00e9cision ici. Chaque \u00e9l\u00e9ment porte le persona, le contexte, et l'action qu'il propose \u2014 approuvez-la, rejetez-la, ou passez pour plus tard, par clic ou par clavier. Rien de risqu\u00e9 n'est d\u00e9ploy\u00e9 sans votre validation, et la file d'attente garde le reste de la flotte en mouvement pendant que vous d\u00e9cidez.",
      roadmap1: "Voici o\u00f9 nous en sommes maintenant : chaque phase de la feuille de route est not\u00e9e selon son statut au fur et \u00e0 mesure de sa livraison.",
      roadmap2: "La suite d\u00e9pend de vous \u2014 votez pour les fonctionnalit\u00e9s que vous voulez le plus, et les meilleures id\u00e9es fa\u00e7onnent ce que nous construisons.",
      roadmap3: "Et voici tout ce qui a d\u00e9j\u00e0 \u00e9t\u00e9 livr\u00e9 \u2014 chaque version pr\u00e9sent\u00e9e dans l'ordre, la plus r\u00e9cente en premier."
    },
    playgroundPage: {
      heroHeading: "Voyez les agents en",
      heroHeadingGradient: "action",
      heroDescription: "Choisissez une t\u00e2che ci-dessous et regardez comment un agent Personas la d\u00e9compose, s\u00e9lectionne les bons outils et livre des r\u00e9sultats \u2014 le tout en quelques secondes.",
      ctaTitle: "Pr\u00eat \u00e0 cr\u00e9er vos propres agents ?",
      ctaDescription: "T\u00e9l\u00e9chargez Personas et cr\u00e9ez des agents autonomes qui se connectent \u00e0 vos outils, suivent vos r\u00e8gles, et s'ex\u00e9cutent selon votre planning.",
      ctaDownload: "T\u00e9l\u00e9charger Personas",
      ctaBrowseTemplates: "Parcourir les mod\u00e8les",
      selectTask: "S\u00e9lectionnez une t\u00e2che ci-dessus pour d\u00e9marrer la simulation",
      simulatedExecution: "Ex\u00e9cution simul\u00e9e",
      statusExecuting: "en cours\u2026",
      statusComplete: "termin\u00e9",
      statusReady: "pr\u00eat",
      chromeTitle: "agent-playground \u2014 en direct",
      reset: "R\u00e9initialiser"
    }
  };
