import type { Translations } from './en';

export const de: Translations = {
    notFound: {
      title: "Seite nicht gefunden",
      description: "Die gesuchte Seite existiert nicht oder wurde verschoben. Versuchen Sie stattdessen eine davon:",
      home: "Startseite",
      getStarted: "Erste Schritte",
      backToHome: "Zur\u00fcck zur Startseite"
    },
    errorPage: {
      title: "Diese Seite ist auf einen Fehler gesto\u00dfen",
      description: "Beim Laden dieser Seite ist etwas schiefgelaufen. Unser Team wurde benachrichtigt \u2014 versuchen Sie es erneut oder kehren Sie zur Startseite zur\u00fcck.",
      tryAgain: "Erneut versuchen",
      errorReference: "Fehlerreferenz",
      copyReference: "Fehlerreferenz kopieren",
      backToHome: "Zur\u00fcck zur Startseite"
    },
    nav: {
      home: "Personas",
      how: "So funktioniert es",
      connections: "Verbindungen",
      roadmap: "Roadmap",
      templates: "Vorlagen",
      download: "Herunterladen",
      dashboard: "Dashboard",
      features: "Funktionen",
      guide: "Anleitung",
      useCases: "Anwendungsf\u00e4lle",
      tour: "Tour",
      security: "Sicherheit",
      blog: "Blog",
      changelog: "Changelog",
      pricing: "Preise",
      menu: "Men\u00fc"
    },
    compareSection: {
      heading: "Alles ist",
      headingGradient: "kostenlos",
      description: "Die Desktop-App und jede Funktion unten bleiben f\u00fcr immer kostenlos. Keine Stufen, keine Geb\u00fchren pro Platz \u2013 einfach eine vollst\u00e4ndige Agentenplattform, die auf deinem Rechner l\u00e4uft.",
      offerBadges: [
        "F\u00fcr immer kostenlos",
        "Selbst gehostet",
        "Kein Aufschlag pro Ausf\u00fchrung",
        "Open Source"
      ],
      offerBody: "Personas l\u00e4uft auf Ihrem eigenen Rechner. Kein Aufschlag f\u00fcr Orchestrierung und keine Preise pro Sitzplatz. Bezahlte Cloud- und Priority-Support-Optionen sind optional, nicht erforderlich.",
      ctaLabel: "Kostenlos loslegen",
      readGuide: "Anleitung lesen",
      groups: {
        "agents-prompts": {
          title: "Agenten & Prompts",
          tagline: "Auf Nutzer ausgerichtet",
          concepts: [
            "Persona-Erstellung in nat\u00fcrlicher Sprache",
            "40+ \u00fcbernehmbare Vorlagen",
            "BYOM \u2013 Claude oder lokales Ollama",
            "Strukturierte + einfache Prompt-Modi",
            "Dauerhafter Agentenspeicher"
          ]
        },
        triggers: {
          title: "Orchestrierung",
          tagline: "Jeder Weg, einen Agenten zu starten",
          concepts: [
            "Zeitplan (Cron)",
            "Webhook-Endpunkte",
            "Datei\u00fcberwachung",
            "Zwischenablage-Monitor",
            "Ketten-/Ereignis-Trigger",
            "Zusammengesetzte Bedingungen"
          ]
        },
        pipelines: {
          title: "Pipelines & Teams",
          tagline: "Visuelle agentische Zusammenarbeit",
          concepts: [
            "Visuelle Team-Leinwand",
            "Datenfluss-Verbindungen",
            "Live-Ereignisbus",
            "Selbstheilende Ausf\u00fchrung",
            "Pipeline-Wiedergabe + Zeitreise"
          ]
        },
        credentials: {
          title: "Zugangsdaten & Sicherheit",
          tagline: "Deine Geheimnisse bleiben auf deinem Rechner",
          concepts: [
            "AES-256-GCM-Tresor",
            "OS-eigener Schl\u00fcsselbund",
            "KI-gest\u00fctztes OAuth",
            "Automatische Token-Erneuerung",
            "Keine Telemetrie, lokal zuerst"
          ]
        },
        monitoring: {
          title: "\u00dcberwachung",
          tagline: "Jeden Lauf sehen, kalkulieren und steuern",
          concepts: [
            "Live-Observability-Dashboard",
            "Span-Tracing pro Ausf\u00fchrung",
            "Kostenzuordnung pro Modell",
            "Warteschlangen f\u00fcr menschliche Pr\u00fcfung",
            "Budget-Warnungen + Durchsetzung"
          ]
        },
        testing: {
          title: "Test-Labor",
          tagline: "Automatisierte Evolution",
          concepts: [
            "Arena f\u00fcr A/B-Tests",
            "Prompt-Versionierung + Diffs",
            "Fitness-Bewertung",
            "Zucht-Zyklen",
            "Mock-Tool-Sandboxes"
          ]
        }
      }
    },
    footer: {
      tagline: "KI-Agenten, die f\u00fcr Sie arbeiten",
      motto: "KI-Agenten, die Ihre Arbeit automatisieren, damit Sie sich auf das Wichtigste konzentrieren k\u00f6nnen.",
      product: "Produkt",
      resources: "Ressourcen",
      legal: "Rechtliches",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
      copyright: "Personas. Alle Rechte vorbehalten.",
      slogan: "Automatisieren Sie Ihre Arbeit. Gewinnen Sie Ihre Zeit zur\u00fcck."
    },
    pricing: {
      local: "Lokal",
      cloud: "Cloud",
      enterprise: "Unternehmen",
      downloadLocal: "Lokal herunterladen",
      goCloud: "Zur Cloud",
      contactSales: "Vertrieb kontaktieren",
      comingSoon: "Demn\u00e4chst",
      bestFor: "Ideal f\u00fcr",
      forever: "f\u00fcr immer",
      mo: "/Monat",
      custom: "Individuell",
      bestForLocal: "Einzelentwickler zum Einstieg",
      bestForCloud: "Schnell arbeitende Einzelteams",
      bestForEnterprise: "Organisationen mit Compliance- und Skalierungsanforderungen",
      features: {
        unlimitedLocalAgents: "Unbegrenzte lokale Agenten",
        localEventBus: "Lokaler Event-Bus & Scheduler",
        fullObservability: "Vollst\u00e4ndiges Observability-Dashboard",
        designEngine: "Design-Engine",
        teamCanvasLocal: "Team-Canvas (lokal)",
        everythingInFree: "Alles im Free-Plan",
        cloudWorkers3: "3 Cloud-Worker",
        executions1000: "1.000 Ausf\u00fchrungen/Monat",
        events10000: "10.000 Events/Monat",
        burstAutoScaling: "Burst-Auto-Scaling",
        everythingInPro: "Alles im Pro-Plan",
        ssoSaml: "SSO \u00fcber SAML & OIDC",
        multiTenantRbac: "Multi-Tenant-Workspaces mit RBAC",
        auditTrailExport: "Ausf\u00fchrungs-Audit-Trail-Export",
        dedicatedWorkers: "Dedizierte Cloud-Worker & SLA",
        prioritySupport: "Priorit\u00e4ts-Support"
      }
    },
    hero: {
      title: "KI-Agenten, die auf Ihrem Rechner laufen",
      subtitle: "Eine Persona, viele F\u00e4higkeiten. Erstellen Sie einen Assistenten mit stabiler Identit\u00e4t und stellen Sie die Aufgaben zusammen, die er erledigt \u2014 F\u00e4higkeiten hinzuf\u00fcgen, aktivieren oder entfernen, ohne von vorne zu beginnen.",
      downloadCta: "Herunterladen",
      trustLine: "Keine Anmeldung, keine Kreditkarte. L\u00e4uft auf Ihrem Rechner. Keine Telemetrie.",
      cta: "Loslegen",
      badge: "KI-Agenten-Plattform",
      headingLine1: "Intelligente Agenten",
      headingLine2: "die f\u00fcr Sie arbeiten",
      description: "Entwerfen Sie Agenten in nat\u00fcrlicher Sprache. Orchestrieren Sie sie lokal oder in der Cloud.",
      descriptionBold: "Keine Workflow-Diagramme. Keine Agenten-Schw\u00e4rme. Kein Code.",
      mode1: "Komponierbare F\u00e4higkeiten",
      mode2: "Einfache Einrichtung",
      mode3: "Kostenlos",
      mode4: "Multi-Provider-KI",
      mode5: "Selbstverbessernd",
      viewOnGithub: "Auf GitHub ansehen",
      downloadForWindows: "F\u00fcr Windows herunterladen",
      joinWaitlist: "Windows-Warteliste beitreten",
      commandCenter: "Kommandozentrale",
      adoptionSnapshot: "Nutzungs\u00fcberblick",
      scroll: "Scrollen",
      phases: "PHASEN",
      publicBeta: "\u00d6FFENTLICHE BETA",
      agents: "Agenten",
      executions: "Ausf\u00fchrungen",
      connectors: "Konnektoren",
      templates: "Vorlagen"
    },
    heroTransition: {
      ariaLabel: "Kerns\u00e4ulen des Produkts",
      speed: "Schnell",
      privacy: "Privat",
      scale: "Skalierbar",
      value: "Eine Persona, viele F\u00e4higkeiten \u2014 eine stabile Identit\u00e4t mit einem komponierbaren Satz von Aufgaben, die dort l\u00e4uft, wo Ihre Daten liegen, und unter Ihrer Kontrolle bleibt.",
      cta: "In Aktion erleben"
    },
    sections: {
      vision: "Vision",
      pricing: "Preise",
      faq: "FAQ",
      features: "Funktionen",
      useCases: "Anwendungsf\u00e4lle",
      eventBus: "Event-Bus",
      download: "Herunterladen"
    },
    common: {
      skipToMain: "Zum Hauptinhalt springen",
      loading: "Wird geladen...",
      cancel: "Abbrechen",
      close: "Schlie\u00dfen",
      back: "Zur\u00fcck",
      next: "Weiter",
      save: "Speichern",
      delete: "L\u00f6schen",
      edit: "Bearbeiten",
      search: "Suchen",
      noResults: "Keine Ergebnisse gefunden",
      signOut: "Abmelden",
      signingOut: "Wird abgemeldet\u2026",
      signIn: "Anmelden",
      notifyMe: "Benachrichtigen",
      step: "Schritt",
      learnMore: "Mehr erfahren",
      viewAll: "Alle anzeigen",
      status: "Status",
      active: "aktiv",
      idle: "inaktiv",
      total: "gesamt",
      checking: "Wird gepr\u00fcft\u2026",
      connected: "Verbunden",
      disconnected: "Getrennt",
      demo: "Demo",
      viewFullSite: "Vollst\u00e4ndige Website anzeigen"
    },
    useCasesSection: {
      heading: "Eine Persona,",
      headingGradient: "viele F\u00e4higkeiten",
      integrations: "Integrationen",
      patterns: "F\u00e4higkeiten",
      description: "Jede Persona tr\u00e4gt eine stabile Identit\u00e4t und einen komponierbaren Satz von F\u00e4higkeiten \u2014 klicken Sie auf eine Integration, um die Aufgaben zu erkunden, die eine Persona \u00fcbernehmen kann.",
      autoplayHint: "Automatischer Wechsel \u2014 klicken zum Stoppen.",
      browseTemplates: "Alle Vorlagen durchsuchen",
      whatCanAutomate: "Was Personas automatisieren kann",
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
        name: "Kalender",
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
      heading: "H\u00e4ufig",
      headingGradient: "gestellte Fragen",
      subtitle: "Alles, was Sie \u00fcber den Einstieg mit Personas wissen m\u00fcssen.",
      stillQuestions: "Noch Fragen?",
      joinDiscord: "Discord beitreten",
      discordSubtitle: "Treten Sie unserer Discord-Community f\u00fcr Hilfe und Diskussion bei.",
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
      heading: "Bereit, Ihren",
      headingGradient: "Agenten zu bauen?",
      subtitle: "Laden Sie Personas kostenlos herunter. Starten Sie in Minuten.",
      downloadInstaller: "Installer herunterladen",
      joinWaitlist: "Warteliste beitreten",
      connectCli: "Claude CLI verbinden",
      launchAgent: "Ersten Agenten starten",
      exploreFirst: "Zuerst M\u00f6glichkeiten erkunden",
      requiresCli: "Erfordert Claude CLI",
      installerSize: "12 MB Installer",
      noTelemetry: "Keine Telemetrie",
      localFirst: "Local-First-Sicherheit",
      windows: "Windows",
      macos: "macOS",
      linux: "Linux"
    },
    dashboard: {
      title: "Dashboard",
      overview: "\u00dcberblick",
      agents: "Agenten",
      executions: "Ausf\u00fchrungen",
      events: "Events",
      reviews: "Reviews",
      observability: "Observability",
      knowledge: "Wissen",
      settings: "Einstellungen",
      leaderboard: "Rangliste",
      sla: "SLA",
      incidents: "Vorf\u00e4lle",
      health: "Zustand",
      messages: "Nachrichten",
      more: "Mehr",
      greeting: {
        morning: "Guten Morgen",
        afternoon: "Guten Tag",
        evening: "Guten Abend"
      },
      agentsStatus: "Das passiert mit Ihren Agenten",
      lastSeen: "Zuletzt gesehen",
      greetingFallback: "willkommen",
      pendingReviews: "ausstehende Reviews",
      totalExecutions: "Ausf\u00fchrungen gesamt",
      successRate: "Erfolgsrate",
      activeAgents: "aktive Agenten",
      recentActivity: "Letzte Aktivit\u00e4t",
      running: "l\u00e4uft",
      noExecutionsYet: "Noch keine Ausf\u00fchrungen.",
      executeToSee: "F\u00fchren Sie einen Agenten aus, um Aktivit\u00e4t hier zu sehen.",
      trafficErrors: "Traffic & Fehler",
      last14Days: "Letzte 14 Tage",
      noTrafficYet: "Noch keine Aktivit\u00e4t",
      deployed: "bereitgestellt",
      metricsHealth: "Metriken & Zustand",
      toolUtilization: "Tool-Auslastung",
      workers: "Worker",
      usageAnalytics: "Nutzungsanalysen",
      errorBoundary: {
        title: "Dashboard-Panel konnte nicht gerendert werden",
        description: "In diesem Bereich ist ein unerwarteter Fehler aufgetreten. Sie k\u00f6nnen es erneut versuchen, ohne die Seite zu verlassen.",
        retry: "Erneut versuchen",
        errorIdLabel: "Fehler-ID",
        copyErrorId: "Fehler-ID kopieren",
        copied: "Kopiert"
      },
      unreadMessages: "ungelesene Nachrichten",
      fleetHealth: "Flottenzustand",
      fleet: {
        title: "Flottenoptimierung",
        severity: {
          urgent: "Dringend",
          suggested: "Vorgeschlagen",
          insight: "Einblick"
        },
        expand: "Details",
        collapse: "Ausblenden",
        dismiss: "Verwerfen"
      },
      staleness: {
        justNow: "Gerade eben",
        secondsAgo: "vor {n}s",
        minutesAgo: "vor {n}m",
        hoursAgo: "vor {n}h",
        daysAgo: "vor {n}d",
        error: "Laden fehlgeschlagen"
      },
      scope: {
        allPersonas: "Alle Personas",
        personaLabel: "Persona-Filter",
        compare: "Vergleichen",
        dateRange: {
          last24h: "24 Std.",
          last7d: "7 Tage",
          last30d: "30 Tage",
          last90d: "90 Tage",
          custom: "Benutzerdefiniert"
        }
      },
      home: {
        vitals: {
          runs: "L\u00e4ufe",
          alerts: "Warnungen"
        },
        cockpit: {
          vitalsTitle: "Flotten-Vitalwerte",
          vitalsTrend: "Erfolg \u00b7 14 Tage",
          triageTitle: "Triage-Warteschlange",
          triageSubtitle: "Nach Dringlichkeit sortiert",
          triageEmpty: "Alles in Ordnung \u2014 derzeit erfordert nichts Ihre Aufmerksamkeit.",
          triageKindBreach: "SLA-Versto\u00df",
          triageKindIncident: "Vorfall",
          triageKindReview: "Pr\u00fcfung",
          tickerLabel: "Live",
          tickerSuccess: "Flotten-Erfolg",
          tickerAgents: "Agenten online",
          tickerProviders: "Anbieter",
          tickerNextRoutine: "N\u00e4chste Routine",
          tickerAlerts: "Offene Warnungen",
          tickerAllClear: "Alles in Ordnung",
          instrumentsTitle: "Instrumente"
        },
        heatmap: {
          title: "Ausf\u00fchrungsaktivit\u00e4t",
          subtitle: "L\u00e4ufe pro Agent \u00b7 letzte 7 Tage",
          less: "Weniger",
          more: "Mehr",
          empty: "Noch keine Ausf\u00fchrungen."
        },
        topPerformers: {
          title: "Top-Performer"
        },
        upcomingRoutines: {
          title: "Anstehende Routinen",
          subtitle: "N\u00e4chste geplante L\u00e4ufe",
          empty: "Keine geplanten Routinen.",
          triggers: {
            schedule: "Zeitplan",
            polling: "Abfrage",
            webhook: "Webhook",
            event: "Ereignis"
          }
        },
        vaultChanges: {
          title: "Anmeldedaten-Tresor",
          subtitle: "Letzte \u00c4nderungen",
          empty: "Keine aktuellen \u00c4nderungen.",
          actions: {
            rotated: "Rotiert",
            added: "Hinzugef\u00fcgt",
            revoked: "Widerrufen",
            synced: "Synchronisiert"
          }
        }
      }
    },
    dashboardUi: {
      status: {
        queued: "In Warteschlange",
        running: "L\u00e4uft",
        completed: "Abgeschlossen",
        processed: "Verarbeitet",
        failed: "Fehlgeschlagen",
        cancelled: "Abgebrochen",
        pending: "Ausstehend",
        approved: "Genehmigt",
        rejected: "Abgelehnt"
      },
      testFlow: "Testablauf",
      eventTypes: "Event-Typen",
      stdout: "stdout",
      jumpToLatest: "Zum Neuesten springen",
      loadMoreExecutions: "Weitere Ausf\u00fchrungen laden ({visible}/{total})",
      cancelling: "Wird abgebrochen...",
      cancelQueuedRun: "Wartenden Lauf abbrechen",
      conflict: "Konflikt",
      manualReviews: "Manuelle Reviews",
      manualReviewsSubtitle: "Pr\u00fcfen und genehmigen Sie Agent-Entscheidungen, die menschliche Aufsicht erfordern",
      content: "Inhalt",
      selectReview: "W\u00e4hlen Sie einen Review",
      selectReviewDesc: "W\u00e4hlen Sie einen Review aus der Liste, um Details zu sehen und Ma\u00dfnahmen zu ergreifen",
      navigate: "navigieren",
      execution: "Ausf\u00fchrung",
      reviewerNotes: "Pr\u00fcfernotizen",
      notesPlaceholder: "Optionale Notizen vor dem Abschlie\u00dfen hinzuf\u00fcgen...",
      selected: "ausgew\u00e4hlt",
      selectReviewsBulk: "Reviews f\u00fcr Sammelaktionen ausw\u00e4hlen",
      noReviewsInFilter: "Keine Reviews in diesem Filter",
      refreshing: "Wird aktualisiert...",
      rejectSelectedTitle: "Ausgew\u00e4hlte Reviews ablehnen?",
      rejectSelectedBody: "Dadurch werden {count} ausgew\u00e4hlte Review{plural} abgelehnt. Sie haben 5 Sekunden Zeit, um diese Aktion r\u00fcckg\u00e4ngig zu machen.",
      undo: "R\u00fcckg\u00e4ngig",
      retry: "Wiederholen",
      bulkFailedApprove: "{failed} von {total} konnten nicht genehmigt werden",
      bulkFailedReject: "{failed} von {total} konnten nicht abgelehnt werden",
      bulkSucceededReselected: "{count} erfolgreich \u00b7 fehlgeschlagene Elemente erneut ausgew\u00e4hlt",
      allShortcuts: "Alle Tastenk\u00fcrzel",
      keyboardShortcuts: "Tastenk\u00fcrzel",
      searchShortcuts: "Tastenk\u00fcrzel suchen...",
      noShortcutsMatch: "Keine Tastenk\u00fcrzel entsprechen \"{query}\"",
      failedAgentDetails: "Agent-Details konnten nicht geladen werden",
      retryAgentDetails: "Wiederholen",
      recentExecutions: "Letzte Ausf\u00fchrungen",
      noExecutionsYet: "Noch keine Ausf\u00fchrungen",
      subscription: "Abonnement",
      subscriptions: "Abonnements",
      trigger: "Trigger",
      triggers: "Trigger",
      closeAgentDetails: "Agent-Details schlie\u00dfen",
      metricConcurrency: "Parallelit\u00e4t",
      metricTimeout: "Zeitlimit",
      metricBudget: "Budget",
      metricConcurrencyTitle: "Bis zu {n} gleichzeitige Ausf\u00fchrungen",
      metricTimeoutTitle: "Ausf\u00fchrungs-Zeitlimit: {n} Sekunden",
      metricBudgetTitle: "Budgetgrenze: {n} pro Ausf\u00fchrung",
      sessionVerifyFailed: "Ihre Sitzung konnte nicht verifiziert werden",
      sessionHelp: "Falls dies weiterhin auftritt, \u00fcberpr\u00fcfen Sie Ihr Netzwerk oder etwaige Werbeblocker.",
      devModeMock: "Entwicklungsmodus - verwendet Beispieldaten",
      signInTitlePrefix: "Melden Sie sich bei Ihrem",
      signInTitleDashboard: "Dashboard",
      devSignInDesc: "Klicken Sie unten, um das Dashboard mit Beispieldaten zu betreten und die Oberfl\u00e4che zu erkunden.",
      prodSignInDesc: "\u00dcberwachen Sie Ihre Cloud-Agenten, pr\u00fcfen Sie Ausf\u00fchrungen und verwalten Sie Events an einem Ort.",
      signingIn: "Anmeldung l\u00e4uft...",
      enterDemoDashboard: "Demo-Dashboard betreten",
      continueWithGoogle: "Mit Google fortfahren",
      tryDemo: "Demo ausprobieren",
      devNoAuth: "Im Entwicklungsmodus ist keine Authentifizierung erforderlich",
      securedBySupabase: "Gesichert durch Supabase-Authentifizierung",
      errorBoundaryFallback: "Diese Ansicht schl\u00e4gt weiterhin fehl. Bitte laden Sie die Seite neu oder kontaktieren Sie den Support mit der obigen Fehler-ID.",
      brandName: "Personas",
      connected: "Verbunden",
      weekAbbr: "W",
      disconnected: "Getrennt",
      totalLabel: "Gesamt",
      agent: "Agent",
      connections: "Verbindungen",
      eventAnimationPaused: "Event-Fluss-Animation pausiert (reduzierte Bewegung)",
      node: "Knoten",
      eventBus: "Event-Bus",
      eventType: "Event-Typ",
      timestamp: "Zeitstempel",
      trafficVolume: "Datenverkehr",
      samplePayload: "Beispiel-Payload",
      systemHealth: "Systemzustand",
      health: "Zustand",
      memoryInsights: "Memory-Einblicke",
      suggestion: "Vorschlag",
      suggestions: "Vorschl\u00e4ge",
      dismissAction: "Verwerfen: {title}",
      allSuggestionsDismissed: "Alle Vorschl\u00e4ge verworfen. Schauen Sie sp\u00e4ter wieder vorbei.",
      noDataAvailable: "Noch keine Daten verf\u00fcgbar",
      errors: "Fehler",
      totalLower: "gesamt",
      copyPayload: "Payload kopieren"
    },
    memoriesPage: {
      title: "Erinnerungen",
      subtitle: "Gelernte Muster, die Ihre Agenten automatisch anwenden",
      totalCount: "{n} Memories",
      filters: {
        all: "Alle",
        throttle: "Drosselung",
        schedule: "Zeitplan",
        alert: "Warnung",
        config: "Konfiguration",
        routing: "Routing"
      },
      status: {
        active: "Aktiv",
        pending: "Ausstehend",
        archived: "Archiviert"
      },
      uses: "{n} Verwendungen",
      empty: "Keine Memories entsprechen diesem Filter",
      seeAll: "Alle anzeigen",
      conflicts: {
        count: "{n} Konflikte",
        resolveButton: "Konflikte l\u00f6sen",
        modalTitle: "{n} Konflikte l\u00f6sen",
        modalSubtitle: "Akzeptieren oder lehnen Sie jeden ab, um Ihren Memory-Speicher konsistent zu halten.",
        accept: "Akzeptieren",
        reject: "Ablehnen",
        cancel: "Abbrechen",
        apply: "Anwenden",
        allResolved: "Alle Konflikte gel\u00f6st",
        discardTitle: "Ihre Entscheidungen verwerfen?",
        discardBody: "Sie haben {n} Konflikte klassifiziert. Wenn Sie jetzt schlie\u00dfen, werden diese verworfen, ohne angewendet zu werden.",
        discardConfirm: "Verwerfen",
        discardKeep: "Weiter bearbeiten"
      }
    },
    knowledgePage: {
      viewSwitcherLabel: "Wissensansichten",
      title: "Wissensgraph",
      subtitle: "Aus Agentenausf\u0102\u013dhrungen gelernte Muster",
      denseTable: "Dichte Tabelle",
      graph: "Graph",
      memories: "Erinnerungen",
      type: "Typ",
      patternKey: "Musterschl\u0102\u013dssel",
      agent: "Agent",
      success: "Erfolg",
      successLower: "Erfolg",
      failures: "Fehler",
      failuresLower: "Fehler",
      fails: "Fehler",
      rate: "Rate",
      rateLower: "Rate",
      cost: "Kosten",
      tokens: "Tokens",
      retries: "Wiederholungen",
      duration: "Dauer",
      confidence: "Konfidenz",
      lastSeen: "Zuletzt gesehen",
      nodes: "Knoten",
      agents: "Agenten",
      clusters: "Cluster",
      avgConfidence: "\u0102\u0098 Konfidenz",
      all: "Alle",
      agentLinks: "Agentenlinks",
      nodeSize: "Knotengr\u00f6\u00dfe",
      confidenceLegend: "= Konfidenz",
      low: "niedrig",
      high: "hoch",
      patterns: "Muster",
      avgCost: "\u0102\u0098 Kosten",
      clear: "Leeren",
      noPatterns: "Keine Muster passen zu den aktuellen Filtern",
      types: {
        tool_sequence: "Werkzeugsequenz",
        failure_pattern: "Fehlermuster",
        cost_quality: "Kosten / Qualit\u00e4t",
        model_performance: "Modellleistung",
        data_flow: "Datenfluss"
      }
    },
    reviewsPage: {
      selectReview: "Review ausw\u00e4hlen",
      selectAllPending: "Alle ausstehenden Reviews ausw\u00e4hlen",
      focus: {
        enter: "Fokusmodus",
        exit: "Fokus beenden",
        volume: "Lautst\u00e4rke",
        skipTo: "Springe zu",
        chapterHome: "Startseite",
        progress: "{n} von {total}",
        skip: "\u0102\u015bberspringen",
        empty: "Alles erledigt \u2014 keine ausstehenden Reviews",
        approve: "Genehmigen",
        reject: "Ablehnen"
      },
      parseError: {
        label: "Parsing-Fehler",
        detail: "Fehlerhafte Payload \u2014 bis zur Pr\u00fcfung als kritisch eskaliert"
      }
    },
    leaderboardPage: {
      title: "Rangliste",
      subtitle: "Flotten-Ranking nach Gesamtleistung",
      rank: "Rang",
      composite: "Gesamtwert",
      delta: "Ver\u00e4nderung",
      sortBy: "Sortieren nach {field}",
      compare: "Vergleichen",
      versus: "vs.",
      radarTitle: "Metrikprofil",
      rankBy: "Rangfolge nach",
      overall: "Gesamt",
      metrics: {
        reliability: "Zuverl\u00e4ssigkeit",
        cost: "Kosten",
        tokens: "Tokens",
        retries: "Wiederholungen",
        speed: "Geschwindigkeit",
        quality: "Qualit\u00e4t",
        volume: "Volumen",
        skipTo: "Springe zu",
        chapterHome: "Startseite"
      },
      trend: {
        up: "Steigend",
        down: "Fallend",
        flat: "Stabil"
      }
    },
    slaPage: {
      title: "SLA",
      subtitle: "Service-Level-Ziele, Compliance und Verletzungshistorie",
      compliance: "Einhaltung",
      activeBreaches: "Aktive Verst\u00f6\u00dfe",
      objectives: "Ziele",
      target: "Ziel",
      current: "Aktuell",
      timeInSla: "Zeit innerhalb der SLA",
      targetFilter: {
        all: "Alle",
        atRisk: "Gef\u00e4hrdet",
        healthy: "Gesund"
      },
      metricType: {
        availability: "Verf\u00fcgbarkeit",
        latency: "Latenz p95",
        successRate: "Erfolgsrate"
      },
      severity: {
        minor: "Gering",
        major: "Schwerwiegend",
        critical: "Kritisch"
      },
      breachLog: {
        title: "Versto\u00dfprotokoll",
        all: "Alle",
        started: "Beginn",
        resolved: "Behoben",
        otherBreaches: "Weitere Verst\u00f6\u00dfe von {persona}: {n}",
        timeToResolve: "Zeit bis zur Behebung",
        elapsed: "Vergangen",
        empty: "Keine Verst\u00f6\u00dfe in den letzten 7 Tagen.",
        ongoing: "Laufend",
        duration: "{n} Min."
      }
    },
    incidentsPage: {
      title: "Vorf\u00e4lle",
      subtitle: "Audit-Log-Vorf\u00e4lle in der gesamten Flotte",
      open: "Offen",
      total: "Gesamt",
      bySeverity: "Nach Schweregrad",
      bySource: "Nach Quelle",
      incidents: "Vorf\u00e4lle",
      groupByLabel: "Gruppieren nach",
      clearFilters: "Filter zur\u00fccksetzen",
      allPersonas: "Alle Personas",
      statusLabel: "Status",
      severity: {
        critical: "Kritisch",
        high: "Hoch",
        medium: "Mittel",
        low: "Niedrig"
      },
      status: {
        all: "Alle",
        open: "Offen",
        resolved: "Behoben",
        ignored: "Ignoriert",
        escalated: "Eskaliert"
      },
      source: {
        all: "Alle Quellen",
        executions: "Ausf\u00fchrungen",
        events: "Ereignisse",
        triggers: "Trigger",
        vault: "Tresor",
        messages: "Nachrichten",
        reviews: "Pr\u00fcfungen"
      },
      groupBy: {
        none: "Keine",
        agent: "Agent",
        severity: "Schweregrad",
        source: "Quelle"
      },
      badges: {
        circuitBreaker: "Schutzschalter",
        autoFixed: "Automatisch behoben"
      },
      detail: {
        recommendation: "Empfohlene Ma\u00dfnahme",
        source: "Quelle",
        category: "Kategorie",
        persona: "Agent",
        detected: "Erkannt",
        resolved: "Behoben",
        ongoing: "Laufend"
      },
      empty: {
        title: "Keine Vorf\u00e4lle",
        description: "Die Flotte ist gesund \u2014 keine Audit-Vorf\u00e4lle erfasst.",
        filteredTitle: "Keine passenden Vorf\u00e4lle",
        filteredDescription: "Keine Vorf\u00e4lle entsprechen den aktuellen Filtern."
      }
    },
    healthPage: {
      title: "Systemzustand",
      subtitle: "Laufzeit, Dienste, Ressourcen und Integrationen",
      sections: {
        runtime: "Laufzeit",
        services: "Dienste",
        resources: "Ressourcen",
        integrations: "Integrationen"
      },
      status: {
        ok: "Fehlerfrei",
        warn: "Warnung",
        error: "Fehler",
        info: "Info"
      },
      diskUsage: "Speichernutzung",
      used: "belegt",
      free: "frei",
      actions: {
        install: "Installieren",
        configure: "Konfigurieren"
      },
      toast: {
        configured: "konfiguriert (Demo)",
        installed: "aktiviert (Demo)"
      }
    },
    messagesPage: {
      title: "Nachrichten",
      subtitle: "Asynchrones Feedback von jeder Persona in der Flotte",
      unread: "Ungelesen",
      read: "Gelesen",
      empty: "Keine Nachrichten auf dieser Seite.",
      expand: "Payload anzeigen",
      collapse: "Payload ausblenden",
      pagination: {
        prev: "Zur\u00fcck",
        next: "Weiter",
        page: "Seite {n} von {total}"
      },
      markAllRead: "Alle als gelesen markieren",
      viewThreads: "Threads",
      viewList: "Liste",
      reply: "Antwort"
    },
    observabilityPage: {
      usageInsight: "{top} wird {ratio}\u00d7 h\u00e4ufiger genutzt als {second} und ist damit Ihre meistgenutzte Tool-Integration.",
      title: "Observability",
      subtitle: "Leistungsmetriken, Kostenverfolgung und Werkzeugnutzung",
      tabPerformance: "Leistung",
      tabUsage: "Werkzeugnutzung",
      tabActivity: "Aktivit\u00e4t",
      circuitBreaker: "Circuit Breaker",
      autoFixed: "Automatisch behoben",
      resolved: "Behoben",
      autoFixApplied: "Auto-Fix angewendet",
      costAnomalyDetected: "Kostenanomalie erkannt am",
      budgetThresholdExceeded: "Budgetschwelle ?berschritten f?r",
      totalCost: "Gesamtkosten",
      executions: "Ausf?hrungen",
      successRate: "Erfolgsrate",
      activePersonas: "Aktive Personas",
      costOverTime: "Kosten im Zeitverlauf",
      previousPeriod: "gg?. vorherigem Zeitraum",
      executionHealth: "Ausf?hrungszustand",
      latencyDistribution: "Latenzverteilung",
      latencyPercentiles: "P50 / P95 / P99",
      spendByAgent: "Ausgaben nach Agent",
      noSpendData: "Keine Ausgabendaten",
      healthIssues: "Zustandsprobleme",
      open: "offen",
      analyzing: "Analysiere...",
      runAnalysis: "Analyse starten",
      runningAnalysis: "Zustandsanalyse ?ber alle ?berwachten Dienste l?uft...",
      allSystemsHealthy: "Alle Systeme fehlerfrei",
      noIssuesDetected: "Keine Probleme in ?berwachten Diensten erkannt",
      noSeverityIssues: "Keine Probleme mit Schweregrad {severity}",
      exampleDataNotice: "Es werden Beispieldaten angezeigt. Echte Analysen erscheinen, sobald Agenten Ausf?hrungen starten.",
      toolInvocations: "Tool-Aufrufe",
      distribution: "Verteilung",
      usageOverTime: "Nutzung im Zeitverlauf",
      last14Days: "Letzte 14 Tage",
      toolUsageByAgent: "Tool-Nutzung nach Agent",
      other: "Sonstige",
      athenaUsage: "Athena-Nutzung",
      athenaSubtitle: "Companion-Kosten nach Aktion",
      athenaActions: {
        invoke: "Aufruf",
        recall: "Abruf",
        fallback: "Fallback"
      },
      valueRollup: "Wert\u00fcbersicht",
      valueDelivered: "Wert geliefert",
      costPerValue: "Kosten pro Wert",
      outcomes: {
        delivered: "Geliefert",
        partial: "Teilweise",
        blocked: "Blockiert"
      },
      severity: {
        all: "alle",
        critical: "kritisch",
        high: "hoch",
        medium: "mittel",
        low: "niedrig"
      }
    },
    agentsPage: {
      statusLive: "Live",
      statusOff: "Aus",
      title: "Agenten",
      noAgents: "Keine Agenten bereitgestellt",
      noAgentsDesc: "Stellen Sie Ihren ersten Agenten \u00fcber die Personas-Desktop-App bereit und kommen Sie dann hierher zur \u00dcberwachung.",
      agentDeployed: "Agent bereitgestellt",
      agentsDeployed: "Agenten bereitgestellt",
      manualExecution: "Manuelle Ausf\u00fchrung vom Dashboard",
      maxConcurrent: "max.",
      timeoutSeconds: "{n}s Timeout",
      budget: "Budget",
      execute: "Ausf?hren",
      executing: "Wird ausgef\u00fchrt\u2026",
      executeQueued: "Ausf\u00fchrung f\u00fcr {name} in Warteschlange",
      executeFailed: "{name} konnte nicht gestartet werden",
      details: "Details"
    },
    executionsPage: {
      title: "Ausf\u00fchrungen",
      all: "Alle",
      active: "Aktiv",
      completed: "Abgeschlossen",
      failed: "Fehlgeschlagen",
      cancelled: "Abgebrochen",
      agent: "Agent",
      duration: "Dauer",
      cost: "Kosten",
      tokens: "Tokens",
      retries: "Wiederholungen",
      started: "Gestartet",
      noExecutions: "Noch keine Ausf\u00fchrungen",
      noExecutionsDesc: "F\u00fchren Sie einen Agenten aus, um Ergebnisse hier zu sehen",
      waitingForWorker: "Warte auf Worker...",
      noOutputYet: "Noch keine Ausgabe",
      noFilteredActive: "Keine aktiven Ausf\u00fchrungen in dieser Ansicht",
      noFilteredCompleted: "Keine abgeschlossenen Ausf\u00fchrungen in dieser Ansicht",
      noFilteredFailed: "Keine fehlgeschlagenen Ausf\u00fchrungen in dieser Ansicht",
      noFilteredCancelled: "Keine abgebrochenen Ausf\u00fchrungen in dieser Ansicht",
      filteredEmptyDesc: "Es gibt andere Ausf\u00fchrungen, aber keine entspricht diesem Filter.",
      showAllExecutions: "Alle anzeigen"
    },
    eventsPage: {
      title: "Events",
      subtitle: "Event-Bus-Aktivit\u00e4t \u00fcber alle Agenten",
      tabEvents: "Events",
      tabSubscriptions: "Abonnements",
      tabVisualization: "Visualisierung",
      tabSwimlane: "Zeitachse",
      event: "Ereignis",
      source: "Quelle",
      time: "Zeit",
      id: "ID",
      sourceLabel: "Quelle",
      processed: "Verarbeitet",
      retry: "Wiederholen",
      selectForBulkRetry: "F?r Sammelwiederholung ausw?hlen",
      showRelatedEvents: "{count} verwandte Ereignisse anzeigen",
      retriedCount: "{count} Mal wiederholt",
      retryEvent: "Ereignis wiederholen",
      searchPlaceholder: "Payloads, Ereignistypen, Quellen, Fehler suchen...",
      clearSearch: "Suche l?schen",
      eventType: "Ereignistyp",
      sourceType: "Quellentyp",
      clearFilters: "Filter l?schen",
      chain: "Kette",
      events: "Ereignisse",
      result: "Ergebnis",
      results: "Ergebnisse",
      noDeadLetters: "Keine Dead Letters",
      noDeadLettersDescription: "Fehlgeschlagene Ereignisse mit Fehlern erscheinen hier zur Wiederholung",
      noMatchingEvents: "Keine passenden Ereignisse",
      noEvents: "Keine Ereignisse",
      noMatchingEventsDescription: "Passen Sie Suche oder Filter an",
      noEventsDescription: "Ereignisse erscheinen hier, wenn Agenten Trigger und Abonnements verarbeiten",
      loadMore: "Weitere Ereignisse laden",
      failedEventSelected: "fehlgeschlagenes Ereignis ausgew?hlt",
      failedEventsSelected: "fehlgeschlagene Ereignisse ausgew?hlt",
      selectAllFailed: "Alle fehlgeschlagenen ausw?hlen",
      retryAll: "Alle wiederholen",
      active: "Aktiv",
      disabled: "Deaktiviert",
      created: "Erstellt",
      match: "Treffer",
      matches: "Treffer",
      deleteSubscription: "Abonnement l\u00f6schen",
      unknownAgent: "Unbekannter Agent",
      disableSubscription: "Abonnement deaktivieren",
      enableSubscription: "Abonnement aktivieren",
      createSubscription: "Abonnement erstellen",
      persona: "Persona",
      selectPersona: "Persona ausw\u00e4hlen...",
      selectEventType: "Event-Typ ausw\u00e4hlen...",
      sourceFilter: "Quellfilter",
      optional: "optional",
      sourceFilterPlaceholder: "z. B. github, pagerduty...",
      create: "Erstellen",
      newSubscription: "Neues Abonnement",
      noMatchingSubscriptions: "Keine passenden Abonnements",
      noSubscriptions: "Keine Abonnements",
      noSubscriptionsDescription: "Erstellen Sie Abonnements, um Events an Ihre Agenten weiterzuleiten",
      swimlane: {
        title: "Event-Schwimmbahnen",
        subtitle: "Zeitlich geordnete Event-Spur pro Persona",
        empty: "Keine Events im ausgew\u00e4hlten Zeitraum"
      },
      connectionStatus: {
        connected: "Echtzeit: verbunden",
        reconnecting: "Verbindung zum Event-Stream wird wiederhergestellt\u2026",
        polling: "Aktualisierungen werden abgefragt (verz\u00f6gert)"
      }
    },
    settingsPage: {
      title: "Einstellungen",
      subtitle: "Konto- und Cloud-Verbindungskonfiguration",
      account: "Konto",
      cloudConnection: "Cloud-Verbindung",
      orchestrator: "Orchestrator",
      notConfigured: "Nicht konfiguriert",
      totalWorkers: "Worker gesamt",
      queueLength: "Warteschlangenl\u00e4nge",
      activeExecutions: "Aktive Ausf\u00fchrungen",
      notifications: {
        title: "Benachrichtigungen",
        subtitle: "Healing-Warnungen und Berichte",
        weeklyDigest: "W\u00f6chentlicher Zustandsbericht",
        voice: {
          label: "Neue Reviews laut ansagen",
          preview: "Vorschau",
          newReviewRequest: "Neue Review-Anfrage",
          announcement: "Neue {severity} Review von {persona}",
          unknownPersona: "einem Agenten",
          severity: {
            critical: "kritische",
            warning: "wichtige",
            info: "informative"
          }
        },
        severity: {
          critical: "Kritisch",
          high: "Hoch",
          medium: "Mittel",
          low: "Niedrig"
        }
      },
      providers: {
        title: "Modellanbieter",
        subtitle: "Welche Modelle Ihre Agenten nutzen d\u00fcrfen",
        allowed: "Erlaubt",
        requests: "Anfragen"
      },
      rotation: {
        title: "Anmeldedaten-Rotation",
        subtitle: "Tresor-Rotationsstatus",
        hasPolicy: "Richtlinie",
        noPolicy: "Keine Richtlinie",
        auto: "Automatisch",
        manual: "Manuell",
        anomaly: "Anomalie",
        next: "N\u00e4chste",
        overdue: "\u00dcberf\u00e4llig"
      }
    },
    legalPage: {
      title: "Rechtliches",
      heading: "Rechtliche Seiten folgen in K\u00fcrze",
      description: "Unsere Datenschutzrichtlinie und Nutzungsbedingungen werden derzeit finalisiert. In der Zwischenzeit kontaktieren Sie uns bitte bei Fragen."
    },
    waitlist: {
      title: "Der Warteliste beitreten",
      subtitle: "Erfahren Sie als Erste/r, wenn wir starten f\u00fcr",
      emailPlaceholder: "E-Mail eingeben",
      earlyBeta: "Ich m\u00f6chte fr\u00fchen Beta-Zugang",
      submit: "Warteliste beitreten",
      joining: "Beitreten...",
      success: "Sie sind auf der Liste!",
      successDesc: "Wir benachrichtigen Sie, sobald der Build bereit ist.",
      duplicate: "Bereits registriert",
      duplicateDesc: "Sie sind bereits auf der Warteliste. Wir benachrichtigen Sie, wenn es soweit ist.",
      shareTitle: "Mit Freunden teilen",
      copied: "Kopiert!",
      copyLink: "Link kopieren",
      peopleWaiting: "Personen warten",
      errorGeneric: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."
    },
    templatesPage: {
      title: "Agenten-Vorlagen",
      subtitle: "Durchsuchen Sie {count} vorgefertigte Agent-Vorlagen, gruppiert nach Art der Arbeit. W\u00e4hlen Sie eine Kategorie, um die enthaltenen Vorlagen zu sehen.",
      gridHeading: "Vorlagen nach Kategorie durchsuchen",
      gridDescription: "Vorlagen sind vorkonfigurierte Personas, die Sie mit einem Klick \u00fcbernehmen k\u00f6nnen. Jede Vorlage hat Prompt, Tools und Trigger bereits f\u00fcr eine bestimmte Aufgabe eingerichtet \u2014 keine Einrichtung erforderlich.",
      changeCategory: "Kategorie \u00e4ndern",
      complexityAll: "Alle",
      complexityBasic: "Einfach",
      complexityProfessional: "Professionell",
      complexityEnterprise: "Enterprise",
      searchPlaceholder: "Vorlagen, Tools, Dienste suchen...",
      searchAriaLabel: "Vorlagen suchen",
      showingCount: "Zeige {shown} von {total} Vorlagen",
      noMatches: "Keine Vorlagen passen zu Ihren Filtern",
      clearFilters: "Filter zur\u0102\u013dcksetzen",
      viewDetails: "Details anzeigen",
      filterByComplexity: "Nach Komplexit?t filtern",
      backToTemplates: "Zur?ck zu Vorlagen",
      keyBenefits: "Wichtigste Vorteile",
      triggers: "Trigger",
      services: "Dienste",
      configuration: "Konfiguration",
      copied: "Kopiert",
      copy: "Kopieren",
      copyFailed: "Kopieren fehlgeschlagen",
      copyConfiguration: "Konfiguration kopieren",
      getStartedTitle: "Mit dieser Vorlage starten",
      getStartedDescription: "Importieren Sie diese Vorlage direkt in Personas oder kopieren Sie die Konfiguration, um sie selbst anzupassen.",
      openInPersonas: "In Personas ?ffnen",
      moreTemplates: "Weitere {category}-Vorlagen",
      appNotFoundTitle: "Personas-App nicht gefunden",
      appNotFoundDescription: "Personas scheint auf Ihrem Ger?t noch nicht installiert zu sein. Laden Sie es herunter, um Vorlagen direkt zu importieren, oder kopieren Sie die Konfiguration f?r die manuelle Einrichtung.",
      templateNotFound: "Vorlage nicht gefunden",
      templateNotFoundDescription: "Diese Vorlage existiert nicht oder wurde entfernt. Durchsuchen Sie die Galerie nach der aktuellen Sammlung.",
      browseTemplates: "Vorlagen durchsuchen",
      backToHome: "Zur Startseite",
      customTrigger: "Benutzerdefinierter Trigger"
    },
    roadmapSection: {
      inProgress: "In Bearbeitung",
      next: "Als N\u00e4chstes",
      planned: "Geplant",
      completed: "Abgeschlossen",
      empty: "Derzeit nichts geplant.",
      emptyHint: "Schauen Sie bald wieder vorbei \u2014 die n\u00e4chsten Meilensteine erscheinen hier, sobald wir sie planen.",
      heading: "Produkt",
      gradient: "Roadmap",
      description: "Wo jeder Bereich von Personas heute steht \u2014 Fortschritt von links nach rechts, keine Versprechen von oben nach unten.",
      progress: {
        phasesComplete: "{completed} von {total} Phasen abgeschlossen",
        noneDone: "Noch keine Phasen abgeschlossen",
        firstDone: "Phase 1 abgeschlossen",
        rangeDone: "Phasen 1-{count} abgeschlossen",
        toGoOne: "Noch {count} Phase",
        toGoOther: "Noch {count} Phasen"
      },
      areas: {
        i18n: {
          title: "Internationalisierung",
          caption: "{count} Sprachen, von Hand \u00fcbersetzt \u2014 jede Flagge entwickelt sich mit der Abdeckung"
        },
        devices: {
          title: "Ger\u00e4teunterst\u00fctzung",
          caption: "Personas auf jedem Ihrer Ger\u00e4te"
        },
        collaboration: {
          title: "Zusammenarbeit",
          caption: "Vom einzelnen Nutzer bis zur gesamten Organisation"
        },
        platform: {
          title: "Kernplattform",
          caption: "Dev-Modus, Cloud-Ausf\u00fchrung, Konnektoren, m\u00fchelose Installation"
        },
        templates: {
          title: "Vorlagengalerie",
          caption: "Starter-Agenten nach Kategorie \u2014 Live-Z\u00e4hler der Galerie"
        }
      },
      bars: {
        europe: "Europa",
        asiaPacific: "Asien-Pazifik",
        southAsia: "S\u00fcdasien",
        middleEast: "Naher Osten \u00b7 RTL",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        web: "Web",
        mobileCompanion: "Mobile-Begleiter",
        solo: "Solo",
        team: "Team",
        enterprise: "Unternehmen",
        devMode: "Dev-Modus",
        connectors: "Konnektoren",
        cloudExecution: "Cloud-Ausf\u00fchrung",
        installersUpdates: "Installer & Updates",
        allCategories: "Alle Kategorien",
        devops: "DevOps",
        productivity: "Produktivit\u00e4t",
        communication: "Kommunikation",
        marketing: "Marketing",
        research: "Forschung",
        security: "Sicherheit",
        financeCluster: "Finanzen \u00b7 Vertrieb \u00b7 Support \u00b7 Recht"
      },
      detail: {
        localeOne: "{n} Sprache",
        localeOther: "{n} Sprachen",
        shipped: "verf\u00fcgbar",
        inDevelopment: "in Entwicklung",
        thisSite: "diese Website",
        preview: "Vorschau",
        sharedAgents: "geteilte Agenten",
        ssoAudit: "SSO \u00b7 Audit",
        instantPreview: "sofortige Vorschau",
        services: "{n} Dienste",
        runs247: "24/7-Ausf\u00fchrung",
        autoUpdate: "Auto-Update",
        templatesTotal: "{n} / {total} Vorlagen"
      },
      barAria: "{label}: {pct}%"
    },
    featureVoting: {
      eyebrow: "Community",
      heading: "Stimmen Sie ab,",
      headingGradient: "was als N\u00e4chstes kommt",
      subheading: "Helfen Sie uns bei der Priorisierung. W\u00e4hlen Sie die Funktionen, die Ihnen am wichtigsten sind, und gestalten Sie die Zukunft von Personas.",
      features: {
        macos: {
          title: "macOS-Unterst\u00fctzung",
          description: "Vollst\u00e4ndig native macOS-Version mit Apple-Silicon-Optimierung, Spotlight-Integration und Agentensteuerung in der Men\u00fcleiste."
        },
        i18n: {
          title: "Internationalisierung",
          description: "Mehrsprachige Agentenanweisungen, lokalisierte Oberfl\u00e4che und regionsbewusste Planung f\u00fcr Teams weltweit."
        },
        dashboard: {
          title: "Web-Dashboard",
          description: "Browserbasiertes Dashboard f\u00fcr Echtzeit-Agenten\u00fcberwachung, Ausf\u00fchrungsverlauf und Flottenverwaltung von jedem Ger\u00e4t aus."
        },
        enterprise: {
          title: "Enterprise-Projekte",
          description: "Mandantenf\u00e4hige Arbeitsbereiche, RBAC, Audit-Logs, SSO-Integration und geteilte Agentenvorlagen in Ihrer gesamten Organisation."
        }
      },
      voteAria: "F\u00fcr {feature} abstimmen",
      commentsToggleAria: "Kommentare zu {feature} anzeigen",
      discussion: "Diskussion",
      noComments: "Noch keine Kommentare. Teilen Sie als Erste Ihre Gedanken.",
      replying: "Antwort",
      reply: "Antworten",
      addCommentPlaceholder: "Kommentar hinzuf\u00fcgen...",
      writeReplyPlaceholder: "Antwort schreiben...",
      sendCommentAria: "Kommentar senden",
      summary: {
        totalVotes: "{count} Stimmen insgesamt",
        commentOne: "{count} Kommentar",
        commentOther: "{count} Kommentare",
        boostOne: "{count} Boost",
        boostOther: "{count} Boosts",
        live: "Live"
      },
      boost: {
        label: "Boost",
        toggleAria: "{feature} boosten",
        tierAria: "Mit {amount} boosten"
      },
      request: {
        title: "Etwas anderes im Sinn?",
        subtitle: "Funktion vorschlagen",
        placeholder: "Beschreiben Sie die gew\u00fcnschte Funktion...",
        submitAria: "Vorschlag absenden",
        success: "Danke! Ihr Vorschlag wurde erfasst.",
        errorNetwork: "Netzwerkfehler \u2014 bitte pr\u00fcfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        errorRateLimit: "Sie senden Vorschl\u00e4ge zu schnell. Bitte warten Sie einen Moment.",
        errorInvalid: "Bitte geben Sie einen g\u00fcltigen Vorschlag ein (1\u20131000 Zeichen).",
        errorGeneric: "Beim Speichern Ihres Vorschlags ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
        sponsor: "Diese Anfrage unterst\u00fctzen"
      },
      timeAgo: {
        justNow: "gerade eben",
        minutes: "vor {n} Min.",
        hours: "vor {n} Std.",
        days: "vor {n} T."
      }
    },
    eventBusSection: {
      dynamicSwarm: "Dynamischer Schwarm",
      latencyLanes: "Latenz-Lanes",
      ephemeralConnections: "Kurzlebige Verbindungen",
      queueDepth: "Warteschlangentiefe + Durchsatz"
    },
    guide: {
      title: "Benutzer",
      subtitle: "Alles, was Sie \u00fcber Personas wissen m\u00fcssen \u2014 von Ihrem ersten Agenten bis zu fortgeschrittenen Multi-Agenten-Pipelines.",
      searchPlaceholder: "100+ Themen durchsuchen...",
      searchInCategory: "In dieser Kategorie suchen...",
      topics: "Themen",
      backToGuide: "Zur\u0102\u013dck zum Guide",
      showAllResults: "Alle Ergebnisse anzeigen",
      noResults: "Keine Themen gefunden. Versuchen Sie einen anderen Suchbegriff.",
      stillQuestions: "Noch Fragen?",
      joinDiscord: "Unserem Discord beitreten",
      copyAnchor: "Link zum Abschnitt kopieren",
      categories: {
        "getting-started": "Erste Schritte",
        "agents-prompts": "Agenten & Prompts",
        triggers: "Trigger & Planung",
        credentials: "Zugangsdaten & Sicherheit",
        pipelines: "Pipelines & Teams",
        testing: "Testen & Optimierung",
        memories: "Erinnerungen & Wissen",
        monitoring: "\u0102\u015bberwachung & Kosten",
        deployment: "Bereitstellung & Integrationen",
        troubleshooting: "Fehlerbehebung"
      },
      categoryDescriptions: {
        "getting-started": "Installieren Sie Personas, erstellen Sie Ihren ersten Agenten und lernen Sie die Grundlagen in unter 10 Minuten.",
        credentials: "Verbinden Sie sich sicher mit Diensten. Verstehen Sie den verschl\u0102\u013dsselten Tresor und wie Ihre Daten gesch\u0102\u013dtzt bleiben.",
        "agents-prompts": "Erstellen, konfigurieren und optimieren Sie Ihre KI-Agenten. Meistern Sie einfache und strukturierte Prompt-Modi.",
        triggers: "Legen Sie fest, wann und wie Ihre Agenten laufen \u2014 Zeitpl\u00e4ne, Webhooks, Datei-Watcher und mehr.",
        pipelines: "Verbinden Sie Agenten zu visuellen Pipelines. Erstellen Sie Multi-Agenten-Workflows auf dem Team-Canvas.",
        memories: "Ihre Agenten lernen und merken sich Dinge. Verwalten Sie, was sie wissen und wie sie vergangene Erfahrungen nutzen.",
        monitoring: "Verfolgen Sie jede Ausf\u0102\u013dhrung in Echtzeit. Sehen Sie, was Ihre Agenten tun, wie gut sie arbeiten und was sie kosten.",
        testing: "F\u0102\u013dhren Sie Arena-Tests, A/B-Vergleiche durch und lassen Sie das Genome-System Ihre besten Prompts weiterentwickeln.",
        deployment: "Stellen Sie Agenten in der Cloud bereit, verbinden Sie sie mit GitHub Actions, GitLab CI und n8n-Workflows.",
        troubleshooting: "Beheben Sie h\u00e4ufige Probleme, verstehen Sie Fehlermeldungen und bringen Sie Ihre Agenten wieder auf Kurs."
      }
    },
    featurePages: {
      orchestration: {
        headline: "Agenten, die zusammenarbeiten",
        description: "Erstellen Sie visuelle Pipelines, in denen mehrere Agenten an komplexen Aufgaben zusammenarbeiten. Die Ausgabe eines Agenten flie\u00dft in den n\u00e4chsten ein \u2014 kein Klebe-Code, keine manuellen Schritte, keine Grenzen bei der Orchestrierung.",
        cta: "Erstellen Sie Ihre erste Pipeline"
      },
      security: {
        headline: "Ihre Geheimnisse bleiben Ihre",
        description: "Jedes Passwort, jeder API-Schl\u00fcssel und jedes Zugriffstoken wird auf Ihrem Ger\u00e4t mit bankentauglicher AES-256-Verschl\u00fcsselung verschl\u00fcsselt. Ihre Zugangsdaten werden im eigenen sicheren Tresor Ihres Betriebssystems gespeichert \u2014 nichts wird jemals in die Cloud gesendet.",
        cta: "Sichern Sie Ihre Verbindungen"
      },
      "multi-provider": {
        headline: "Nicht an eine KI gebunden",
        description: "Verwenden Sie Claude, OpenAI, Gemini oder f\u00fchren Sie Modelle lokal mit Ollama aus. Wechseln Sie frei zwischen Anbietern, weisen Sie verschiedenen Agenten unterschiedliche Modelle zu, und falls ein Anbieter ausf\u00e4llt \u2014 wechseln Ihre Agenten automatisch zu einem anderen.",
        cta: "W\u00e4hlen Sie Ihre KI"
      },
      genome: {
        headline: "Ihre Agenten werden automatisch schlauer",
        description: "Anstatt stundenlang Prompts manuell anzupassen, lassen Sie das Genome-System die Arbeit erledigen. Es testet Variationen, beh\u00e4lt, was funktioniert, und verwirft den Rest \u2014 wie nat\u00fcrliche Selektion f\u00fcr Ihre KI-Agenten.",
        cta: "Entwickeln Sie Ihre Agenten weiter"
      }
    },
    blogPage: {
      eyebrow: "Blog",
      heading: "Updates &",
      headingGradient: "Einblicke",
      description: "Produktank?ndigungen, technische Deep Dives, Tutorials und reale Anwendungsf?lle vom Personas-Team.",
      searchPlaceholder: "Beitr?ge suchen...",
      searchAriaLabel: "Blogbeitr?ge suchen",
      clearSearch: "Suche l?schen",
      showing: "Zeige",
      of: "von",
      posts: "Beitr?gen",
      noMatches: "Keine Beitr?ge passen zu Ihrer Suche",
      clearFilters: "Alle Filter l?schen",
      allPosts: "Alle Beitr?ge",
      featured: "Empfohlen",
      min: "Min.",
      minRead: "Min. Lesezeit",
      read: "Lesen",
      readArticle: "Artikel lesen",
      article: "Artikel",
      backToBlog: "Zur?ck zum Blog",
      published: "Ver?ffentlicht",
      continueExploring: "Weiter erkunden",
      seeItInAction: "In Aktion ansehen",
      browseTemplates: "Vorlagen durchsuchen",
      postNotFound: "Blogbeitrag nicht gefunden",
      postNotFoundDescription: "Der gesuchte Artikel wurde nicht gefunden. Er wurde m?glicherweise umbenannt oder verschoben.",
      browseAllPosts: "Alle Beitr?ge ansehen",
      backToHome: "Zur Startseite"
    },
    accessibility: {
      changeLanguage: "Sprache \u00e4ndern",
      selectLanguage: "Sprache ausw\u00e4hlen",
      selectTheme: "Theme ausw\u00e4hlen: {name}"
    },
    pageNav: {
      onThisPage: "Auf dieser Seite",
      closeMenu: "Men\u00fc schlie\u00dfen"
    },
    themes: {
      midnight: "Mitternacht",
      cyan: "Cyan",
      bronze: "Bronze",
      frost: "Frost",
      purple: "Lila",
      pink: "Rosa",
      red: "Rot",
      matrix: "Matrix",
      light: "Hell",
      ice: "Eis",
      news: "Nachrichten"
    },
    themeDescriptions: {
      midnight: "Dunkles Marineblau-Theme",
      cyan: "Dunkles Theme mit Cyan-Akzent",
      bronze: "Dunkles Theme mit Bernstein-Akzent",
      frost: "Dunkles silberk\u0102\u013dhl Theme",
      purple: "Dunkles Theme mit Violett-Akzent",
      pink: "Dunkles Theme mit Magenta-Akzent",
      red: "Dunkles Theme mit Karmesin-Akzent",
      matrix: "Dunkles Neongr\u0102\u013dn-Theme",
      light: "Klassisches helles Theme",
      ice: "Helles k\u0102\u013dhlblaues Theme",
      news: "Helles Theme mit hohem Kontrast"
    },
    tour: {
      launch: "Tour starten",
      play: "Abspielen",
      pause: "Pause",
      next: "N\u00e4chster Schritt",
      previous: "Vorheriger Schritt",
      exit: "Tour beenden",
      volume: "Lautst\u00e4rke",
      skipTo: "Springe zu",
      chapterHome: "Startseite",
      begin: "Starten",
      skip: "\u00dcberspringen",
      introTitle: "Lernen Sie Athena kennen, Ihre Begleiterin",
      introBody: "Athena f\u00fchrt Sie in etwa einer Minute durch Personas \u2014 was eine Persona ist, wie sie funktioniert und wie Sie loslegen. Jeden Schritt k\u00f6nnen Sie pausieren, \u00fcberspringen oder erneut abspielen.",
      bridgePrompt: "Das war Personas auf einen Blick. M\u00f6chten Sie tiefer eintauchen und sehen, wie jeder Teil wirklich funktioniert, Funktion f\u00fcr Funktion?",
      bridgeConfirm: "Funktionen zeigen",
      bridgeDismiss: "Vielleicht sp\u00e4ter",
      bridgeToDashboardPrompt: "Sehen Sie Personas jetzt in Aktion \u2014 testen Sie das Demo-Dashboard.",
      bridgeToDashboardConfirm: "Dashboard \u00f6ffnen",
      step1: "Lernen Sie eine Persona kennen \u2014 einen einzelnen KI-Agenten mit einer stabilen Identit\u00e4t und einem kombinierbaren Satz an F\u00e4higkeiten. Geben Sie ihm die Werkzeuge, die er braucht, von Gmail und Slack bis GitHub und Ihrem Kalender, und er lernt, \u00fcber alle hinweg zu handeln. Eine Persona, viele Aufgaben, alle im Zusammenspiel.",
      step2: "Geben Sie dieser Persona nun ein Ziel in einfachen Worten, etwa \u201esortiere mein Gmail\". Sehen Sie ihrem Verstand in Echtzeit zu: Sie liest die Anfrage, zerlegt sie in Schritte und plant ihr Vorgehen, bevor sie irgendetwas anfasst. Dann f\u00fchrt sie aus \u2014 und zeigt Ihnen jeden Schritt, w\u00e4hrend sie vorgeht.",
      step3: "Ein Agent ist nur so n\u00fctzlich wie die Momente, f\u00fcr die er aufwacht. Personas lassen sich auf zehn Arten ausl\u00f6sen \u2014 per Zeitplan, durch ein Ereignis, durch Abfragen einer Quelle oder \u00fcber einen eingehenden Webhook. Der Orchestrator leitet jedes Signal an den richtigen Agenten und h\u00e4lt alles in Bewegung \u2014 und heilt sich selbst, falls ein Schritt einmal fehlschl\u00e4gt.",
      step4: "All dies ruht auf einer Plattform, gebaut f\u00fcr Vertrauen und Skalierung. Ein verschl\u00fcsselter Tresor sch\u00fctzt Ihre Anmeldedaten, fertige Vorlagen bringen Sie schnell ans Ziel, und \u201eBring dein eigenes Modell\" l\u00e4sst Sie die Kontrolle \u00fcber die KI behalten. Live-Monitoring, ein Experimentierlabor und Team-Orchestrierung runden es ab \u2014 sechs S\u00e4ulen an einem Ort.",
      step5: "Bereit, es selbst auszuprobieren? Personas l\u00e4uft auf Ihrem eigenen Rechner \u00fcber Claude Code \u2014 das Kommandozeilen-Tool von Anthropic \u2014 sodass Sie privat und in Kontrolle bleiben. Laden Sie den Installer f\u00fcr Windows 11 herunter, verbinden Sie die CLI, und Ihr erster Agent l\u00e4uft in Minuten.",
      features1: "Jeder Agent entsteht aus einem einzigen Satz der Absicht. Personas liest, was Sie m\u00f6chten, und f\u00fcllt eine achtdimensionale Persona-Matrix \u2014 Aufgaben, Speicher, Trigger, Pr\u00fcfung und mehr \u2014 und fragt nur dann, wenn es wirklich eine Entscheidung braucht. In Sekunden wird aus einer vagen Idee ein strukturierter, ausf\u00fchrbarer Agent.",
      features2: "Dann beginnt er zu lernen. Jede Aufgabe hinterl\u00e4sst eine Spur, und die wichtigen Lektionen steigen in seine Speicherschichten auf, w\u00e4hrend Rauschen nach unten sinkt. Je mehr Ihr Agent arbeitet, desto sch\u00e4rfer und kontextbewusster wird er.",
      features3: "Echte Arbeit scheitert, also ist Personas auf Erholung ausgelegt. Wenn ein Schritt fehlschl\u00e4gt, stockt die Schaltung nicht \u2014 sie diagnostiziert den Fehler, repariert den Pfad und versucht es von selbst erneut. Keine Alarme um 3 Uhr morgens, keine manuellen Neustarts; der Workflow l\u00e4uft einfach weiter.",
      features4: "Und nichts davon entgeht Ihnen. Jede Ausf\u00fchrung, Nachricht, jedes Ereignis und jede Erinnerung str\u00f6mt live durch ein einziges Observability-Deck \u2014 Sparklines, Kosten und Status, alles in Echtzeit. Volle Transparenz, kein Setup.",
      features5: "Gro\u00dfartige Agenten sind selten beim ersten Versuch perfekt, also ist das Lab der Ort, an dem Sie sie verfeinern. Chatten Sie mit einer Persona, um sie zu coachen, lassen Sie zwei Versionen in der Arena gegeneinander antreten, entwickeln Sie sie \u00fcber Generationen, oder bewerten Sie sie in den entscheidenden Dimensionen. Jede Verbesserung, die Sie behalten, ist versioniert und umkehrbar.",
      features6: "Personas bringt sechs zweckgebaute Plugins mit, jedes ein eigenst\u00e4ndiger Arbeitsbereich, den Ihre Agenten steuern k\u00f6nnen. Nehmen Sie Dev Tools: Es macht aus einer Persona einen Programmierkollegen, der Aufgaben ausf\u00fchrt, die Ausgabe liest und iteriert. Ein Tab-Wechsel, und Sie treffen einen weiteren Spezialisten \u2014 alle teilen sich dieselben Anmeldedaten und denselben Speicher.",
      dashboardHome: "Willkommen in der Kommandozentrale \u2014 Ihre gesamte Flotte auf einem Bildschirm. Ganz oben die Vitalwerte: Erfolgsrate, laufende Aufgaben, aktive Agenten, offene Warnungen und Pr\u00fcfungen, die auf Sie warten. Darunter hebt der Optimizer eine wirkungsvolle Verbesserung nach der anderen hervor \u2014 gerade eine Routing-\u00c4nderung, die Kosten senkt, ohne die Qualit\u00e4t zu ber\u00fchren. Die zwei Panels darunter verfolgen die Gesundheit jedes Agenten und die neuen Erinnerungen, die sie gelernt haben und \u00fcbernehmen m\u00f6chten. Dann das Live-Bild: links jede Ausf\u00fchrung beim Eintreffen, rechts vierzehn Tage Traffic und Fehler. Die Heatmap zeigt L\u00e4ufe pro Agent, Tag f\u00fcr Tag, und die untere Reihe rundet alles ab \u2014 Ihre Top-Performer, die n\u00e4chsten geplanten Routinen und jede Rotation von Anmeldedaten. Eine Seite, der gesamte Betrieb.",
      dashboardAgents: "Das ist Ihr Aufgebot. Jede Karte ist eine Persona \u2014 ein einzelner Agent mit einer Identit\u00e4t und einem Satz kombinierbarer F\u00e4higkeiten. Das Portr\u00e4t wird passend zu seinem Charakter erzeugt; darunter die Live-Statistiken: Erfolgsrate, L\u00e4ufe und Kosten. Klicken Sie auf Ausf\u00fchren, um einen Agenten auf Abruf zu starten, oder \u00f6ffnen Sie Details, um Konfiguration und j\u00fcngste Historie zu pr\u00fcfen. F\u00fcnf Agenten hier, jeder erledigt still seine eine Aufgabe gut.",
      dashboardExecutions: "Jeder Lauf, den die Flotte je gemacht hat, lebt hier \u2014 der neueste zuerst. Die Tabelle zeigt Persona, Status, Dauer, Kosten und Startzeitpunkt \u2014 filtern Sie auf nur die Fehlschl\u00e4ge oder die noch laufenden. Klicken Sie auf eine Zeile, und die vollst\u00e4ndige Ausf\u00fchrung \u00f6ffnet sich: ein Metrik-Streifen, eine etwaige Fehlererkl\u00e4rung und die Live-Ausgabe, Zeile f\u00fcr Zeile, genau so, wie der Agent sie erzeugt hat.",
      dashboardEvents: "Agenten arbeiten nicht isoliert \u2014 sie reagieren auf Ereignisse. Das ist der Event-Bus: jedes Signal, das durch das System flie\u00dft, von Zeitpl\u00e4nen und Webhooks bis zu Nachrichten zwischen Agenten. Jede Zeile zeigt den Ereignistyp, die Quelle, den Status und wie lange es her ist. Fehlgeschlagene Ereignisse lassen sich an Ort und Stelle erneut versuchen, und verwandte Ereignisse verketten sich, sodass Sie eine einzelne Kaskade von Anfang bis Ende verfolgen k\u00f6nnen.",
      dashboardReviews: "Manche Entscheidungen brauchen einen Menschen. Wenn ein Agent auf etwas st\u00f6\u00dft, das er nicht allein entscheiden sollte, h\u00e4lt er inne und leitet den Fall hierher. Jeder Eintrag enth\u00e4lt die Persona, den Kontext und die vorgeschlagene Aktion \u2014 genehmigen, ablehnen oder f\u00fcr sp\u00e4ter \u00fcberspringen, per Klick oder Tastatur. Nichts Riskantes geht ohne Ihre Freigabe live, und die Warteschlange h\u00e4lt den Rest der Flotte in Bewegung, w\u00e4hrend Sie entscheiden.",
      roadmap1: "Hier stehen wir jetzt: Jede Phase der Roadmap wird beim Ausliefern nach Status bewertet.",
      roadmap2: "Was als N\u00e4chstes kommt, liegt bei Ihnen \u2014 stimmen Sie f\u00fcr die Funktionen ab, die Sie am meisten wollen, und die Topideen pr\u00e4gen, was wir bauen.",
      roadmap3: "Und hier ist alles, was bereits ausgeliefert wurde \u2014 jede Version der Reihe nach, die neueste zuerst."
    },
    playgroundPage: {
      heroHeading: "Agenten in",
      heroHeadingGradient: "Aktion",
      heroDescription: "W\u00e4hlen Sie unten eine Aufgabe aus und beobachten Sie, wie ein Personas-Agent sie aufschl\u00fcsselt, die richtigen Werkzeuge ausw\u00e4hlt und Ergebnisse liefert \u2013 alles in Sekunden.",
      ctaTitle: "Bereit, eigene Agenten zu erstellen?",
      ctaDescription: "Laden Sie Personas herunter und erstellen Sie autonome Agenten, die sich mit Ihren Werkzeugen verbinden, Ihre Regeln befolgen und nach Ihrem Zeitplan arbeiten.",
      ctaDownload: "Personas herunterladen",
      ctaBrowseTemplates: "Vorlagen durchsuchen",
      selectTask: "W\u00e4hlen Sie oben eine Aufgabe, um die Simulation zu starten",
      simulatedExecution: "Simulierte Ausf\u00fchrung",
      statusExecuting: "wird ausgef\u00fchrt\u2026",
      statusComplete: "abgeschlossen",
      statusReady: "bereit",
      chromeTitle: "agent-playground \u2014 live",
      reset: "Zur\u00fccksetzen"
    }
  };
