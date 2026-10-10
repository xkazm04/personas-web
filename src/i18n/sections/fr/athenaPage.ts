import type { Translations } from "../../en";

export const fr: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "VOICI ATHENA",
        onboarding: "PREMIERS PAS",
        fleet: "D'UNE PHRASE",
        workshop: "CE QU'ELLE G\u00c8RE",
        portfolio: "PROJETS",
        memory: "M\u00c9MOIRE",
        oneMind: "UN SEUL ESPRIT"
      },
      hero: {
        eyebrow: "Ton bras droit",
        headline: "Voici",
        headlineGradient: "Athena",
        tagline: "Elle ne dit rien quand il n'y a rien \u00e0 dire.",
        persona: "Une strat\u00e8ge, pas une assistante enjou\u00e9e \u2014 directe, avec un avis, chaleureuse sans en faire trop. \u00ab\u00a0La vitesse n'est pas ton m\u00e9tier. La qualit\u00e9, si.\u00a0\u00bb",
        ctaPrimary: "La voir travailler",
        ctaSecondary: "T\u00e9l\u00e9charger Personas",
        statWhisper: "Tourne enti\u00e8rement sur ta machine \u00b7 tu d\u00e9cides jusqu'o\u00f9 elle va",
        avatarAlt: "Athena, la compagne de Personas",
        orbAria: "Athena \u2014 appuie sur Entr\u00e9e, elle r\u00e9pond",
        acknowledgeLine: "Je t'\u00e9coute.",
        calloutsAria: "Ce qu'Athena fait pour toi",
        callouts: [
          { label: "Parle-lui", fact: "Maintiens et parle \u2014 sans clavier" },
          { label: "D'un coup d'\u0153il", fact: "Vois sur quoi elle travaille" },
          { label: "Ton bureau", fact: "Pose-la l\u00e0 o\u00f9 tu travailles" },
          { label: "Toujours pr\u00eate", fact: "Cmd/Ctrl+Shift+A, depuis n'importe o\u00f9" }
        ]
      },
      onboarding: {
        intro: { eyebrow: "On l'installe ensemble", heading: "Premiers pas", gradient: "\u00e0 deux" },
        chrome: {
          appName: "Personas",
          search: "Rechercher\u2026",
          nav: ["Accueil", "Agents", "Mod\u00e8les", "Connecteurs", "Coffre", "R\u00e9glages"],
          usageLabel: "ex\u00e9cutions du jour",
          usageValue: "18 / 25",
          newAgent: "Nouvel agent"
        },
        canvas: {
          crumbs: ["Espace", "Automatisation"],
          filters: ["Tout", "Populaires", "Planifi\u00e9s", "Nouveaux"],
          templatesLabel: "Mod\u00e8les",
          templatesHint: "12 mod\u00e8les",
          template: {
            title: "R\u00e9sum\u00e9 du jour",
            meta: "r\u00e9sumer \u00b7 publier \u00b7 9:00",
            pill: "populaire",
            schedule: "Chaque jour 9:00",
            runs: "142 ex\u00e9cutions",
            health: "98 % ok"
          },
          templateAlt: {
            title: "Tri de la bo\u00eete mail",
            meta: "\u00e9tiqueter \u00b7 r\u00e9diger \u00b7 archiver",
            pill: "nouveau",
            schedule: "\u00c0 chaque nouveau mail",
            runs: "86 ex\u00e9cutions",
            health: "94 % ok"
          },
          runsTitle: "Derni\u00e8res ex\u00e9cutions",
          runsHint: "derni\u00e8res 24 h",
          runsCols: ["agent", "\u00e9tat", "dur\u00e9e"],
          runsRows: [
            { name: "R\u00e9sum\u00e9 du jour", state: "ok", took: "1,2 s" },
            { name: "Revue de PR", state: "ok", took: "0,8 s" },
            { name: "Sync des notes", state: "en cours", took: "\u2014" }
          ],
          connectLabel: "Connecter un outil",
          connectCount: "2 sur 9 connect\u00e9s",
          connectCountDone: "3 sur 9 connect\u00e9s",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 actus",
            connect: "connecter",
            connecting: "connexion\u2026",
            connected: "connect\u00e9"
          },
          chips: [
            { name: "GitHub", detail: "sync il y a 2 min", state: "connect\u00e9" },
            { name: "Notion", detail: "12 pages", state: "connect\u00e9" }
          ],
          triggerLabel: "D\u00e9clencheur",
          triggerIdle: "Pas encore planifi\u00e9",
          triggerIdleShort: "Non d\u00e9fini",
          triggerValue: "Chaque matin \u00b7 9:00",
          triggerValueShort: "Chaque jour \u00b7 9:00",
          triggerHint: "modifier",
          triggerDays: ["D", "L", "M", "M", "J", "V", "S"],
          triggerZone: "UTC+1",
          triggerOff: "non",
          triggerOn: "oui",
          activityLabel: "Surveillance",
          activityPill: "en direct",
          stats: [
            { value: "24", label: "ex\u00e9cutions" },
            { value: "98 %", label: "r\u00e9ussite" },
            { value: "1,4 s", label: "moyenne" }
          ],
          action: "Cr\u00e9er l'agent",
          actionDone: "Agent cr\u00e9\u00e9"
        },
        captions: {
          template: "choisis un point de d\u00e9part",
          connect: "connecte ton Slack",
          trigger: "choisis quand \u00e7a tourne",
          action: "un clic \u2014 c'est en route"
        },
        status: {
          setup: "espace \u00b7 on installe ensemble",
          setupShort: "installation",
          step: "\u00e9tape {n}/{total} \u00b7 construite avec toi",
          stepShort: "\u00e9tape {n}/{total}",
          live: "agent en route \u00b7 surveillance active",
          liveShort: "en route"
        }
      },
      fleet: {
        intro: { eyebrow: "Dis-le avec tes mots", heading: "Une flotte", gradient: "orchestr\u00e9e" },
        request: {
          placeholder: "Demande n'importe quoi \u00e0 Athena\u2026",
          voice: "ou dis-le simplement",
          sent: "envoy\u00e9",
          clauses: [
            ["Sors ", "les tickets de la semaine derni\u00e8re", ","],
            [" trouve ", "les plaintes qui reviennent", ","],
            [" regarde ", "ce qu'on a d\u00e9j\u00e0 corrig\u00e9", ","],
            [" compte ", "combien de personnes sont touch\u00e9es", ","],
            [" et ", "dis \u00e0 l'\u00e9quipe ce qui compte", "."]
          ]
        },
        plan: {
          hint: "Change ce que tu veux avant que \u00e7a parte",
          hintShort: "Change avant de lancer",
          edited: "Modifi\u00e9",
          start: "Lancer",
          working: "En cours",
          done: "Termin\u00e9"
        },
        task: { working: "en cours", finished: "termin\u00e9" },
        tasks: [
          {
            title: "Rassembler les tickets",
            scope: "7 derniers jours",
            scopeEdited: "14 derniers jours",
            found: "1 284 tickets"
          },
          { title: "Grouper les plaintes qui reviennent", scope: "tous les canaux", found: "9 groupes" },
          {
            title: "Voir ce qu'on a d\u00e9j\u00e0 livr\u00e9",
            scope: "depuis mai",
            found: "4 d\u00e9j\u00e0 corrig\u00e9s"
          },
          { title: "Compter les personnes touch\u00e9es", scope: "par compte", found: "612 comptes" }
        ],
        result: {
          title: "Ce qui compte cette semaine",
          rows: [
            { label: "Erreurs au paiement", meta: "214 personnes" },
            { label: "Recherche lente", meta: "96 personnes" },
            { label: "Boucle de connexion", meta: "corrig\u00e9 mardi" }
          ],
          footer: "envoy\u00e9 \u00e0 l'\u00e9quipe"
        },
        status: {
          speak: "dis-le ou tape-le \u2014 pareil",
          speakShort: "tape-le ou dis-le",
          planning: "Athena voit ce que \u00e7a demande",
          pieces: "une phrase, quatre chantiers",
          piecesShort: "quatre chantiers",
          yourCall: "rien ne part sans ton feu vert",
          yourCallShort: "\u00e0 toi de lancer",
          parallel: "les quatre en m\u00eame temps",
          parallelShort: "les quatre d'un coup",
          returning: "tout revient en une r\u00e9ponse",
          returningShort: "revient en une r\u00e9ponse",
          closing: "une phrase entr\u00e9e \u00b7 une r\u00e9ponse rendue",
          closingShort: "une seule r\u00e9ponse"
        }
      },
      workshop: {
        intro: { eyebrow: "Quoi que tu lui confies", heading: "Les limites que tu traces", gradient: "tiennent" },
        beds: [
          { name: "App de paiement", short: "Paiement" },
          { name: "Site marketing", short: "Site" },
          { name: "Service facturation", short: "Facturation" }
        ],
        jobTitles: [
          "lancer les tests",
          "v\u00e9rifier les liens",
          "nettoyer les avertissements",
          "r\u00e9parer le test instable",
          "mettre \u00e0 jour le changelog",
          "ranger les vieilles branches"
        ],
        fence: { plate: "les endroits que tu as ouverts", plateShort: "endroits que tu as ouverts" },
        dial: {
          label: "ce qu'elle fait toute seule",
          labelShort: "ce qu'elle fait seule",
          stops: ["demande-moi d'abord", "les petites choses", "vas-y"],
          stopsShort: ["demande-moi", "petites choses", "vas-y"]
        },
        job: { working: "en cours", done: "termin\u00e9" },
        outside: { name: "Ancien client", waits: "t'attend" },
        status: {
          line: "la limite d'abord",
          lineShort: "la limite d'abord",
          draw: "tu la traces une fois",
          drawShort: "tu la traces une fois",
          places: "voil\u00e0 les endroits ouverts",
          placesShort: "les endroits ouverts",
          inside: "elle travaille dedans \u2014 partout dedans",
          insideShort: "elle travaille dedans",
          turnUp: "monte \u2014 plus d'un coup, moins de questions",
          turnUpShort: "monte \u2014 plus d'un coup",
          unmoved: "la limite ne bouge pas avec",
          unmovedShort: "la limite ne bouge pas",
          stops: "elle s'arr\u00eate o\u00f9 tu l'as arr\u00eat\u00e9e",
          stopsShort: "elle s'arr\u00eate \u00e0 la limite",
          waits: "et elle attend \u2014 c'est \u00e0 toi",
          waitsShort: "celui-l\u00e0 est \u00e0 toi",
          free: "aussi libre que tu veux, dans tes limites",
          freeShort: "libre, dans tes limites"
        }
      },
      portfolio: {
        intro: { eyebrow: "Pendant que tu es ailleurs", heading: "Rien ne pourrit", gradient: "en silence" },
        projects: [
          "Site marketing",
          "Docs",
          "App mobile",
          "Design system",
          "Bo\u00eete support",
          "Pipeline de donn\u00e9es",
          "Outils admin",
          "API paiements",
          "Service de recherche",
          "Parcours d'accueil",
          "Notifications",
          "Wiki interne"
        ],
        field: { handled: "r\u00e9gl\u00e9" },
        panel: {
          badge: "le pire d'abord",
          rows: [
            { name: "D\u00e9pendances", since: "silence depuis 11 jours" },
            { name: "Build nocturne", since: "rouge depuis vendredi" }
          ],
          rest: "5 autres v\u00e9rifs sont bonnes",
          finding: "La lib de paiement a 3 versions de retard, dont une avec une faille connue.",
          findingShort: "3 versions de retard, une faille.",
          action: "Ouvrir ce qui corrige",
          actionShort: "Ouvrir le correctif",
          done: "Ouvert"
        },
        caption: {
          survey: "Elle passe chaque projet",
          surfaced: "Trois ont besoin de toi",
          worst: "Celui-ci d'abord",
          found: "Silence depuis 11 jours",
          opened: "Ouvert pour toi"
        },
        status: {
          view: "tous tes projets sous les yeux",
          viewShort: "tous, sous les yeux",
          checking: "tous v\u00e9rifi\u00e9s d'un coup",
          checkingShort: "tous v\u00e9rifi\u00e9s",
          needing: "3 pour toi \u00b7 le pire d'abord",
          needingShort: "3 ont besoin de toi",
          travel: "droit vers le pire",
          travelShort: "le pire d'abord",
          quiet: "payments api \u00b7 silence depuis 11 jours",
          quietShort: "silence depuis 11 jours",
          opened: "elle a ouvert ce qui corrige",
          openedShort: "ouvert pour toi",
          back: "retour \u00e0 la vue d'ensemble",
          backShort: "vue d'ensemble",
          settled: "1 r\u00e9gl\u00e9 \u00b7 2 attendent encore",
          settledShort: "1 r\u00e9gl\u00e9 \u00b7 2 attendent"
        }
      },
      memory: {
        intro: { eyebrow: "Plus vous travaillez ensemble", heading: "plus elle", gradient: "en porte" },
        talk: "les \u00e9changes du jour",
        rail: "assez pour une nuit",
        night: "elle dort dessus",
        shelf: "ce qu'elle garde",
        kept: [
          "Tu livres le jeudi.",
          "C'est sur staging que tu essaies.",
          "La facturation, c'est ce qui t'inqui\u00e8te.",
          "Tu veux la version courte d'abord."
        ],
        status: {
          day: "une journ\u00e9e ordinaire ensemble",
          dayShort: "une journ\u00e9e ordinaire",
          building: "tout ce que vous traversez s'accumule",
          buildingShort: "les \u00e9changes s'accumulent",
          sleeps: "assez s'est accumul\u00e9 \u2014 elle dort dessus",
          sleepsShort: "elle dort dessus",
          wakes: "elle se r\u00e9veille avec un peu plus",
          wakesShort: "un peu plus qu'avant",
          keeping: "encore une nuit, encore une chose gard\u00e9e",
          keepingShort: "encore une chose gard\u00e9e",
          quiet: "une journ\u00e9e calme \u2014 presque rien dit",
          quietShort: "une journ\u00e9e calme",
          notEnough: "pas assez pour dormir dessus, alors non",
          notEnoughShort: "pas assez pour dormir dessus",
          nothingLost: "rien n'est perdu \u2014 la journ\u00e9e est l\u00e0",
          nothingLostShort: "toujours l\u00e0, rien de perdu",
          inUse: "et la premi\u00e8re chose gard\u00e9e sert aujourd'hui",
          inUseShort: "celle du premier jour, aujourd'hui",
          sleepsAgain: "elle dort aussi sur celle-l\u00e0",
          sleepsAgainShort: "elle dort aussi sur celle-l\u00e0",
          cost: "\u00e7a lui co\u00fbte moins qu'une r\u00e9ponse",
          costShort: "moins qu'une r\u00e9ponse",
          oneMore: "une nuit de plus, une chose de plus",
          oneMoreShort: "une chose de plus \u00e0 porter",
          carries: "plus vous travaillez ensemble, plus elle en porte",
          carriesShort: "plus elle en porte"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "Peu importe combien de conversations",
          heading: "toujours la",
          gradient: "m\u00eame personne"
        },
        conversations: [
          { name: "La r\u00e9\u00e9criture", short: "R\u00e9\u00e9criture" },
          { name: "Revue du lundi", short: "Lundi" },
          { name: "La mise en route", short: "D\u00e9marrage" },
          { name: "La panne", short: "Panne" },
          { name: "La page tarifs", short: "Tarifs" },
          { name: "Factures", short: "Factures" }
        ],
        open: {
          label: "cette conversation",
          question: "On travaille sur quoi d'autre\u00a0?",
          from: "source\u00a0:",
          footer: "Rien d'autre n'a besoin de toi aujourd'hui.",
          footerShort: "Rien d'autre n'a besoin de toi."
        },
        rows: [
          {
            claim: "La derni\u00e8re v\u00e9rification est pass\u00e9e il y a une heure",
            short: "Derni\u00e8re v\u00e9rif pass\u00e9e"
          },
          { claim: "Deux projets t'attendent, aucun n'est urgent", short: "2 en attente, rien d'urgent" },
          {
            claim: "Ton calendrier n'est toujours pas connect\u00e9",
            short: "Calendrier non connect\u00e9"
          }
        ],
        status: {
          live: "toutes tes conversations en cours",
          liveShort: "toutes tes conversations",
          open: "toutes ouvertes en m\u00eame temps",
          openShort: "toutes ouvertes",
          asked: "tu as demand\u00e9 dans l'une",
          askedShort: "tu demandes ici",
          answers: "elle r\u00e9pond avec tout ce qu'elle sait",
          answersShort: "elle r\u00e9pond avec tout",
          sources: "chaque ligne, et d'o\u00f9 elle vient",
          sourcesShort: "chaque ligne et sa source",
          oneVoice: "une voix \u2014 jamais deux \u00e0 la fois",
          oneVoiceShort: "une voix, jamais deux",
          samePerson: "la m\u00eame personne, partout",
          samePersonShort: "la m\u00eame personne, partout"
        }
      }
    },
};
