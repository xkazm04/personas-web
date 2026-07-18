import type { Translations } from './en';

export const cs: Translations = {
    notFound: {
      title: "Str\u00e1nka nenalezena",
      description: "Str\u00e1nka, kterou hled\u00e1te, neexistuje nebo byla p\u0159esunuta. Zkuste m\u00edsto toho n\u011bkterou z t\u011bchto mo\u017enost\u00ed:",
      home: "Dom\u016f",
      getStarted: "Za\u010d\u00edt",
      backToHome: "Zp\u011bt na domovskou str\u00e1nku"
    },
    errorPage: {
      title: "Tato str\u00e1nka narazila na neo\u010dek\u00e1van\u00fd probl\u00e9m",
      description: "P\u0159i na\u010d\u00edt\u00e1n\u00ed t\u00e9to str\u00e1nky do\u0161lo k chyb\u011b. N\u00e1\u0161 t\u00fdm byl upozorn\u011bn \u2014 zkuste to znovu nebo se vra\u0165te na domovskou str\u00e1nku.",
      tryAgain: "Zkusit znovu",
      errorReference: "Reference chyby",
      copyReference: "Kop\u00edrovat referenci chyby",
      backToHome: "Zp\u011bt na domovskou str\u00e1nku"
    },
    nav: {
      home: "Personas",
      how: "Jak to funguje",
      connections: "Propojen\u00ed",
      roadmap: "Pl\u00e1n",
      templates: "\u0160ablony",
      download: "St\u00e1hnout",
      dashboard: "N\u00e1st\u011bnka",
      features: "Funkce",
      guide: "Pr\u0139\u017bvodce",
      useCases: "P\u0159\u00edpady u\u017eit\u00ed",
      tour: "Prohl\u00eddka",
      security: "Bezpe\u00c4\u0164nost",
      blog: "Blog",
      changelog: "Seznam zm\u011bn",
      pricing: "Cen\u00edk",
      menu: "Menu"
    },
    compareSection: {
      heading: "V\u0161echno je",
      headingGradient: "zdarma",
      description: "Desktopov\u00e1 aplikace a v\u0161echny funkce n\u00ed\u017ee jsou nav\u017edy zdarma. \u017d\u00e1dn\u00e9 \u00farovn\u011b, \u017e\u00e1dn\u00e9 ceny za u\u017eivatele \u2014 jen kompletn\u00ed platforma pro agenty b\u011b\u017e\u00edc\u00ed na va\u0161em po\u010d\u00edta\u010di.",
      offerBadges: [
        "Nav\u017edy zdarma",
        "Self-hosted",
        "Bez p\u0159ir\u00e1\u017eky za b\u011bh",
        "Open source"
      ],
      offerBody: "Personas b\u011b\u017e\u00ed na va\u0161em po\u010d\u00edta\u010di. \u017d\u00e1dn\u00e1 p\u0159ir\u00e1\u017eka za orchestraci ani ceny za u\u017eivatele. Placen\u00fd cloud a prioritn\u00ed podpora jsou voliteln\u00e9, ne povinn\u00e9.",
      ctaLabel: "Za\u010d\u00edt zdarma",
      readGuide: "P\u0159e\u010d\u00edst pr\u016fvodce",
      groups: {
        "agents-prompts": {
          title: "Agenti a Prompty",
          tagline: "Zam\u011b\u0159eno na u\u017eivatele",
          concepts: [
            "Tvorba person v p\u0159irozen\u00e9m jazyce",
            "40+ p\u0159evzateln\u00fdch \u0161ablon",
            "BYOM \u2014 Claude nebo lok\u00e1ln\u00ed Ollama",
            "Strukturovan\u00fd i jednoduch\u00fd re\u017eim prompt\u016f",
            "Trval\u00e1 pam\u011b\u0165 agenta"
          ]
        },
        triggers: {
          title: "Orchestrace",
          tagline: "Ka\u017ed\u00fd zp\u016fsob, jak agent m\u016f\u017ee za\u010d\u00edt",
          concepts: [
            "Pl\u00e1nov\u00e1n\u00ed (cron)",
            "Webhook endpointy",
            "Sledov\u00e1n\u00ed soubor\u016f",
            "Monitor schr\u00e1nky",
            "\u0158et\u011bzov\u00fd / ud\u00e1lostn\u00ed trigger",
            "Kombinovan\u00e9 podm\u00ednky"
          ]
        },
        pipelines: {
          title: "Pipeline a T\u00fdmy",
          tagline: "Vizu\u00e1ln\u00ed agentov\u00e1 spolupr\u00e1ce",
          concepts: [
            "Vizu\u00e1ln\u00ed pl\u00e1tno t\u00fdmu",
            "Propojen\u00ed datov\u00fdch tok\u016f",
            "\u017div\u00e1 sb\u011brnice ud\u00e1lost\u00ed",
            "Samoopravn\u00e9 spou\u0161t\u011bn\u00ed",
            "P\u0159ehr\u00e1v\u00e1n\u00ed pipeline + \u010dasov\u00e9 cestov\u00e1n\u00ed"
          ]
        },
        credentials: {
          title: "P\u0159ihla\u0161ovac\u00ed \u00fadaje a zabezpe\u010den\u00ed",
          tagline: "Va\u0161e tajn\u00e9 \u00fadaje z\u016fst\u00e1vaj\u00ed na va\u0161em po\u010d\u00edta\u010di",
          concepts: [
            "Trezor AES-256-GCM",
            "Nativn\u00ed kl\u00ed\u010denka OS",
            "OAuth s podporou AI",
            "Automatick\u00e1 obnova token\u016f",
            "Nulov\u00e1 telemetrie, local-first"
          ]
        },
        monitoring: {
          title: "Monitorov\u00e1n\u00ed",
          tagline: "Sledujte, oce\u0148te a \u0159i\u010fte ka\u017ed\u00fd b\u011bh",
          concepts: [
            "\u017div\u00fd dashboard observability",
            "Sledov\u00e1n\u00ed rozsah\u016f (span) pro ka\u017ed\u00e9 spu\u0161t\u011bn\u00ed",
            "P\u0159i\u0159azen\u00ed n\u00e1klad\u016f podle modelu",
            "Fronty lidsk\u00e9ho p\u0159ezkumu",
            "Rozpo\u010dtov\u00e1 upozorn\u011bn\u00ed a vynucen\u00ed"
          ]
        },
        testing: {
          title: "Testovac\u00ed laborato\u0159",
          tagline: "Automatizovan\u00e1 evoluce",
          concepts: [
            "Ar\u00e9na pro A/B testy",
            "Verzov\u00e1n\u00ed prompt\u016f + rozd\u00edly",
            "Hodnocen\u00ed v\u00fdkonnosti (fitness)",
            "Cykly k\u0159\u00ed\u017een\u00ed",
            "Sandboxy se simulovan\u00fdmi n\u00e1stroji"
          ]
        }
      }
    },
    footer: {
      tagline: "AI agenti, kte\u0159\u00ed pracuj\u00ed pro v\u00e1s",
      motto: "AI agenti, kte\u0159\u00ed automatizuj\u00ed va\u0161i pr\u00e1ci, abyste se mohli soust\u0159edit na to nejd\u016fle\u017eit\u011bj\u0161\u00ed.",
      product: "Produkt",
      resources: "Zdroje",
      legal: "Pr\u00e1vn\u00ed informace",
      privacy: "Ochrana soukrom\u00ed",
      terms: "Podm\u00ednky",
      copyright: "Personas. V\u0161echna pr\u00e1va vyhrazena.",
      slogan: "Automatizujte svou pr\u00e1ci. Z\u00edskejte sv\u016fj \u010das zp\u011bt."
    },
    pricing: {
      local: "Lok\u00e1ln\u00ed",
      cloud: "Cloud",
      enterprise: "Enterprise",
      downloadLocal: "St\u00e1hnout lok\u00e1ln\u011b",
      goCloud: "P\u0159ej\u00edt na cloud",
      contactSales: "Kontaktovat obchod",
      comingSoon: "Ji\u017e brzy",
      bestFor: "Nejlep\u0161\u00ed pro",
      forever: "nav\u017edy",
      mo: "/m\u011bs\u00edc",
      custom: "Na m\u00edru",
      bestForLocal: "Samostatn\u00e9 tv\u016frce za\u010d\u00ednaj\u00edc\u00ed s v\u00fdvojem",
      bestForCloud: "Rychle se rozv\u00edjej\u00edc\u00ed jednotliv\u00e9 t\u00fdmy",
      bestForEnterprise: "Organizace s pot\u0159ebou compliance a \u0161k\u00e1lov\u00e1n\u00ed",
      features: {
        unlimitedLocalAgents: "Neomezen\u00e9 lok\u00e1ln\u00ed agenty",
        localEventBus: "Lok\u00e1ln\u00ed sb\u011brnice ud\u00e1lost\u00ed a pl\u00e1nova\u010d",
        fullObservability: "Pln\u00fd dashboard observability",
        designEngine: "Design engine",
        teamCanvasLocal: "T\u00fdmov\u00e9 pl\u00e1tno (lok\u00e1ln\u00ed)",
        everythingInFree: "V\u0161e z Free pl\u00e1nu",
        cloudWorkers3: "3 cloudov\u00ed pracovn\u00edci",
        executions1000: "1 000 spou\u0161t\u011bn\u00ed/m\u011bs\u00edc",
        events10000: "10 000 ud\u00e1lost\u00ed/m\u011bs\u00edc",
        burstAutoScaling: "N\u00e1razov\u00e9 automatick\u00e9 \u0161k\u00e1lov\u00e1n\u00ed",
        everythingInPro: "V\u0161e z Pro pl\u00e1nu",
        ssoSaml: "SSO p\u0159es SAML & OIDC",
        multiTenantRbac: "Multi-tenant workspaces s RBAC",
        auditTrailExport: "Export auditn\u00edho z\u00e1znamu spou\u0161t\u011bn\u00ed",
        dedicatedWorkers: "Vyhrazen\u00ed cloudov\u00ed pracovn\u00edci a SLA",
        prioritySupport: "Prioritn\u00ed podpora"
      }
    },
    hero: {
      title: "AI agenti b\u011b\u017e\u00edc\u00ed na va\u0161em po\u010d\u00edta\u010di",
      subtitle: "Jedna persona, mnoho schopnost\u00ed. Vytvo\u0159te asistenta se stabiln\u00ed identitou a skl\u00e1dejte \u00fakoly, kter\u00e9 vykon\u00e1v\u00e1 \u2014 p\u0159id\u00e1vejte, p\u0159ep\u00ednejte nebo ru\u0161te schopnosti bez nutnosti za\u010d\u00ednat znovu.",
      downloadCta: "St\u00e1hnout",
      trustLine: "Bez registrace, bez platebn\u00ed karty. B\u011b\u017e\u00ed na va\u0161em po\u010d\u00edta\u010di. Nulov\u00e1 telemetrie.",
      cta: "Za\u010d\u00edt",
      badge: "Platforma AI agent\u016f",
      headingLine1: "Inteligentn\u00ed agenti",
      headingLine2: "kte\u0159\u00ed pracuj\u00ed pro v\u00e1s",
      description: "Navrhujte agenty v p\u0159irozen\u00e9m jazyce. Orchestrujte je lok\u00e1ln\u011b nebo v cloudu.",
      descriptionBold: "\u017d\u00e1dn\u00e9 diagramy pracovn\u00edch postup\u016f. \u017d\u00e1dn\u00e9 roje agent\u016f. \u017d\u00e1dn\u00fd k\u00f3d.",
      mode1: "Skl\u00e1dateln\u00e9 schopnosti",
      mode2: "Jednoduch\u00e9 nastaven\u00ed",
      mode3: "Zdarma",
      mode4: "Podpora v\u00edce poskytovatel\u016f AI",
      mode5: "Samovylep\u0161uj\u00edc\u00ed se",
      viewOnGithub: "Zobrazit na GitHub",
      downloadForWindows: "St\u00e1hnout pro Windows",
      joinWaitlist: "P\u0159idat se na \u010dekac\u00ed listinu pro Windows",
      commandCenter: "Velitelsk\u00e9 centrum",
      adoptionSnapshot: "P\u0159ehled adopce",
      scroll: "Posuv",
      phases: "F\u00c1ZE",
      publicBeta: "VE\u0139\u0098EJN\u0102\u0081 BETA",
      agents: "Agenti",
      executions: "Spou\u0161t\u011bn\u00ed",
      connectors: "Konektory",
      templates: "\u0160ablony"
    },
    heroTransition: {
      ariaLabel: "Kl\u00ed\u010dov\u00e9 pil\u00ed\u0159e produktu",
      speed: "Rychl\u00e9",
      privacy: "Soukrom\u00e9",
      scale: "\u0160k\u00e1lovateln\u00e9",
      value: "Jedna persona, mnoho schopnost\u00ed \u2014 stabiln\u00ed identita se skl\u00e1datelnou sadou \u00fakol\u016f, b\u011b\u017e\u00edc\u00ed tam, kde \u017eij\u00ed va\u0161e data, a pln\u011b pod va\u0161\u00ed kontrolou.",
      cta: "Pod\u00edvejte se na to v akci"
    },
    sections: {
      vision: "Vize",
      pricing: "Ceny",
      faq: "\u010cast\u00e9 dotazy",
      features: "Funkce",
      useCases: "P\u0159\u00edpady u\u017eit\u00ed",
      eventBus: "Sb\u011brnice ud\u00e1lost\u00ed",
      download: "St\u00e1hnout"
    },
    common: {
      skipToMain: "P\u0159esko\u010dit na hlavn\u00ed obsah",
      loading: "Na\u010d\u00edt\u00e1n\u00ed...",
      cancel: "Zru\u0161it",
      close: "Zav\u0159\u00edt",
      back: "Zp\u011bt",
      next: "Dal\u0161\u00ed",
      save: "Ulo\u017eit",
      delete: "Smazat",
      edit: "Upravit",
      search: "Hledat",
      noResults: "Nebyly nalezeny \u017e\u00e1dn\u00e9 v\u00fdsledky",
      signOut: "Odhl\u00e1sit se",
      signingOut: "Odhla\u0161ov\u00e1n\u00ed\u2026",
      signIn: "P\u0159ihl\u00e1sit se",
      notifyMe: "upozornit m\u011b",
      step: "Krok",
      learnMore: "Zjistit v\u00edce",
      viewAll: "Zobrazit v\u0161e",
      status: "Stav",
      active: "aktivn\u00ed",
      idle: "ne\u010dinn\u00fd",
      total: "celkem",
      checking: "Kontrola\u2026",
      connected: "P\u0159ipojeno",
      disconnected: "Odpojeno",
      demo: "Demo",
      viewFullSite: "Zobrazit plnou verzi"
    },
    useCasesSection: {
      heading: "Jedna persona,",
      headingGradient: "mnoho schopnost\u00ed",
      integrations: "integrace",
      patterns: "schopnosti",
      description: "Ka\u017ed\u00e1 persona nese stabiln\u00ed identitu a skl\u00e1datelnou sadu schopnost\u00ed \u2014 klikn\u011bte na libovolnou integraci a prozkoumejte \u00fakoly, kter\u00e9 persona um\u00ed vykonat.",
      autoplayHint: "Automatick\u00e9 p\u0159ep\u00edn\u00e1n\u00ed \u2014 kliknut\u00edm zastav\u00edte.",
      browseTemplates: "Proch\u00e1zet v\u0161echny \u0161ablony",
      whatCanAutomate: "Co dok\u00e1\u017ee Personas automatizovat",
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
        name: "Kalend\u00e1\u0159",
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
      heading: "\u010casto",
      headingGradient: "dotazovan\u00e9",
      subtitle: "V\u0161e, co pot\u0159ebujete v\u011bd\u011bt o za\u010d\u00e1tc\u00edch s Personas.",
      stillQuestions: "St\u00e1le m\u00e1te ot\u00e1zky?",
      joinDiscord: "P\u0159ipojte se na Discord",
      discordSubtitle: "P\u0159ipojte se k na\u0161\u00ed komunit\u011b na Discordu pro pomoc a diskuzi.",
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
      heading: "P\u0159ipraveni vytvo\u0159it sv\u00e9ho",
      headingGradient: "agenta?",
      subtitle: "St\u00e1hn\u011bte Personas zdarma. Za\u010dn\u011bte tvo\u0159it b\u011bhem minut.",
      downloadInstaller: "St\u00e1hnout instal\u00e1tor",
      joinWaitlist: "P\u0159idat se na \u010dekac\u00ed listinu",
      connectCli: "P\u0159ipojit Claude CLI",
      launchAgent: "Spustit prvn\u00edho agenta",
      exploreFirst: "Nejd\u0159\u00edve prozkoumat mo\u017enosti",
      requiresCli: "Vy\u017eaduje Claude CLI",
      installerSize: "12 MB instal\u00e1tor",
      noTelemetry: "\u017d\u00e1dn\u00e1 telemetrie",
      localFirst: "Zabezpe\u010den\u00ed local-first",
      windows: "Windows",
      macos: "macOS",
      linux: "Linux"
    },
    dashboard: {
      title: "N\u00e1st\u011bnka",
      overview: "P\u0159ehled",
      agents: "Agenti",
      executions: "Spou\u0161t\u011bn\u00ed",
      events: "Ud\u00e1losti",
      reviews: "Recenze",
      observability: "Pozorovatelnost",
      knowledge: "Znalosti",
      settings: "Nastaven\u00ed",
      leaderboard: "\u017deb\u0159\u00ed\u010dek",
      sla: "SLA",
      incidents: "Incidenty",
      health: "Stav",
      messages: "Zpr\u00e1vy",
      more: "V\u00edce",
      greeting: {
        morning: "Dobr\u00e9 r\u00e1no",
        afternoon: "Dobr\u00e9 odpoledne",
        evening: "Dobr\u00fd ve\u010der"
      },
      agentsStatus: "Zde je co se d\u011bje s va\u0161imi agenty",
      lastSeen: "Naposledy zde",
      greetingFallback: "kamar\u00e1de",
      pendingReviews: "\u010dekaj\u00edc\u00edch reviz\u00ed",
      totalExecutions: "celkem spu\u0161t\u011bn\u00ed",
      successRate: "m\u00edra \u00fasp\u011b\u0161nosti",
      activeAgents: "aktivn\u00edch agent\u016f",
      recentActivity: "Ned\u00e1vn\u00e1 aktivita",
      running: "b\u011b\u017e\u00ed",
      noExecutionsYet: "Zat\u00edm \u017e\u00e1dn\u00e1 spu\u0161t\u011bn\u00ed.",
      executeToSee: "Spus\u0165te agenta a uvid\u00edte aktivitu zde.",
      trafficErrors: "Provoz & Chyby",
      last14Days: "Posledn\u00edch 14 dn\u00ed",
      noTrafficYet: "Zat\u00edm \u017e\u00e1dn\u00fd provoz",
      deployed: "nasazeno",
      metricsHealth: "Metriky & zdrav\u00ed",
      toolUtilization: "Vyu\u017eit\u00ed n\u00e1stroj\u016f",
      workers: "workery",
      usageAnalytics: "Analytika vyu\u017eit\u00ed",
      errorBoundary: {
        title: "Panel dashboardu se nepoda\u0159ilo vykreslit",
        description: "V t\u00e9to sekci do\u0161lo k neo\u010dek\u00e1van\u00e9 chyb\u011b. M\u016f\u017eete to zkusit znovu bez opu\u0161t\u011bn\u00ed str\u00e1nky.",
        retry: "Zkusit znovu",
        errorIdLabel: "ID chyby",
        copyErrorId: "Kop\u00edrovat ID chyby",
        copied: "Zkop\u00edrov\u00e1no"
      },
      unreadMessages: "nep\u0159e\u010dten\u00fdch zpr\u00e1v",
      fleetHealth: "stav flotily",
      fleet: {
        title: "Optimalizace flotily",
        severity: {
          urgent: "Nal\u00e9hav\u00e9",
          suggested: "Doporu\u00c4\u0164eno",
          insight: "Poznatek"
        },
        expand: "Detaily",
        collapse: "Skr\u00fdt",
        dismiss: "Zav\u0159\u00edt"
      },
      staleness: {
        justNow: "Pr\u00e1v\u011b te\u010f",
        secondsAgo: "p\u0159ed {n} s",
        minutesAgo: "p\u0159ed {n} min",
        hoursAgo: "p\u0159ed {n} h",
        daysAgo: "p\u0159ed {n} d",
        error: "Na\u010dten\u00ed se nezda\u0159ilo"
      },
      scope: {
        allPersonas: "V\u0161echny persony",
        personaLabel: "Filtr persony",
        compare: "Porovnat",
        dateRange: {
          last24h: "24 h",
          last7d: "7 dn\u00ed",
          last30d: "30 dn\u00ed",
          last90d: "90 dn\u00ed",
          custom: "Vlastn\u00ed"
        }
      },
      home: {
        vitals: {
          runs: "Spu\u0161t\u011bn\u00ed",
          alerts: "Upozorn\u011bn\u00ed"
        },
        cockpit: {
          vitalsTitle: "Stav flotily",
          vitalsTrend: "\u00dasp\u011b\u0161nost \u00b7 14 dn\u00ed",
          triageTitle: "Fronta k vy\u0159\u00edzen\u00ed",
          triageSubtitle: "Se\u0159azeno podle nal\u00e9havosti",
          triageEmpty: "V\u0161e vy\u0159\u00edzeno \u2014 moment\u00e1ln\u011b nic nevy\u017eaduje va\u0161i pozornost.",
          triageKindBreach: "Poru\u0161en\u00ed SLA",
          triageKindIncident: "Incident",
          triageKindReview: "Kontrola",
          tickerLabel: "\u017div\u011b",
          tickerSuccess: "\u00dasp\u011b\u0161nost flotily",
          tickerAgents: "Agenti online",
          tickerProviders: "Poskytovatel\u00e9",
          tickerNextRoutine: "Dal\u0161\u00ed rutina",
          tickerAlerts: "Otev\u0159en\u00e1 upozorn\u011bn\u00ed",
          tickerAllClear: "V\u0161e v po\u0159\u00e1dku",
          instrumentsTitle: "N\u00e1stroje"
        },
        heatmap: {
          title: "Aktivita spu\u0161t\u011bn\u00ed",
          subtitle: "Spu\u0161t\u011bn\u00ed na agenta \u00b7 posledn\u00edch 7 dn\u00ed",
          less: "M\u00e9n\u011b",
          more: "V\u00edce",
          empty: "Zat\u00edm \u017e\u00e1dn\u00e1 spu\u0161t\u011bn\u00ed."
        },
        topPerformers: {
          title: "Nejlep\u0161\u00ed v\u00fdkony"
        },
        upcomingRoutines: {
          title: "Nadch\u00e1zej\u00edc\u00ed rutiny",
          subtitle: "Dal\u0161\u00ed napl\u00e1novan\u00e1 spu\u0161t\u011bn\u00ed",
          empty: "\u017d\u00e1dn\u00e9 napl\u00e1novan\u00e9 rutiny.",
          triggers: {
            schedule: "Pl\u00e1n",
            polling: "Dotazov\u00e1n\u00ed",
            webhook: "Webhook",
            event: "Ud\u00e1lost"
          }
        },
        vaultChanges: {
          title: "Trezor p\u0159ihla\u0161ovac\u00edch \u00fadaj\u016f",
          subtitle: "Ned\u00e1vn\u00e9 zm\u011bny",
          empty: "\u017d\u00e1dn\u00e9 ned\u00e1vn\u00e9 zm\u011bny.",
          actions: {
            rotated: "Rotov\u00e1no",
            added: "P\u0159id\u00e1no",
            revoked: "Odvol\u00e1no",
            synced: "Synchronizov\u00e1no"
          }
        }
      }
    },
    dashboardUi: {
      status: {
        queued: "Ve front\u011b",
        running: "Prob\u00edh\u00e1",
        completed: "Dokon\u010deno",
        processed: "Zpracov\u00e1no",
        failed: "Selhalo",
        cancelled: "Zru\u0161eno",
        pending: "\u010cek\u00e1",
        approved: "Schv\u00e1leno",
        rejected: "Zam\u00edtnuto"
      },
      testFlow: "Testovac\u00ed tok",
      eventTypes: "Typy ud\u00e1lost\u00ed",
      stdout: "stdout",
      jumpToLatest: "P\u0159ej\u00edt na nejnov\u011bj\u0161\u00ed",
      loadMoreExecutions: "Na\u010d\u00edst dal\u0161\u00ed spu\u0161t\u011bn\u00ed ({visible}/{total})",
      cancelling: "Ru\u0161\u00ed se...",
      cancelQueuedRun: "Zru\u0161it spu\u0161t\u011bn\u00ed ve front\u011b",
      conflict: "Konflikt",
      manualReviews: "Ru\u010dn\u00ed revize",
      manualReviewsSubtitle: "P\u0159ezkoumejte a schvalte rozhodnut\u00ed agenta vy\u017eaduj\u00edc\u00ed lidsk\u00fd dohled",
      content: "Obsah",
      selectReview: "Vyberte revizi",
      selectReviewDesc: "Vyberte revizi ze seznamu a zobrazte podrobnosti a mo\u017en\u00e9 akce",
      navigate: "navigovat",
      execution: "Spu\u0161t\u011bn\u00ed",
      reviewerNotes: "Pozn\u00e1mky recenzenta",
      notesPlaceholder: "P\u0159ed vy\u0159e\u0161en\u00edm p\u0159idejte voliteln\u00e9 pozn\u00e1mky...",
      selected: "vybr\u00e1no",
      selectReviewsBulk: "Vybrat revize pro hromadn\u00e9 akce",
      noReviewsInFilter: "V tomto filtru nejsou \u017e\u00e1dn\u00e9 revize",
      refreshing: "Obnovuje se...",
      rejectSelectedTitle: "Zam\u00edtnout vybran\u00e9 revize?",
      rejectSelectedBody: "T\u00edmto zam\u00edtnete {count} vybran\u00fdch reviz\u00ed{plural}. Na vr\u00e1cen\u00ed akce budete m\u00edt 5 sekund.",
      undo: "Zp\u011bt",
      retry: "Zkusit znovu",
      bulkFailedApprove: "{failed} z {total} se nepoda\u0159ilo schv\u00e1lit",
      bulkFailedReject: "{failed} z {total} se nepoda\u0159ilo zam\u00edtnout",
      bulkSucceededReselected: "{count} \u00fasp\u011b\u0161n\u011b dokon\u010deno \u00b7 ne\u00fasp\u011b\u0161n\u00e9 polo\u017eky znovu vybr\u00e1ny",
      allShortcuts: "V\u0161echny zkratky",
      keyboardShortcuts: "Kl\u00e1vesov\u00e9 zkratky",
      searchShortcuts: "Hledat zkratky...",
      noShortcutsMatch: "\u017d\u00e1dn\u00e9 zkratky neodpov\u00eddaj\u00ed \"{query}\"",
      failedAgentDetails: "Nepoda\u0159ilo se na\u010d\u00edst podrobnosti agenta",
      retryAgentDetails: "Zkusit znovu",
      recentExecutions: "Ned\u00e1vn\u00e1 spu\u0161t\u011bn\u00ed",
      noExecutionsYet: "Zat\u00edm \u017e\u00e1dn\u00e1 spu\u0161t\u011bn\u00ed",
      subscription: "odb\u011br",
      subscriptions: "odb\u011bry",
      trigger: "trigger",
      triggers: "triggery",
      closeAgentDetails: "Zav\u0159\u00edt podrobnosti agenta",
      metricConcurrency: "Soub\u011b\u017enost",
      metricTimeout: "\u010casov\u00fd limit",
      metricBudget: "Rozpo\u010det",
      metricConcurrencyTitle: "A\u017e {n} soub\u011b\u017en\u00fdch spu\u0161t\u011bn\u00ed",
      metricTimeoutTitle: "\u010casov\u00fd limit spu\u0161t\u011bn\u00ed: {n} sekund",
      metricBudgetTitle: "Limit rozpo\u010dtu: {n} na spu\u0161t\u011bn\u00ed",
      sessionVerifyFailed: "Nepoda\u0159ilo se ov\u011b\u0159it va\u0161i relaci",
      sessionHelp: "Pokud se to opakuje, zkontrolujte s\u00ed\u0165 nebo p\u0159\u00edpadn\u00e9 blok\u00e1tory reklam.",
      devModeMock: "V\u00fdvojov\u00fd re\u017eim - pou\u017e\u00edvaj\u00ed se testovac\u00ed data",
      signInTitlePrefix: "P\u0159ihlaste se do sv\u00e9ho",
      signInTitleDashboard: "Dashboardu",
      devSignInDesc: "Klikn\u011bte n\u00ed\u017ee a vstupte do dashboardu s uk\u00e1zkov\u00fdmi daty a prozkoumejte rozhran\u00ed.",
      prodSignInDesc: "Sledujte sv\u00e9 cloudov\u00e9 agenty, p\u0159ezkoum\u00e1vejte spu\u0161t\u011bn\u00ed a spravujte ud\u00e1losti na jednom m\u00edst\u011b.",
      signingIn: "P\u0159ihla\u0161ov\u00e1n\u00ed...",
      enterDemoDashboard: "Vstoupit do demo dashboardu",
      continueWithGoogle: "Pokra\u010dovat s Google",
      tryDemo: "Vyzkou\u0161et demo",
      devNoAuth: "Ve v\u00fdvojov\u00e9m re\u017eimu nen\u00ed vy\u017eadov\u00e1no ov\u011b\u0159en\u00ed",
      securedBySupabase: "Zabezpe\u010deno pomoc\u00ed Supabase Authentication",
      errorBoundaryFallback: "Toto zobrazen\u00ed st\u00e1le selh\u00e1v\u00e1. Obnovte str\u00e1nku nebo kontaktujte podporu s v\u00fd\u0161e uveden\u00fdm ID chyby.",
      brandName: "Personas",
      connected: "P\u0159ipojeno",
      weekAbbr: "t",
      disconnected: "Odpojeno",
      totalLabel: "Celkem",
      agent: "Agent",
      connections: "P\u0159ipojen\u00ed",
      eventAnimationPaused: "Animace toku ud\u00e1lost\u00ed pozastavena (omezen\u00fd pohyb)",
      node: "uzel",
      eventBus: "Sb\u011brnice ud\u00e1lost\u00ed",
      eventType: "Typ ud\u00e1losti",
      timestamp: "\u010casov\u00e1 zna\u010dka",
      trafficVolume: "Objem provozu",
      samplePayload: "Uk\u00e1zkov\u00fd payload",
      systemHealth: "Stav syst\u00e9mu",
      health: "Stav",
      memoryInsights: "P\u0159ehledy pam\u011bti",
      suggestion: "n\u00e1vrh",
      suggestions: "n\u00e1vrhy",
      dismissAction: "Zav\u0159\u00edt: {title}",
      allSuggestionsDismissed: "V\u0161echny n\u00e1vrhy byly zav\u0159eny. Zkuste to znovu pozd\u011bji.",
      noDataAvailable: "Zat\u00edm nejsou k dispozici \u017e\u00e1dn\u00e1 data",
      errors: "Chyby",
      totalLower: "celkem",
      copyPayload: "Kop\u00edrovat payload"
    },
    memoriesPage: {
      title: "Pam\u011bti",
      subtitle: "Nau\u010den\u00e9 vzory, kter\u00e9 va\u0161i agenti automaticky uplat\u0148uj\u00ed",
      totalCount: "{n} pam\u011bt\u00ed",
      filters: {
        all: "V\u0161e",
        throttle: "Omezen\u00ed",
        schedule: "Pl\u00e1n",
        alert: "Upozorn\u011bn\u00ed",
        config: "Konfigurace",
        routing: "Sm\u011brov\u00e1n\u00ed"
      },
      status: {
        active: "Aktivn\u00ed",
        pending: "\u010cek\u00e1",
        archived: "Archivov\u00e1no"
      },
      uses: "{n} pou\u017eit\u00ed",
      empty: "\u017d\u00e1dn\u00e9 pam\u011bti neodpov\u00eddaj\u00ed tomuto filtru",
      seeAll: "Zobrazit v\u0161e",
      conflicts: {
        count: "{n} konflikt\u016f",
        resolveButton: "Vy\u0159e\u0161it konflikty",
        modalTitle: "Vy\u0159e\u0161it {n} konflikt\u016f",
        modalSubtitle: "P\u0159ijm\u011bte nebo zam\u00edtn\u011bte ka\u017ed\u00fd z nich, aby va\u0161e \u00falo\u017ei\u0161t\u011b pam\u011bti z\u016fstalo konzistentn\u00ed.",
        accept: "P\u0159ijmout",
        reject: "Zam\u00edtnout",
        cancel: "Zru\u0161it",
        apply: "Pou\u017e\u00edt",
        allResolved: "V\u0161echny konflikty vy\u0159e\u0161eny",
        discardTitle: "Zahodit va\u0161e rozhodnut\u00ed?",
        discardBody: "Klasifikovali jste {n} konflikt\u016f. Zav\u0159en\u00edm nyn\u00ed je zahod\u00edte bez pou\u017eit\u00ed.",
        discardConfirm: "Zahodit",
        discardKeep: "Pokra\u010dovat v \u00faprav\u00e1ch"
      }
    },
    knowledgePage: {
      viewSwitcherLabel: "Zobrazen\u00ed znalost\u00ed",
      title: "Graf znalost\u00ed",
      subtitle: "Vzory nau\u010den\u00e9 ze spu\u0161t\u011bn\u00ed agent\u016f",
      denseTable: "Hutn\u00e1 tabulka",
      graph: "Graf",
      memories: "Pam\u011bti",
      type: "Typ",
      patternKey: "Kl\u00ed\u010d vzoru",
      agent: "Agent",
      success: "\u00dasp\u011bch",
      successLower: "\u00fasp\u011bch",
      failures: "Selh\u00e1n\u00ed",
      failuresLower: "selh\u00e1n\u00ed",
      fails: "Selhalo",
      rate: "M\u00edra",
      rateLower: "m\u00edra",
      cost: "N\u00e1klady",
      tokens: "Tokeny",
      retries: "Opakov\u00e1n\u00ed",
      duration: "Doba trv\u00e1n\u00ed",
      confidence: "Jistota",
      lastSeen: "Naposledy",
      nodes: "Uzly",
      agents: "Agenti",
      clusters: "Klastry",
      avgConfidence: "Pr\u0139\u017bm. jistota",
      all: "V\u0161e",
      agentLinks: "Vazby agent\u0139\u017b",
      nodeSize: "Velikost uzlu",
      confidenceLegend: "= jistota",
      low: "n\u00edzk\u00e1",
      high: "vysok\u00e1",
      patterns: "Vzory",
      avgCost: "Pr\u016fm\u011brn\u00e9 n\u00e1klady",
      clear: "Vymazat",
      noPatterns: "\u017d\u00e1dn\u00e9 vzory neodpov\u00eddaj\u00ed aktu\u00e1ln\u00edm filtr\u016fm",
      types: {
        tool_sequence: "Sekvence n\u00e1stroj\u016f",
        failure_pattern: "Vzor selh\u00e1n\u00ed",
        cost_quality: "N\u00e1klady / Kvalita",
        model_performance: "V\u00fdkon modelu",
        data_flow: "Tok dat"
      }
    },
    reviewsPage: {
      selectReview: "Vybrat revizi",
      selectAllPending: "Vybrat v\u0161echny \u010dekaj\u00edc\u00ed revize",
      focus: {
        enter: "Zam\u011b\u0159it se na tok",
        exit: "Ukon\u00c4\u0164it",
        volume: "Hlasitost",
        skipTo: "P\u0159ej\u00edt na",
        chapterHome: "Dom\u016f",
        progress: "{n} z {total}",
        skip: "P\u0159esko\u010dit",
        empty: "V\u0161e vy\u0159\u00edzeno \u2014 \u017e\u00e1dn\u00e9 \u010dekaj\u00edc\u00ed revize",
        approve: "Schv\u00e1lit",
        reject: "Zam\u00edtnout"
      },
      parseError: {
        label: "Chyba anal\u00fdzy",
        detail: "Po\u0161kozen\u00fd payload \u2014 eskalov\u00e1no na kritick\u00e9, dokud nebude p\u0159ezkoum\u00e1no"
      }
    },
    leaderboardPage: {
      title: "\u017deb\u0159\u00ed\u010dek",
      subtitle: "Po\u0159ad\u00ed flotily podle souhrnn\u00e9ho v\u00fdkonu",
      rank: "Po\u0159ad\u00ed",
      composite: "Souhrn",
      delta: "Zm\u011bna",
      sortBy: "Se\u0159adit podle: {field}",
      compare: "Porovnat",
      versus: "vs.",
      radarTitle: "Profil metrik",
      rankBy: "Se\u0159adit podle",
      overall: "Celkov\u00e9",
      metrics: {
        reliability: "Spolehlivost",
        cost: "N\u00e1klady",
        tokens: "Tokeny",
        retries: "Opakov\u00e1n\u00ed",
        speed: "Rychlost",
        quality: "Kvalita",
        volume: "Objem",
        skipTo: "P\u0159ej\u00edt na",
        chapterHome: "Dom\u016f"
      },
      trend: {
        up: "Nahoru",
        down: "Dol\u016f",
        flat: "Beze zm\u011bny"
      }
    },
    slaPage: {
      title: "SLA",
      subtitle: "C\u00edle \u00farovn\u011b slu\u017eeb, dodr\u017eov\u00e1n\u00ed a historie poru\u0161en\u00ed",
      compliance: "Dodr\u017eov\u00e1n\u00ed",
      activeBreaches: "Aktivn\u00ed poru\u0161en\u00ed",
      objectives: "C\u00edle",
      target: "C\u00edl",
      current: "Aktu\u00e1ln\u00ed",
      timeInSla: "\u010cas v r\u00e1mci SLA",
      targetFilter: {
        all: "V\u0161e",
        atRisk: "Ohro\u017eeno",
        healthy: "V po\u0159\u00e1dku"
      },
      metricType: {
        availability: "Dostupnost",
        latency: "Latence p95",
        successRate: "M\u00edra \u00fasp\u011b\u0161nosti"
      },
      severity: {
        minor: "Men\u0161\u00ed",
        major: "Z\u00e1va\u017en\u00e9",
        critical: "Kritick\u00e9"
      },
      breachLog: {
        title: "Z\u00e1znam poru\u0161en\u00ed",
        all: "V\u0161e",
        started: "Za\u010d\u00e1tek",
        resolved: "Vy\u0159e\u0161eno",
        otherBreaches: "Dal\u0161\u00ed poru\u0161en\u00ed podle {persona}: {n}",
        timeToResolve: "Doba do vy\u0159e\u0161en\u00ed",
        elapsed: "Uplynulo",
        empty: "Za posledn\u00edch 7 dn\u00ed \u017e\u00e1dn\u00e1 poru\u0161en\u00ed.",
        ongoing: "Prob\u00edh\u00e1",
        duration: "{n} min"
      }
    },
    incidentsPage: {
      title: "Incidenty",
      subtitle: "Incidenty auditn\u00edho protokolu nap\u0159\u00ed\u010d flotilou",
      open: "Otev\u0159en\u00e9",
      total: "Celkem",
      bySeverity: "Podle z\u00e1va\u017enosti",
      bySource: "Podle zdroje",
      incidents: "incident\u016f",
      groupByLabel: "Seskupit podle",
      clearFilters: "Vymazat filtry",
      allPersonas: "V\u0161echny persony",
      statusLabel: "Stav",
      severity: {
        critical: "Kritick\u00e1",
        high: "Vysok\u00e1",
        medium: "St\u0159edn\u00ed",
        low: "N\u00edzk\u00e1"
      },
      status: {
        all: "V\u0161e",
        open: "Otev\u0159en\u00fd",
        resolved: "Vy\u0159e\u0161en\u00fd",
        ignored: "Ignorovan\u00fd",
        escalated: "Eskalovan\u00fd"
      },
      source: {
        all: "V\u0161echny zdroje",
        executions: "Spu\u0161t\u011bn\u00ed",
        events: "Ud\u00e1losti",
        triggers: "Spou\u0161t\u011b\u010de",
        vault: "Trezor",
        messages: "Zpr\u00e1vy",
        reviews: "Kontroly"
      },
      groupBy: {
        none: "\u017d\u00e1dn\u00e9",
        agent: "Agent",
        severity: "Z\u00e1va\u017enost",
        source: "Zdroj"
      },
      badges: {
        circuitBreaker: "Jisti\u010d",
        autoFixed: "Automaticky opraveno"
      },
      detail: {
        recommendation: "Doporu\u010den\u00e1 akce",
        source: "Zdroj",
        category: "Kategorie",
        persona: "Agent",
        detected: "Zji\u0161t\u011bno",
        resolved: "Vy\u0159e\u0161eno",
        ongoing: "Prob\u00edh\u00e1"
      },
      empty: {
        title: "\u017d\u00e1dn\u00e9 incidenty",
        description: "Flotila je v po\u0159\u00e1dku \u2014 nebyly zaznamen\u00e1ny \u017e\u00e1dn\u00e9 auditn\u00ed incidenty.",
        filteredTitle: "\u017d\u00e1dn\u00e9 odpov\u00eddaj\u00edc\u00ed incidenty",
        filteredDescription: "\u017d\u00e1dn\u00e9 incidenty neodpov\u00eddaj\u00ed aktu\u00e1ln\u00edm filtr\u016fm."
      }
    },
    healthPage: {
      title: "Stav syst\u00e9mu",
      subtitle: "B\u011bhov\u00e9 prost\u0159ed\u00ed, slu\u017eby, zdroje a integrace",
      sections: {
        runtime: "B\u011bhov\u00e9 prost\u0159ed\u00ed",
        services: "Slu\u017eby",
        resources: "Zdroje",
        integrations: "Integrace"
      },
      status: {
        ok: "V po\u0159\u00e1dku",
        warn: "Varov\u00e1n\u00ed",
        error: "Chyba",
        info: "Info"
      },
      diskUsage: "Vyu\u017eit\u00ed disku",
      used: "vyu\u017eito",
      free: "voln\u00e9",
      actions: {
        install: "Instalovat",
        configure: "Konfigurovat"
      },
      toast: {
        configured: "nakonfigurov\u00e1no (demo)",
        installed: "aktivov\u00e1no (demo)"
      }
    },
    messagesPage: {
      title: "Zpr\u00e1vy",
      subtitle: "Asynchronn\u00ed zp\u011btn\u00e1 vazba od ka\u017ed\u00e9 persony ve flotile",
      unread: "Nep\u0159e\u010dteno",
      read: "P\u0159e\u010dteno",
      empty: "Na t\u00e9to str\u00e1nce nejsou \u017e\u00e1dn\u00e9 zpr\u00e1vy.",
      expand: "Zobrazit payload",
      collapse: "Skr\u00fdt payload",
      pagination: {
        prev: "P\u0159edchoz\u00ed",
        next: "Dal\u0161\u00ed",
        page: "Str\u00e1nka {n} z {total}"
      },
      markAllRead: "Ozna\u010dit v\u0161e jako p\u0159e\u010dten\u00e9",
      viewThreads: "Vl\u00e1kna",
      viewList: "Seznam",
      reply: "Odpov\u011b\u010f"
    },
    observabilityPage: {
      usageInsight: "{top} se pou\u017e\u00edv\u00e1 {ratio}x v\u00edce ne\u017e {second}, tak\u017ee je va\u0161\u00ed nejvyu\u017e\u00edvan\u011bj\u0161\u00ed integrac\u00ed n\u00e1stroj\u016f.",
      title: "Pozorovatelnost",
      subtitle: "Metriky v\u00fdkonu, sledov\u00e1n\u00ed n\u00e1klad\u016f a vyu\u017eit\u00ed n\u00e1stroj\u016f",
      tabPerformance: "V\u00fdkon",
      tabUsage: "Vyu\u017eit\u00ed n\u00e1stroj\u016f",
      tabActivity: "Aktivita",
      circuitBreaker: "Circuit breaker",
      autoFixed: "Automaticky opraveno",
      resolved: "Vy?e?eno",
      autoFixApplied: "Automatick? oprava pou?ita",
      costAnomalyDetected: "Anom?lie n?klad? zji?t?na dne",
      budgetThresholdExceeded: "Limit rozpo?tu p?ekro?en pro",
      totalCost: "Celkov? n?klady",
      executions: "Spu?t?n?",
      successRate: "?sp??nost",
      activePersonas: "Aktivn? persony",
      costOverTime: "N?klady v ?ase",
      previousPeriod: "oproti p?edchoz?mu obdob?",
      executionHealth: "Stav spu?t?n?",
      latencyDistribution: "Rozlo?en? latence",
      latencyPercentiles: "P50 / P95 / P99",
      spendByAgent: "?trata podle agenta",
      noSpendData: "??dn? data o ?trat?",
      healthIssues: "Zdravotn? probl?my",
      open: "otev?en?",
      analyzing: "Analyzuji...",
      runAnalysis: "Spustit anal?zu",
      runningAnalysis: "Prob?h? anal?za zdrav? nap??? sledovan?mi slu?bami...",
      allSystemsHealthy: "V?echny syst?my jsou v po??dku",
      noIssuesDetected: "Ve sledovan?ch slu?b?ch nebyly zji?t?ny probl?my",
      noSeverityIssues: "??dn? probl?my z?va?nosti {severity}",
      exampleDataNotice: "Zobrazuj? se uk?zkov? data. Skute?n? analytika se objev?, jakmile agenti za?nou spou?t?t ?lohy.",
      toolInvocations: "Vol?n? n?stroj?",
      distribution: "Rozlo?en?",
      usageOverTime: "Vyu?it? v ?ase",
      last14Days: "Posledn?ch 14 dn?",
      toolUsageByAgent: "Vyu?it? n?stroj? podle agenta",
      other: "Ostatn?",
      athenaUsage: "Vyu\u017eit\u00ed Athena",
      athenaSubtitle: "N\u00e1klady Companionu podle akce",
      athenaActions: {
        invoke: "Vyvol\u00e1n\u00ed",
        recall: "Na\u010dten\u00ed",
        fallback: "Z\u00e1loha"
      },
      valueRollup: "P\u0159ehled hodnoty",
      valueDelivered: "Dodan\u00e1 hodnota",
      costPerValue: "N\u00e1klady na hodnotu",
      outcomes: {
        delivered: "Dod\u00e1no",
        partial: "\u010c\u00e1ste\u010dn\u011b",
        blocked: "Blokov\u00e1no"
      },
      severity: {
        all: "v?e",
        critical: "kritick?",
        high: "vysok?",
        medium: "st?edn?",
        low: "n?zk?"
      }
    },
    agentsPage: {
      statusLive: "Aktivn\u00ed",
      statusOff: "Vypnuto",
      title: "Agenti",
      noAgents: "Nejsou nasazeni \u017e\u00e1dn\u00ed agenti",
      noAgentsDesc: "Nasa\u010fte sv\u00e9ho prvn\u00edho agenta z desktopov\u00e9 aplikace Personas a pot\u00e9 se sem vra\u0165te a sledujte ho.",
      agentDeployed: "nasazen\u00fd agent",
      agentsDeployed: "nasazen\u00edch agent\u016f",
      manualExecution: "Ru\u010dn\u00ed spu\u0161t\u011bn\u00ed z dashboardu",
      maxConcurrent: "max",
      timeoutSeconds: "timeout {n} s",
      budget: "rozpo?et",
      execute: "Spustit",
      executing: "Spou\u0161t\u00edm\u2026",
      executeQueued: "Spu\u0161t\u011bn\u00ed za\u0159azeno do fronty pro {name}",
      executeFailed: "Nepoda\u0159ilo se spustit {name}",
      details: "Detaily"
    },
    executionsPage: {
      title: "Spou\u0161t\u011bn\u00ed",
      all: "V\u0161e",
      active: "Aktivn\u00ed",
      completed: "Dokon\u010den\u00e9",
      failed: "Selhalo",
      cancelled: "Zru\u0161en\u00e9",
      agent: "Agent",
      duration: "Trv\u00e1n\u00ed",
      cost: "Cena",
      tokens: "Tokeny",
      retries: "Opakov\u00e1n\u00ed",
      started: "Zah\u00e1jeno",
      noExecutions: "Zat\u00edm \u017e\u00e1dn\u00e1 spu\u0161t\u011bn\u00ed",
      noExecutionsDesc: "Spus\u0165te agenta a uvid\u00edte v\u00fdsledky zde",
      waitingForWorker: "\u010cek\u00e1 se na pracovn\u00ed proces...",
      noOutputYet: "Zat\u00edm \u017e\u00e1dn\u00fd v\u00fdstup",
      noFilteredActive: "V tomto zobrazen\u00ed nejsou \u017e\u00e1dn\u00e9 aktivn\u00ed b\u011bhy",
      noFilteredCompleted: "V tomto zobrazen\u00ed nejsou \u017e\u00e1dn\u00e9 dokon\u010den\u00e9 b\u011bhy",
      noFilteredFailed: "V tomto zobrazen\u00ed nejsou \u017e\u00e1dn\u00e9 ne\u00fasp\u011b\u0161n\u00e9 b\u011bhy",
      noFilteredCancelled: "V tomto zobrazen\u00ed nejsou \u017e\u00e1dn\u00e9 zru\u0161en\u00e9 b\u011bhy",
      filteredEmptyDesc: "Existuj\u00ed dal\u0161\u00ed b\u011bhy, ale \u017e\u00e1dn\u00fd neodpov\u00edd\u00e1 tomuto filtru.",
      showAllExecutions: "Zobrazit v\u0161e"
    },
    eventsPage: {
      title: "Ud\u00e1losti",
      subtitle: "Aktivita event busu p\u0159es v\u0161echny agenty",
      tabEvents: "Ud\u00e1losti",
      tabSubscriptions: "Odeb\u00edr\u00e1n\u00ed",
      tabVisualization: "Vizualizace",
      tabSwimlane: "\u010casov\u00e1 osa",
      event: "Ud?lost",
      source: "Zdroj",
      time: "?as",
      id: "ID",
      sourceLabel: "Zdroj",
      processed: "Zpracov?no",
      retry: "Opakovat",
      selectForBulkRetry: "Vybrat pro hromadn? opakov?n?",
      showRelatedEvents: "Zobrazit {count} souvisej?c?ch ud?lost?",
      retriedCount: "Opakov?no {count}?",
      retryEvent: "Opakovat ud?lost",
      searchPlaceholder: "Hledat payloady, typy ud?lost?, zdroje, chyby...",
      clearSearch: "Vymazat hled?n?",
      eventType: "Typ ud?losti",
      sourceType: "Typ zdroje",
      clearFilters: "Vymazat filtry",
      chain: "?et?z",
      events: "ud?lost?",
      result: "v?sledek",
      results: "v?sledk?",
      noDeadLetters: "??dn? dead letters",
      noDeadLettersDescription: "Ne?sp??n? ud?losti s chybami se zobraz? zde pro opakov?n?",
      noMatchingEvents: "??dn? odpov?daj?c? ud?losti",
      noEvents: "??dn? ud?losti",
      noMatchingEventsDescription: "Zkuste upravit hled?n? nebo filtry",
      noEventsDescription: "Ud?losti se zobraz?, jakmile agenti zpracuj? spou?t??e a odb?ry",
      loadMore: "Na??st dal?? ud?losti",
      failedEventSelected: "vybran? ne?sp??n? ud?lost",
      failedEventsSelected: "vybran?ch ne?sp??n?ch ud?lost?",
      selectAllFailed: "Vybrat v?echny ne?sp??n?",
      retryAll: "Opakovat v?e",
      active: "Aktivn\u00ed",
      disabled: "Zak\u00e1z\u00e1no",
      created: "Vytvo\u0159eno",
      match: "shoda",
      matches: "shody",
      deleteSubscription: "Odstranit odb\u011br",
      unknownAgent: "Nezn\u00e1m\u00fd agent",
      disableSubscription: "Zak\u00e1zat odb\u011br",
      enableSubscription: "Povolit odb\u011br",
      createSubscription: "Vytvo\u0159it odb\u011br",
      persona: "Persona",
      selectPersona: "Vyberte personu...",
      selectEventType: "Vyberte typ ud\u00e1losti...",
      sourceFilter: "Filtr zdroje",
      optional: "voliteln\u00e9",
      sourceFilterPlaceholder: "nap\u0159. github, pagerduty...",
      create: "Vytvo\u0159it",
      newSubscription: "Nov\u00fd odb\u011br",
      noMatchingSubscriptions: "\u017d\u00e1dn\u00e9 odpov\u00eddaj\u00edc\u00ed odb\u011bry",
      noSubscriptions: "\u017d\u00e1dn\u00e9 odb\u011bry",
      noSubscriptionsDescription: "Vytvo\u0159te odb\u011bry pro sm\u011brov\u00e1n\u00ed ud\u00e1lost\u00ed k va\u0161im agent\u016fm",
      swimlane: {
        title: "\u010casov\u00e9 pruhy ud\u00e1lost\u00ed",
        subtitle: "\u010casov\u011b se\u0159azen\u00e1 stopa ud\u00e1lost\u00ed podle persony",
        empty: "Ve vybran\u00e9m obdob\u00ed nejsou \u017e\u00e1dn\u00e9 ud\u00e1losti"
      },
      connectionStatus: {
        connected: "Realtime: p\u0159ipojeno",
        reconnecting: "Op\u011btovn\u00e9 p\u0159ipojov\u00e1n\u00ed ke streamu ud\u00e1lost\u00ed\u2026",
        polling: "Zji\u0161\u0165ov\u00e1n\u00ed aktualizac\u00ed (se zpo\u017ed\u011bn\u00edm)"
      }
    },
    settingsPage: {
      title: "Nastaven\u00ed",
      subtitle: "Konfigurace \u00fa\u010dtu a cloudov\u00e9ho p\u0159ipojen\u00ed",
      account: "\u00da\u010det",
      cloudConnection: "Cloudov\u00e9 p\u0159ipojen\u00ed",
      orchestrator: "Orchestr\u00e1tor",
      notConfigured: "Nenastaveno",
      totalWorkers: "Celkem worker\u016f",
      queueLength: "D\u00e9lka fronty",
      activeExecutions: "Aktivn\u00ed spu\u0161t\u011bn\u00ed",
      notifications: {
        title: "Ozn\u00e1men\u00ed",
        subtitle: "Upozorn\u011bn\u00ed na opravy a souhrny",
        weeklyDigest: "T\u00fddenn\u00ed souhrn zdrav\u00ed",
        voice: {
          label: "Oznamovat nov\u00e9 revize nahlas",
          preview: "N\u00e1hled",
          newReviewRequest: "Nov\u00e1 \u017e\u00e1dost o revizi",
          announcement: "Nov\u00e1 revize typu {severity} od {persona}",
          unknownPersona: "agenta",
          severity: {
            critical: "kritick\u00e1",
            warning: "varovn\u00e1",
            info: "informa\u010dn\u00ed"
          }
        },
        severity: {
          critical: "Kritick\u00e1",
          high: "Vysok\u00e1",
          medium: "St\u0159edn\u00ed",
          low: "N\u00edzk\u00e1"
        }
      },
      providers: {
        title: "Poskytovatel\u00e9 model\u016f",
        subtitle: "Kter\u00e9 modely mohou va\u0161i agenti pou\u017e\u00edvat",
        allowed: "Povoleno",
        requests: "po\u017eadavk\u016f"
      },
      rotation: {
        title: "Rotace p\u0159ihla\u0161ovac\u00edch \u00fadaj\u016f",
        subtitle: "Stav rotace trezoru",
        hasPolicy: "Z\u00e1sada",
        noPolicy: "Bez z\u00e1sady",
        auto: "Automaticky",
        manual: "Ru\u010dn\u011b",
        anomaly: "Anom\u00e1lie",
        next: "Dal\u0161\u00ed",
        overdue: "Po term\u00ednu"
      }
    },
    legalPage: {
      title: "Pr\u00e1vn\u00ed informace",
      heading: "Pr\u00e1vn\u00ed str\u00e1nky ji\u017e brzy",
      description: "Na\u0161e z\u00e1sady ochrany osobn\u00edch \u00fadaj\u016f a podm\u00ednky slu\u017eby se dokon\u010duj\u00ed. Pokud m\u00e1te mezit\u00edm jak\u00e9koli dotazy, obra\u0165te se na n\u00e1s."
    },
    waitlist: {
      title: "P\u0159idat se na \u010dekac\u00ed listinu",
      subtitle: "Bu\u010fte prvn\u00ed, kdo se dozv\u00ed, kdy spust\u00edme pro",
      emailPlaceholder: "Zadejte sv\u016fj e-mail",
      earlyBeta: "Chci early beta p\u0159\u00edstup",
      submit: "P\u0159idat se na \u010dekac\u00ed listinu",
      joining: "P\u0159ipojov\u00e1n\u00ed...",
      success: "Jste na seznamu!",
      successDesc: "Jakmile bude build p\u0159ipraven, d\u00e1me v\u00e1m v\u011bd\u011bt.",
      duplicate: "Ji\u017e registrov\u00e1no",
      duplicateDesc: "Ji\u017e jste na \u010dekac\u00ed listin\u011b. D\u00e1me v\u00e1m v\u011bd\u011bt, jakmile bude v\u0161e p\u0159ipraveno.",
      shareTitle: "Sd\u00edlet s p\u0159\u00e1teli",
      copied: "Zkop\u00edrov\u00e1no!",
      copyLink: "Kop\u00edrovat odkaz",
      peopleWaiting: "lid\u00ed \u010dek\u00e1",
      errorGeneric: "N\u011bco se pokazilo. Zkuste to pros\u00edm znovu."
    },
    templatesPage: {
      title: "\u0139\u00a0ablony agent\u0139\u017b",
      subtitle: "Proch\u00e1zejte {count} hotov\u00fdch \u0161ablon agent\u016f seskupen\u00fdch podle druhu pr\u00e1ce, kterou vykon\u00e1vaj\u00ed. Vyberte kategorii a zobrazte \u0161ablony uvnit\u0159.",
      gridHeading: "Proch\u00e1zet \u0161ablony podle kategorie",
      gridDescription: "\u0160ablony jsou p\u0159edkonfigurovan\u00e9 Persony, kter\u00e9 m\u016f\u017eete p\u0159ijmout jedn\u00edm kliknut\u00edm. Ka\u017ed\u00e1 \u0161ablona u\u017e m\u00e1 propojen\u00fd prompt, n\u00e1stroje a triggery pro konkr\u00e9tn\u00ed \u00fakol \u2014 \u017e\u00e1dn\u00e9 nastavov\u00e1n\u00ed nen\u00ed t\u0159eba.",
      changeCategory: "Zm\u011bnit kategorii",
      complexityAll: "V\u0161e",
      complexityBasic: "Z\u00e1kladn\u00ed",
      complexityProfessional: "Profesion\u00e1ln\u00ed",
      complexityEnterprise: "Enterprise",
      searchPlaceholder: "Hledat \u0161ablony, n\u00e1stroje, slu\u017eby...",
      searchAriaLabel: "Hledat \u0161ablony",
      showingCount: "Zobrazeno {shown} z {total} \u0161ablon",
      noMatches: "\u017d\u00e1dn\u00e9 \u0161ablony neodpov\u00eddaj\u00ed va\u0161im filtr\u016fm",
      clearFilters: "Vymazat filtry",
      viewDetails: "Zobrazit detaily",
      filterByComplexity: "Filtrovat podle slo?itosti",
      backToTemplates: "Zp?t na ?ablony",
      keyBenefits: "Hlavn? v?hody",
      triggers: "Spou?t??e",
      services: "Slu?by",
      configuration: "Konfigurace",
      copied: "Zkop?rov?no",
      copy: "Kop?rovat",
      copyFailed: "Kop?rov?n? selhalo",
      copyConfiguration: "Kop?rovat konfiguraci",
      getStartedTitle: "Za??t s touto ?ablonou",
      getStartedDescription: "Importujte tuto ?ablonu p??mo do Personas, nebo zkop?rujte konfiguraci a upravte ji sami.",
      openInPersonas: "Otev??t v Personas",
      moreTemplates: "Dal?? ?ablony {category}",
      appNotFoundTitle: "Aplikace Personas nenalezena",
      appNotFoundDescription: "Zd? se, ?e Personas zat?m nen? na va?em za??zen? nainstalov?no. St?hn?te si ho pro p??m? import ?ablon, nebo zkop?rujte konfiguraci pro ru?n? nastaven?.",
      templateNotFound: "?ablona nenalezena",
      templateNotFoundDescription: "Tato ?ablona neexistuje nebo byla vy?azena. Prohl?dn?te si galerii aktu?ln? kolekce.",
      browseTemplates: "Proch?zet ?ablony",
      backToHome: "Zp?t dom?",
      customTrigger: "Vlastn? spou?t??"
    },
    roadmapSection: {
      inProgress: "Prob\u00edh\u00e1",
      next: "Dal\u0161\u00ed",
      planned: "Pl\u00e1nov\u00e1no",
      completed: "Dokon\u010deno",
      empty: "Moment\u00e1ln\u011b nic napl\u00e1nov\u00e1no.",
      emptyHint: "Pod\u00edvejte se brzy znovu \u2014 jakmile napl\u00e1nujeme dal\u0161\u00ed miln\u00edky, objev\u00ed se zde.",
      heading: "Pl\u00e1n",
      gradient: "produktu",
      description: "Kde se dnes nach\u00e1z\u00ed ka\u017ed\u00e1 oblast Personas \u2014 pln\u011bn\u00ed zleva doprava, ne sliby shora dol\u016f.",
      progress: {
        phasesComplete: "Dokon\u010deno {completed} z {total} f\u00e1z\u00ed",
        noneDone: "Zat\u00edm \u017e\u00e1dn\u00e9 f\u00e1ze dokon\u010deny",
        firstDone: "F\u00e1ze 1 dokon\u010dena",
        rangeDone: "F\u00e1ze 1-{count} dokon\u010deny",
        toGoOne: "zb\u00fdv\u00e1 {count} f\u00e1ze",
        toGoOther: "zb\u00fdv\u00e1 {count} f\u00e1z\u00ed"
      },
      areas: {
        i18n: {
          title: "Internacionalizace",
          caption: "{count} lokalizac\u00ed, ru\u010dn\u011b p\u0159elo\u017een\u00fdch \u2014 ka\u017ed\u00e1 vlajka se vyv\u00edj\u00ed spolu s pokryt\u00edm"
        },
        devices: {
          title: "Podpora za\u0159\u00edzen\u00ed",
          caption: "Personas na ka\u017ed\u00e9m va\u0161em za\u0159\u00edzen\u00ed"
        },
        collaboration: {
          title: "Spolupr\u00e1ce",
          caption: "Od jednoho oper\u00e1tora po celou organizaci"
        },
        platform: {
          title: "Z\u00e1kladn\u00ed platforma",
          caption: "V\u00fdvojov\u00fd re\u017eim, cloudov\u00e9 spou\u0161t\u011bn\u00ed, konektory, bezprobl\u00e9mov\u00e9 instalace"
        },
        templates: {
          title: "Galerie \u0161ablon",
          caption: "Startovn\u00ed agenti podle kategorie \u2014 \u017eiv\u00e9 po\u010dty v galerii"
        }
      },
      bars: {
        europe: "Evropa",
        asiaPacific: "Asie a Tichomo\u0159\u00ed",
        southAsia: "Ji\u017en\u00ed Asie",
        middleEast: "Bl\u00edzk\u00fd v\u00fdchod \u00b7 RTL",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        web: "Web",
        mobileCompanion: "Mobiln\u00ed spole\u010dn\u00edk",
        solo: "S\u00f3lo",
        team: "T\u00fdm",
        enterprise: "Enterprise",
        devMode: "Dev re\u017eim",
        connectors: "Konektory",
        cloudExecution: "B\u011bh v cloudu",
        installersUpdates: "Instal\u00e1tory a aktualizace",
        allCategories: "V\u0161echny kategorie",
        devops: "DevOps",
        productivity: "Produktivita",
        communication: "Komunikace",
        marketing: "Marketing",
        research: "V\u00fdzkum",
        security: "Zabezpe\u010den\u00ed",
        financeCluster: "Finance \u00b7 Prodej \u00b7 Podpora \u00b7 Pr\u00e1vn\u00ed odd\u011blen\u00ed"
      },
      detail: {
        localeOne: "{n} jazyk",
        localeOther: "{n} jazyk\u016f",
        shipped: "vyd\u00e1no",
        inDevelopment: "ve v\u00fdvoji",
        thisSite: "tento web",
        preview: "n\u00e1hled",
        sharedAgents: "sd\u00edlen\u00fdch agent\u016f",
        ssoAudit: "SSO \u00b7 audit",
        instantPreview: "okam\u017eit\u00fd n\u00e1hled",
        services: "{n} slu\u017eeb",
        runs247: "provoz 24/7",
        autoUpdate: "automatick\u00e1 aktualizace",
        templatesTotal: "{n} / {total} \u0161ablon"
      },
      barAria: "{label}: {pct} %"
    },
    featureVoting: {
      eyebrow: "Komunita",
      heading: "Hlasujte o tom,",
      headingGradient: "co bude d\u00e1l",
      subheading: "Pomozte n\u00e1m ur\u010dit priority. Vyberte funkce, na kter\u00fdch v\u00e1m nejv\u00edce z\u00e1le\u017e\u00ed, a utv\u00e1\u0159ejte budoucnost Personas.",
      features: {
        macos: {
          title: "Podpora macOS",
          description: "Plnohodnotn\u00fd nativn\u00ed build pro macOS s optimalizac\u00ed pro Apple Silicon, integrac\u00ed Spotlight a ovl\u00e1d\u00e1n\u00edm agent\u016f v panelu nab\u00eddek."
        },
        i18n: {
          title: "Internacionalizace",
          description: "V\u00edcejazy\u010dn\u00e9 instrukce pro agenty, lokalizovan\u00e9 rozhran\u00ed a pl\u00e1nov\u00e1n\u00ed s ohledem na region pro celosv\u011btov\u00e9 t\u00fdmy."
        },
        dashboard: {
          title: "Webov\u00fd dashboard",
          description: "Prohl\u00ed\u017ee\u010dov\u00fd dashboard pro sledov\u00e1n\u00ed agent\u016f v re\u00e1ln\u00e9m \u010dase, historii spu\u0161t\u011bn\u00ed a spr\u00e1vu flotily z libovoln\u00e9ho za\u0159\u00edzen\u00ed."
        },
        enterprise: {
          title: "Enterprise projekty",
          description: "V\u00edcen\u00e1jemn\u00e9 pracovn\u00ed prostory, RBAC, auditn\u00ed z\u00e1znamy, integrace SSO a sd\u00edlen\u00e9 \u0161ablony agent\u016f nap\u0159\u00ed\u010d va\u0161\u00ed organizac\u00ed."
        }
      },
      voteAria: "Hlasovat pro {feature}",
      commentsToggleAria: "Zobrazit koment\u00e1\u0159e k {feature}",
      discussion: "Diskuze",
      noComments: "Zat\u00edm \u017e\u00e1dn\u00e9 koment\u00e1\u0159e. Bu\u010fte prvn\u00ed, kdo se pod\u011bl\u00ed o sv\u016fj n\u00e1zor.",
      replying: "Odpov\u00edd\u00e1n\u00ed",
      reply: "Odpov\u011bd\u011bt",
      addCommentPlaceholder: "P\u0159idat koment\u00e1\u0159...",
      writeReplyPlaceholder: "Napsat odpov\u011b\u010f...",
      sendCommentAria: "Odeslat koment\u00e1\u0159",
      summary: {
        totalVotes: "{count} hlas\u016f celkem",
        commentOne: "{count} koment\u00e1\u0159",
        commentOther: "{count} koment\u00e1\u0159\u016f",
        boostOne: "{count} boost",
        boostOther: "{count} boost\u016f",
        live: "\u017div\u011b"
      },
      boost: {
        label: "Boost",
        toggleAria: "Boostnout {feature}",
        tierAria: "Boostnout \u010d\u00e1stkou {amount}"
      },
      request: {
        title: "M\u00e1te na mysli n\u011bco jin\u00e9ho?",
        subtitle: "Navrhn\u011bte funkci",
        placeholder: "Popi\u0161te funkci, kterou byste cht\u011bli vid\u011bt...",
        submitAria: "Odeslat n\u00e1vrh",
        success: "D\u011bkujeme! N\u00e1vrh byl zaznamen\u00e1n.",
        errorNetwork: "Chyba s\u00edt\u011b \u2014 zkontrolujte pros\u00edm p\u0159ipojen\u00ed a zkuste to znovu.",
        errorRateLimit: "Pos\u00edl\u00e1te n\u00e1vrhy p\u0159\u00edli\u0161 rychle. Chv\u00edli pros\u00edm po\u010dkejte.",
        errorInvalid: "Zadejte pros\u00edm platn\u00fd n\u00e1vrh (1\u20131000 znak\u016f).",
        errorGeneric: "P\u0159i ukl\u00e1d\u00e1n\u00ed va\u0161eho n\u00e1vrhu do\u0161lo k chyb\u011b. Zkuste to pros\u00edm znovu.",
        sponsor: "Podpo\u0159te tento po\u017eadavek"
      },
      timeAgo: {
        justNow: "pr\u00e1v\u011b te\u010f",
        minutes: "p\u0159ed {n} min",
        hours: "p\u0159ed {n} h",
        days: "p\u0159ed {n} dny"
      }
    },
    eventBusSection: {
      dynamicSwarm: "Dynamick\u00fd roj",
      latencyLanes: "Pruhy latence",
      ephemeralConnections: "Do\u010dasn\u00e1 p\u0159ipojen\u00ed",
      queueDepth: "Hloubka fronty + propustnost"
    },
    guide: {
      title: "U\u017eivatel",
      subtitle: "V\u0161e, co pot\u0159ebujete v\u011bd\u011bt o Personas \u2014 od va\u0161eho prvn\u00edho agenta a\u017e po pokro\u010dil\u00e9 multiagentn\u00ed pipeline.",
      searchPlaceholder: "Prohledat 100+ t\u00e9mat...",
      searchInCategory: "Hledat v t\u00e9to kategorii...",
      topics: "t\u00e9mat",
      backToGuide: "Zp\u011bt na pr\u016fvodce",
      showAllResults: "Zobrazit v\u0161echny v\u00fdsledky",
      noResults: "Nebyla nalezena \u017e\u00e1dn\u00e1 t\u00e9mata. Zkuste jin\u00fd v\u00fdraz.",
      stillQuestions: "St\u00e1le m\u00e1te ot\u00e1zky?",
      joinDiscord: "P\u0159ipojte se k na\u0161emu Discordu",
      copyAnchor: "Zkop\u00edrovat odkaz na sekci",
      categories: {
        "getting-started": "Za\u010d\u00edn\u00e1me",
        "agents-prompts": "Agenti a prompty",
        triggers: "Spou\u0161t\u011b\u010de a pl\u00e1nov\u00e1n\u00ed",
        credentials: "P\u0159ihla\u0161ovac\u00ed \u00fadaje a zabezpe\u010den\u00ed",
        pipelines: "Pipeline a t\u00fdmy",
        testing: "Testov\u00e1n\u00ed a optimalizace",
        memories: "Pam\u011bti a znalosti",
        monitoring: "Monitoring a n\u00e1klady",
        deployment: "Nasazen\u00ed a integrace",
        troubleshooting: "\u0158e\u0161en\u00ed probl\u00e9m\u016f"
      },
      categoryDescriptions: {
        "getting-started": "Nainstalujte Personas, vytvo\u0159te sv\u00e9ho prvn\u00edho agenta a nau\u010dte se z\u00e1klady za m\u00e9n\u011b ne\u017e 10 minut.",
        credentials: "Bezpe\u010dn\u011b se p\u0159ipojte ke slu\u017eb\u00e1m. Pochopte \u0161ifrovan\u00fd trezor a jak va\u0161e data z\u016fst\u00e1vaj\u00ed v bezpe\u010d\u00ed.",
        "agents-prompts": "Vytv\u00e1\u0159ejte, konfigurujte a doluje sv\u00e9 AI agenty. Ovl\u00e1dn\u011bte jednoduch\u00fd i strukturovan\u00fd re\u017eim prompt\u016f.",
        triggers: "Nastavte, kdy a jak va\u0161i agenti b\u011b\u017e\u00ed \u2014 pl\u00e1ny, webhooky, sledov\u00e1n\u00ed soubor\u016f a dal\u0161\u00ed.",
        pipelines: "Propojte agenty do vizu\u00e1ln\u00edch pipeline. Vytv\u00e1\u0159ejte multiagentn\u00ed pracovn\u00ed postupy na t\u00fdmov\u00e9m pl\u00e1tn\u011b.",
        memories: "Va\u0161i agenti se u\u010d\u00ed a pamatuj\u00ed si. Spravujte, co v\u011bd\u00ed a jak vyu\u017e\u00edvaj\u00ed minul\u00e9 zku\u0161enosti.",
        monitoring: "Sledujte ka\u017ed\u00e9 spu\u0161t\u011bn\u00ed v re\u00e1ln\u00e9m \u010dase. Zjist\u011bte, co va\u0161i agenti d\u011blaj\u00ed, jak dob\u0159e funguj\u00ed a kolik stoj\u00ed.",
        testing: "Spou\u0161t\u011bjte ar\u00e9nov\u00e9 testy, A/B porovn\u00e1n\u00ed a nechte syst\u00e9m genomu vyv\u00edjet va\u0161e nejlep\u0161\u00ed prompty.",
        deployment: "Nasa\u010fte agenty do cloudu, propojte se s GitHub Actions, GitLab CI a n8n pracovn\u00edmi postupy.",
        troubleshooting: "Opravte b\u011b\u017en\u00e9 probl\u00e9my, pochopte chybov\u00e9 zpr\u00e1vy a vra\u0165te sv\u00e9 agenty zp\u011bt na spr\u00e1vnou cestu."
      }
    },
    featurePages: {
      orchestration: {
        headline: "Agenti, kte\u0159\u00ed spolupracuj\u00ed",
        description: "Vytv\u00e1\u0159ejte vizu\u00e1ln\u00ed pipeline, kde v\u00edce agent\u016f spolupracuje na slo\u017eit\u00fdch \u00fakolech. V\u00fdstup jednoho agenta se st\u00e1v\u00e1 vstupem dal\u0161\u00edho \u2014 \u017e\u00e1dn\u00fd lepic\u00ed k\u00f3d, \u017e\u00e1dn\u00e9 ru\u010dn\u00ed kroky, \u017e\u00e1dn\u00e9 limity toho, co lze orchestrovat.",
        cta: "Vytvo\u0159te svou prvn\u00ed pipeline"
      },
      security: {
        headline: "Va\u0161e tajemstv\u00ed z\u016fst\u00e1vaj\u00ed va\u0161e",
        description: "Ka\u017ed\u00e9 heslo, kl\u00ed\u010d API a p\u0159\u00edstupov\u00fd token je na va\u0161em za\u0159\u00edzen\u00ed \u0161ifrov\u00e1n pomoc\u00ed bankovn\u00edho \u0161ifrov\u00e1n\u00ed AES-256. Va\u0161e p\u0159ihla\u0161ovac\u00ed \u00fadaje jsou ulo\u017eeny ve vlastn\u00edm zabezpe\u010den\u00e9m trezoru va\u0161eho opera\u010dn\u00edho syst\u00e9mu \u2014 nic nen\u00ed nikdy odesl\u00e1no do cloudu.",
        cta: "Zabezpe\u010dte sv\u00e1 p\u0159ipojen\u00ed"
      },
      "multi-provider": {
        headline: "Nejste v\u00e1z\u00e1ni na jednu AI",
        description: "Pou\u017e\u00edvejte Claude, OpenAI, Gemini nebo spou\u0161t\u011bjte modely lok\u00e1ln\u011b pomoc\u00ed Ollama. P\u0159ep\u00ednejte mezi poskytovateli podle libosti, p\u0159i\u0159azujte r\u016fzn\u00e9 modely r\u016fzn\u00fdm agent\u016fm, a pokud jeden poskytovatel vypadne \u2014 va\u0161i agenti se automaticky p\u0159epnou na jin\u00e9ho.",
        cta: "Vyberte si svou AI"
      },
      genome: {
        headline: "Va\u0161i agenti automaticky chyt\u0159ej\u00ed",
        description: "M\u00edsto hodin ru\u010dn\u00edho lad\u011bn\u00ed prompt\u016f nechte tuto pr\u00e1ci na syst\u00e9mu Genome. Testuje varianty, ponech\u00e1v\u00e1 to, co funguje, a zbytek zahazuje \u2014 jako p\u0159irozen\u00fd v\u00fdb\u011br pro va\u0161e AI agenty.",
        cta: "Rozv\u00edjejte sv\u00e9 agenty"
      }
    },
    blogPage: {
      eyebrow: "Blog",
      heading: "Novinky a",
      headingGradient: "post?ehy",
      description: "Produktov? novinky, technick? rozbory, n?vody a re?ln? p??klady pou?it? od t?mu Personas.",
      searchPlaceholder: "Hledat p??sp?vky...",
      searchAriaLabel: "Hledat v blogu",
      clearSearch: "Vymazat hled?n?",
      showing: "Zobrazeno",
      of: "z",
      posts: "p??sp?vk?",
      noMatches: "??dn? p??sp?vky neodpov?daj? hled?n?",
      clearFilters: "Vymazat v?echny filtry",
      allPosts: "V?echny p??sp?vky",
      featured: "Doporu?en?",
      min: "min",
      minRead: "min ?ten?",
      read: "??st",
      readArticle: "??st ?l?nek",
      article: "?l?nek",
      backToBlog: "Zp?t na blog",
      published: "Publikov?no",
      continueExploring: "Pokra?ovat v objevov?n?",
      seeItInAction: "Pod?vat se v akci",
      browseTemplates: "Proch?zet ?ablony",
      postNotFound: "Blogov? p??sp?vek nenalezen",
      postNotFoundDescription: "?l?nek, kter? hled?te, se nepoda?ilo naj?t. Mo?n? byl p?ejmenov?n nebo p?esunut.",
      browseAllPosts: "Proch?zet v?echny p??sp?vky",
      backToHome: "Zp?t dom?"
    },
    accessibility: {
      changeLanguage: "Zm\u011bnit jazyk",
      selectLanguage: "Vybrat jazyk",
      selectTheme: "Vybrat motiv: {name}"
    },
    pageNav: {
      onThisPage: "Na t\u00e9to str\u00e1nce",
      closeMenu: "Zav\u0159\u00edt nab\u00eddku"
    },
    themes: {
      midnight: "P\u0139\u017blnoc",
      cyan: "Azurov\u00e1",
      bronze: "Bronz",
      frost: "Jinovatka",
      purple: "Fialov\u00e1",
      pink: "R\u016f\u017eov\u00e1",
      red: "\u010cerven\u00e1",
      matrix: "Matrix",
      light: "Sv\u011btl\u00fd",
      ice: "Led",
      news: "Zpr\u00e1vy"
    },
    themeDescriptions: {
      midnight: "Tmav\u011b n\u00e1mo\u0159nick\u00fd tmav\u00fd motiv",
      cyan: "Tmav\u00fd motiv s tyrkysov\u00fdm akcentem",
      bronze: "Tepl\u00fd jantarov\u00fd tmav\u00fd motiv",
      frost: "St\u0159\u00edbrn\u00fd chladn\u00fd tmav\u00fd motiv",
      purple: "Tmav\u00fd motiv s fialov\u00fdm akcentem",
      pink: "Tmav\u00fd motiv s purpurov\u00fdm akcentem",
      red: "Tmav\u00fd motiv s karm\u00ednov\u00fdm akcentem",
      matrix: "Tmav\u00fd motiv v neonov\u011b zelen\u00e9",
      light: "Klasick\u00fd sv\u011btl\u00fd motiv",
      ice: "Chladn\u00fd modr\u00fd sv\u011btl\u00fd motiv",
      news: "Vysoce kontrastn\u00ed sv\u011btl\u00fd motiv"
    },
    tour: {
      launch: "Spustit prohl\u00eddku",
      play: "P\u0159ehr\u00e1t",
      pause: "Pozastavit",
      next: "Dal\u0161\u00ed krok",
      previous: "P\u0159edchoz\u00ed krok",
      exit: "Ukon\u010dit prohl\u00eddku",
      volume: "Hlasitost",
      skipTo: "P\u0159ej\u00edt na",
      chapterHome: "Dom\u016f",
      begin: "Za\u010d\u00edt",
      skip: "P\u0159esko\u010dit",
      introTitle: "Seznamte se s Athenou, va\u0161\u00edm pr\u016fvodcem",
      introBody: "Athena v\u00e1s provede Personas za zhruba minutu \u2014 co je to persona, jak funguje a jak za\u010d\u00edt. Kter\u00fdkoli krok m\u016f\u017eete pozastavit, p\u0159esko\u010dit nebo p\u0159ehr\u00e1t znovu.",
      bridgePrompt: "To bylo Personas v kostce. Chcete j\u00edt hloub\u011bji a pod\u00edvat se, jak ka\u017ed\u00e1 sou\u010d\u00e1st skute\u010dn\u011b funguje, funkci po funkci?",
      bridgeConfirm: "Uk\u00e1zat funkce",
      bridgeDismiss: "Mo\u017en\u00e1 pozd\u011bji",
      bridgeToDashboardPrompt: "Nyn\u00ed si prohl\u00e9dn\u011bte Personas v akci \u2014 vyzkou\u0161ejte demo dashboard.",
      bridgeToDashboardConfirm: "Otev\u0159\u00edt dashboard",
      step1: "Seznamte se s personou \u2014 jedin\u00fdm AI agentem se stabiln\u00ed identitou a skl\u00e1datelnou sadou dovednost\u00ed. Dejte mu n\u00e1stroje, kter\u00e9 pot\u0159ebuje, od Gmailu a Slacku po GitHub a v\u00e1\u0161 kalend\u00e1\u0159, a nau\u010d\u00ed se jednat nap\u0159\u00ed\u010d v\u0161emi. Jedna persona, mnoho \u00fakol\u016f, v\u0161e spolupracuje.",
      step2: "Nyn\u00ed dejte t\u00e9to person\u011b c\u00edl v p\u0159irozen\u00e9m jazyce, nap\u0159\u00edklad \"rozt\u0159i\u010f mi Gmail\". Sledujte, jak p\u0159em\u00fd\u0161l\u00ed v re\u00e1ln\u00e9m \u010dase: p\u0159e\u010dte po\u017eadavek, rozlo\u017e\u00ed ho na kroky a napl\u00e1nuje sv\u016fj postup, ne\u017e se \u010dehokoli dotkne. Pot\u00e9 ho provede \u2014 a ukazuje v\u00e1m ka\u017ed\u00fd krok cestou.",
      step3: "Agent je u\u017eite\u010dn\u00fd jen tak, jako jsou okam\u017eiky, kdy se probud\u00ed. Personas lze spustit deseti zp\u016fsoby \u2014 podle pl\u00e1nu, na z\u00e1klad\u011b ud\u00e1losti, sledov\u00e1n\u00edm zdroje nebo p\u0159ijchoz\u00edm webhookem. Orchestr\u00e1tor sm\u011bruje ka\u017ed\u00fd sign\u00e1l ke spr\u00e1vn\u00e9mu agentovi a udr\u017euje v\u0161e v pohybu, p\u0159i\u010dem\u017e se s\u00e1m opravuje, pokud n\u011bkter\u00fd krok sel\u017ee.",
      step4: "To v\u0161e stoj\u00ed na jedn\u00e9 platform\u011b postaven\u00e9 na d\u016fv\u011b\u0159e a \u0161k\u00e1lovatelnosti. \u0160ifrovan\u00fd trezor st\u0159e\u017e\u00ed va\u0161e p\u0159ihla\u0161ovac\u00ed \u00fadaje, hotov\u00e9 \u0161ablony v\u00e1s rychle rozjedou a bring-your-own-model v\u00e1m ponech\u00e1v\u00e1 kontrolu nad AI. \u017div\u00e9 sledov\u00e1n\u00ed, experiment\u00e1ln\u00ed laborato\u0159 a t\u00fdmov\u00e1 orchestrace to cel\u00e9 dopl\u0148uj\u00ed \u2014 \u0161est pil\u00ed\u0159\u016f, jedno m\u00edsto.",
      step5: "P\u0159ipraveni nasadit personu do pr\u00e1ce? Personas b\u011b\u017e\u00ed na va\u0161em vlastn\u00edm po\u010d\u00edta\u010di p\u0159es Claude Code \u2014 n\u00e1stroj p\u0159\u00edkazov\u00e9 \u0159\u00e1dky od Anthropic \u2014 tak\u017ee z\u016fst\u00e1v\u00e1te v soukrom\u00ed a pod kontrolou. St\u00e1hn\u011bte instal\u00e1tor pro Windows 11, p\u0159ipojte CLI a v\u00e1\u0161 prvn\u00ed agent je \u017eiv\u00fd b\u011bhem p\u00e1r minut.",
      features1: "Ka\u017ed\u00fd agent se rod\u00ed z jedin\u00e9 v\u011bty z\u00e1m\u011bru. Personas p\u0159e\u010dte, co chcete, a vypln\u00ed osmirozm\u011brnou matici persony \u2014 \u00fakoly, pam\u011b\u0165, triggery, revize a dal\u0161\u00ed \u2014 a pt\u00e1 se v\u00e1s jen tehdy, kdy\u017e skute\u010dn\u011b pot\u0159ebuje rozhodnut\u00ed. B\u011bhem okam\u017eiku se z v\u00e1gn\u00ed my\u0161lenky stane strukturovan\u00fd, spustiteln\u00fd agent.",
      features2: "Pot\u00e9 se za\u010dne u\u010dit. Ka\u017ed\u00fd \u00fakol, kter\u00fd spust\u00ed, zanech\u00e1v\u00e1 stopu, a poznatky, na kter\u00fdch z\u00e1le\u017e\u00ed, stoupaj\u00ed do jeho vrstev pam\u011bti, zat\u00edmco \u0161um kles\u00e1 ke dnu. \u010c\u00edm v\u00edce v\u00e1\u0161 agent pracuje, t\u00edm je byst\u0159ej\u0161\u00ed a l\u00e9pe rozum\u00ed kontextu.",
      features3: "Skute\u010dn\u00e1 pr\u00e1ce se l\u00e1me, proto je Personas postaven tak, aby se dok\u00e1zal zotavit. Kdy\u017e krok sel\u017ee, obvod se nezastav\u00ed \u2014 diagnostikuje, co se pokazilo, oprav\u00ed cestu a s\u00e1m to zkus\u00ed znovu. \u017d\u00e1dn\u00e1 upozorn\u011bn\u00ed ve t\u0159i r\u00e1no, \u017e\u00e1dn\u00e9 ru\u010dn\u00ed restartov\u00e1n\u00ed; pracovn\u00ed postup jednodu\u0161e pokra\u010duje d\u00e1l.",
      features4: "A nikdy o nic z toho nep\u0159ijdete. Ka\u017ed\u00e9 spu\u0161t\u011bn\u00ed, zpr\u00e1va, ud\u00e1lost a pam\u011b\u0165 proud\u00ed \u017eiv\u011b p\u0159es jeden panel observability \u2014 sparklines, n\u00e1klady a stav, v\u0161e v re\u00e1ln\u00e9m \u010dase. Pln\u00e1 transparentnost, \u017e\u00e1dn\u00e9 nastavov\u00e1n\u00ed.",
      features5: "Skv\u011bl\u00ed agenti napoprv\u00e9 z\u0159\u00eddkakdy funguj\u00ed dokonale, proto je tu Laborato\u0159, kde je vylep\u0161\u00edte. Chatujte s personou a kou\u010dujte ji, postavte dv\u011b verze proti sob\u011b v ar\u00e9n\u011b, rozv\u00edjejte ji nap\u0159\u00ed\u010d generacemi nebo ji ohodno\u0165te podle dimenz\u00ed, na kter\u00fdch z\u00e1le\u017e\u00ed. Ka\u017ed\u00e9 vylep\u0161en\u00ed, kter\u00e9 si ponech\u00e1te, je verzovan\u00e9 a vratn\u00e9.",
      features6: "Personas p\u0159ich\u00e1z\u00ed se \u0161esti \u00fa\u010delov\u011b postaven\u00fdmi pluginy, z nich\u017e ka\u017ed\u00fd je samostatn\u00fd pracovn\u00ed prostor, kter\u00fd mohou va\u0161i agenti \u0159\u00eddit. Vezm\u011bte si Dev Tools: prom\u011bn\u00ed personu v program\u00e1torsk\u00e9ho par\u0165\u00e1ka, kter\u00fd spou\u0161t\u00ed \u00fakoly, \u010dte v\u00fdstup a iteruje. P\u0159epn\u011bte kartu a potk\u00e1te dal\u0161\u00edho specialistu \u2014 v\u0161ichni sd\u00edlej\u00ed stejn\u00e9 p\u0159ihla\u0161ovac\u00ed \u00fadaje a pam\u011b\u0165.",
      dashboardHome: "V\u00edtejte v \u0159\u00eddic\u00edm centru \u2014 cel\u00e1 va\u0161e flotila na jedn\u00e9 obrazovce. Naho\u0159e jsou \u017eivotn\u00ed funkce: m\u00edra \u00fasp\u011b\u0161nosti, b\u011b\u017e\u00edc\u00ed spu\u0161t\u011bn\u00ed, aktivn\u00ed agenti, otev\u0159en\u00e1 upozorn\u011bn\u00ed a revize \u010dekaj\u00edc\u00ed na v\u00e1s. Pod t\u00edm optimaliz\u00e1tor postupn\u011b ukazuje jednu vysoce p\u0159\u00ednosnou opravu \u2014 pr\u00e1v\u011b te\u010f je to zm\u011bna sm\u011brov\u00e1n\u00ed, kter\u00e1 sni\u017euje n\u00e1klady bez dopadu na kvalitu. Dva panely pod t\u00edm sleduj\u00ed stav ka\u017ed\u00e9ho agenta a nov\u00e9 pam\u011bti, kter\u00e9 se nau\u010dili a cht\u011bj\u00ed pov\u00fd\u0161it. Pot\u00e9 \u017eiv\u00fd obraz: ka\u017ed\u00e9 spu\u0161t\u011bn\u00ed, jak p\u0159ich\u00e1z\u00ed, vlevo, \u010dtrn\u00e1ct dn\u00ed provozu a chyb vpravo. Teplotn\u00ed mapa ukazuje spu\u0161t\u011bn\u00ed na agenta den po dni a spodn\u00ed \u0159\u00e1dek v\u0161e dopl\u0148uje \u2014 va\u0161e nejlep\u0161\u00ed v\u00fdkony, dal\u0161\u00ed napl\u00e1novan\u00e9 rutiny a ka\u017edou rotaci p\u0159ihla\u0161ovac\u00edch \u00fadaj\u016f. Jedna str\u00e1nka, cel\u00fd provoz.",
      dashboardAgents: "Toto je v\u00e1\u0161 seznam. Ka\u017ed\u00e1 karta je persona \u2014 jedin\u00fd agent s jednou identitou a sadou dovednost\u00ed, kter\u00e9 um\u00ed skl\u00e1dat. Portr\u00e9t je vygenerov\u00e1n tak, aby odpov\u00eddal jeho charakteru; pod n\u00edm \u017eiv\u00e9 statistiky: m\u00edra \u00fasp\u011b\u0161nosti, spu\u0161t\u011bn\u00ed a \u00fatrata. Klikn\u011bte na Spustit a spus\u0165te agenta na vy\u017e\u00e1d\u00e1n\u00ed, nebo otev\u0159ete Podrobnosti a prozkoumejte jeho konfiguraci a ned\u00e1vnou historii. P\u011bt agent\u016f zde, ka\u017ed\u00fd potichu d\u011bl\u00e1 dob\u0159e svou jednu pr\u00e1ci.",
      dashboardExecutions: "Ka\u017ed\u00fd b\u011bh, kter\u00fd flotila provedla, \u017eije zde, nejnov\u011bj\u0161\u00ed prvn\u00ed. Tabulka zobrazuje personu, stav, dobu trv\u00e1n\u00ed, n\u00e1klady a \u010das zah\u00e1jen\u00ed \u2014 filtrujte jen na selh\u00e1n\u00ed nebo ty, kter\u00e9 st\u00e1le b\u011b\u017e\u00ed. Klikn\u011bte na libovoln\u00fd \u0159\u00e1dek a otev\u0159e se cel\u00e9 spu\u0161t\u011bn\u00ed: pruh metrik, p\u0159\u00edpadn\u00e9 vysv\u011btlen\u00ed chyby a \u017eiv\u00fd v\u00fdstup streamovan\u00fd \u0159\u00e1dek po \u0159\u00e1dku, p\u0159esn\u011b tak, jak jej agent vytvo\u0159il.",
      dashboardEvents: "Agenti nepracuj\u00ed izolovan\u011b \u2014 reaguj\u00ed na ud\u00e1losti. Toto je sb\u011brnice ud\u00e1lost\u00ed: ka\u017ed\u00fd sign\u00e1l proch\u00e1zej\u00edc\u00ed syst\u00e9mem, od pl\u00e1n\u016f a webhook\u016f po zpr\u00e1vy mezi agenty. Ka\u017ed\u00fd \u0159\u00e1dek ukazuje typ ud\u00e1losti, jej\u00ed zdroj, stav a jak d\u00e1vno se spustila. Ne\u00fasp\u011b\u0161n\u00e9 ud\u00e1losti lze zkusit znovu na m\u00edst\u011b a souvisej\u00edc\u00ed ud\u00e1losti se \u0159et\u011bz\u00ed, tak\u017ee m\u016f\u017eete sledovat jedinou kask\u00e1du od za\u010d\u00e1tku do konce.",
      dashboardReviews: "N\u011bkter\u00e1 rozhodnut\u00ed pot\u0159ebuj\u00ed \u010dlov\u011bka. Kdy\u017e agent naraz\u00ed na n\u011bco, o \u010dem by nem\u011bl rozhodovat s\u00e1m, pozastav\u00ed se a p\u0159esm\u011bruje rozhodnut\u00ed sem. Ka\u017ed\u00e1 polo\u017eka nese personu, kontext a akci, kterou navrhuje \u2014 schvalte ji, zam\u00edtn\u011bte nebo p\u0159esko\u010dte na pozd\u011bji, kliknut\u00edm nebo kl\u00e1vesnic\u00ed. Nic riskantn\u00edho se neode\u0161le bez va\u0161eho schv\u00e1len\u00ed a fronta udr\u017euje zbytek flotily v chodu, zat\u00edmco se rozhodujete.",
      roadmap1: "Zde je n\u00e1\u0161 aktu\u00e1ln\u00ed stav: ka\u017ed\u00e1 f\u00e1ze na pl\u00e1nu je hodnocena podle stavu, jak se dod\u00e1v\u00e1.",
      roadmap2: "Co p\u0159ijde d\u00e1l, je na v\u00e1s \u2014 hlasujte pro funkce, kter\u00e9 chcete nejv\u00edce, a nejlep\u0161\u00ed n\u00e1pady utv\u00e1\u0159ej\u00ed to, co budujeme.",
      roadmap3: "A zde je v\u0161e, co u\u017e bylo dod\u00e1no \u2014 ka\u017ed\u00e9 vyd\u00e1n\u00ed se\u0159azen\u00e9 postupn\u011b, nejnov\u011bj\u0161\u00ed prvn\u00ed."
    },
    playgroundPage: {
      heroHeading: "Sledujte agenty v",
      heroHeadingGradient: "akci",
      heroDescription: "Vyberte si n\u00ed\u017ee \u00fakol a sledujte, jak ho agent Personas rozlo\u017e\u00ed, vybere spr\u00e1vn\u00e9 n\u00e1stroje a doru\u010d\u00ed v\u00fdsledky \u2014 v\u0161e b\u011bhem p\u00e1r sekund.",
      ctaTitle: "P\u0159ipraveni vytvo\u0159it si vlastn\u00ed agenty?",
      ctaDescription: "St\u00e1hn\u011bte si Personas a vytvo\u0159te autonomn\u00ed agenty, kte\u0159\u00ed se p\u0159ipoj\u00ed k va\u0161im n\u00e1stroj\u016fm, \u0159\u00edd\u00ed se va\u0161imi pravidly a b\u011b\u017e\u00ed podle va\u0161eho pl\u00e1nu.",
      ctaDownload: "St\u00e1hnout Personas",
      ctaBrowseTemplates: "Proch\u00e1zet \u0161ablony",
      selectTask: "Vyberte \u00fakol v\u00fd\u0161e a spus\u0165te simulaci",
      simulatedExecution: "Simulovan\u00e9 spu\u0161t\u011bn\u00ed",
      statusExecuting: "spou\u0161t\u00ed se\u2026",
      statusComplete: "dokon\u010deno",
      statusReady: "p\u0159ipraven",
      chromeTitle: "agent-playground \u2014 spu\u0161t\u011bno",
      reset: "Resetovat"
    }
  };
