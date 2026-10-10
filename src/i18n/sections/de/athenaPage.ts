import type { Translations } from "../../en";

export const de: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "ATHENA TREFFEN",
        onboarding: "EINRICHTUNG",
        fleet: "AUS EINEM SATZ",
        workshop: "WAS SIE BETREUT",
        portfolio: "PROJEKTE",
        memory: "GED\u00c4CHTNIS",
        oneMind: "IMMER DIESELBE"
      },
      hero: {
        eyebrow: "Deine rechte Hand",
        headline: "Das ist",
        headlineGradient: "Athena",
        tagline: "Sie sagt nichts, wenn nichts zu sagen ist.",
        persona: "Eine Strategin, keine gut gelaunte Assistentin \u2014 direkt, mit eigener Meinung, warm ohne Show. \u201eTempo ist nicht deine Aufgabe. Qualit\u00e4t schon.\u201c",
        ctaPrimary: "Sieh sie arbeiten",
        ctaSecondary: "Personas herunterladen",
        statWhisper: "L\u00e4uft komplett auf deinem Rechner \u00b7 wie weit sie geht, entscheidest du",
        avatarAlt: "Athena, die Begleiterin in Personas",
        orbAria: "Athena \u2014 dr\u00fcck Enter, und sie meldet sich",
        acknowledgeLine: "Ich h\u00f6re zu.",
        calloutsAria: "Was Athena f\u00fcr dich tut",
        callouts: [
          { label: "Sprich mit ihr", fact: "Gedr\u00fcckt halten und sprechen" },
          { label: "Auf einen Blick", fact: "Sieh, woran sie arbeitet" },
          { label: "Dein Desktop", fact: "Zieh sie dorthin, wo du arbeitest" },
          { label: "Immer bereit", fact: "Cmd/Ctrl+Shift+A, aus jeder App" }
        ]
      },
      onboarding: {
        intro: { eyebrow: "Wir richten es zusammen ein", heading: "Einrichtung", gradient: "zu zweit" },
        chrome: {
          appName: "Personas",
          search: "Suchen\u2026",
          nav: ["Start", "Agenten", "Vorlagen", "Konnektoren", "Tresor", "Einstellungen"],
          usageLabel: "L\u00e4ufe heute",
          usageValue: "18 / 25",
          newAgent: "Neuer Agent"
        },
        canvas: {
          crumbs: ["Workspace", "Automatisierung"],
          filters: ["Alle", "Beliebt", "Geplant", "Neu"],
          templatesLabel: "Vorlagen",
          templatesHint: "12 Vorlagen",
          template: {
            title: "Tages\u00fcberblick",
            meta: "zusammenfassen \u00b7 posten \u00b7 9:00",
            pill: "beliebt",
            schedule: "T\u00e4glich 9:00",
            runs: "142 L\u00e4ufe",
            health: "98 % ok"
          },
          templateAlt: {
            title: "Posteingang sortieren",
            meta: "labeln \u00b7 entwerfen \u00b7 archivieren",
            pill: "neu",
            schedule: "Bei neuer Mail",
            runs: "86 L\u00e4ufe",
            health: "94 % ok"
          },
          runsTitle: "Letzte L\u00e4ufe",
          runsHint: "letzte 24 h",
          runsCols: ["Agent", "Status", "Dauer"],
          runsRows: [
            { name: "Tages\u00fcberblick", state: "ok", took: "1,2 s" },
            { name: "PR-Review", state: "ok", took: "0,8 s" },
            { name: "Notizen-Sync", state: "l\u00e4uft", took: "\u2014" }
          ],
          connectLabel: "Tool verbinden",
          connectCount: "2 von 9 verbunden",
          connectCountDone: "3 von 9 verbunden",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 Updates",
            connect: "verbinden",
            connecting: "verbinde\u2026",
            connected: "verbunden"
          },
          chips: [
            { name: "GitHub", detail: "Sync vor 2 Min", state: "verbunden" },
            { name: "Notion", detail: "12 Seiten", state: "verbunden" }
          ],
          triggerLabel: "Ausl\u00f6ser",
          triggerIdle: "Noch kein Zeitplan",
          triggerIdleShort: "Nicht gesetzt",
          triggerValue: "Jeden Morgen \u00b7 9:00",
          triggerValueShort: "T\u00e4glich \u00b7 9:00",
          triggerHint: "\u00e4ndern",
          triggerDays: ["S", "M", "D", "M", "D", "F", "S"],
          triggerZone: "UTC+1",
          triggerOff: "aus",
          triggerOn: "an",
          activityLabel: "\u00dcberwachung",
          activityPill: "live",
          stats: [
            { value: "24", label: "L\u00e4ufe" },
            { value: "98 %", label: "Erfolg" },
            { value: "1,4 s", label: "\u00d8" }
          ],
          action: "Agent erstellen",
          actionDone: "Agent erstellt"
        },
        captions: {
          template: "w\u00e4hl einen Startpunkt",
          connect: "verbinde dein Slack",
          trigger: "leg fest, wann er l\u00e4uft",
          action: "ein Klick \u2014 er l\u00e4uft"
        },
        status: {
          setup: "Workspace \u00b7 gemeinsam eingerichtet",
          setupShort: "wird eingerichtet",
          step: "Schritt {n}/{total} \u00b7 mit dir gebaut",
          stepShort: "Schritt {n}/{total}",
          live: "Agent l\u00e4uft \u00b7 \u00dcberwachung an",
          liveShort: "l\u00e4uft"
        }
      },
      fleet: {
        intro: { eyebrow: "Sag es in deinen Worten", heading: "Die Flotte", gradient: "im Zusammenspiel" },
        request: {
          placeholder: "Frag Athena, was du willst\u2026",
          voice: "oder sag es einfach",
          sent: "gesendet",
          clauses: [
            ["Hol ", "die Tickets der letzten Woche", ","],
            [" finde ", "die Beschwerden, die sich wiederholen", ","],
            [" pr\u00fcf, ", "was wir schon behoben haben", ","],
            [" z\u00e4hl, ", "wie viele es getroffen hat", ","],
            [" und ", "sag dem Team, worauf es ankommt", "."]
          ]
        },
        plan: {
          hint: "\u00c4nder alles, bevor es losgeht",
          hintShort: "Vorher alles \u00e4nderbar",
          edited: "Ge\u00e4ndert",
          start: "Start",
          working: "Arbeitet",
          done: "Fertig"
        },
        task: { working: "arbeitet", finished: "fertig" },
        tasks: [
          {
            title: "Die Tickets holen",
            scope: "letzte 7 Tage",
            scopeEdited: "letzte 14 Tage",
            found: "1.284 Tickets"
          },
          { title: "Wiederkehrende Beschwerden gruppieren", scope: "alle Kan\u00e4le", found: "9 Cluster" },
          { title: "Pr\u00fcfen, was schon drau\u00dfen ist", scope: "seit Mai", found: "4 schon behoben" },
          { title: "Betroffene z\u00e4hlen", scope: "nach Konto", found: "612 Konten" }
        ],
        result: {
          title: "Worauf es diese Woche ankommt",
          rows: [
            { label: "Fehler im Checkout", meta: "214 Personen" },
            { label: "Langsame Suche", meta: "96 Personen" },
            { label: "Login-Schleife", meta: "Dienstag behoben" }
          ],
          footer: "ans Team geschickt"
        },
        status: {
          speak: "sprich es oder tipp es \u2014 egal",
          speakShort: "tippen oder sprechen",
          planning: "Athena \u00fcberlegt, was dazugeh\u00f6rt",
          pieces: "ein Satz, vier Arbeitspakete",
          piecesShort: "vier Arbeitspakete",
          yourCall: "nichts l\u00e4uft, bis du es sagst",
          yourCallShort: "du gibst das Startsignal",
          parallel: "alle vier zur gleichen Zeit",
          parallelShort: "alle vier gleichzeitig",
          returning: "kommt als eine Antwort zur\u00fcck",
          returningShort: "als eine Antwort zur\u00fcck",
          closing: "ein Satz rein \u00b7 eine Antwort zur\u00fcck",
          closingShort: "eine Antwort zur\u00fcck"
        }
      },
      workshop: {
        intro: { eyebrow: "Wie viel du ihr auch gibst", heading: "Deine Grenzen", gradient: "halten" },
        beds: [
          { name: "Checkout-App", short: "Checkout" },
          { name: "Marketing-Website", short: "Website" },
          { name: "Abrechnungsdienst", short: "Abrechnung" }
        ],
        jobTitles: [
          "die Tests laufen lassen",
          "die Links pr\u00fcfen",
          "die Warnungen aufr\u00e4umen",
          "den wackligen Test fixen",
          "das Changelog auffrischen",
          "die alten Branches aufr\u00e4umen"
        ],
        fence: { plate: "die Orte, die du ge\u00f6ffnet hast", plateShort: "Orte, die du ge\u00f6ffnet hast" },
        dial: {
          label: "wie viel sie allein macht",
          labelShort: "wie viel allein",
          stops: ["frag mich vorher", "die kleinen Dinge", "leg los"],
          stopsShort: ["frag mich", "Kleinigkeiten", "leg los"]
        },
        job: { working: "arbeitet", done: "fertig" },
        outside: { name: "Alter Kundenjob", waits: "wartet auf dich" },
        status: {
          line: "zuerst kommt die Grenze",
          lineShort: "zuerst kommt die Grenze",
          draw: "du ziehst sie einmal",
          drawShort: "du ziehst sie einmal",
          places: "das sind deine ge\u00f6ffneten Orte",
          placesShort: "deine ge\u00f6ffneten Orte",
          inside: "darin arbeitet sie \u2014 \u00fcberall",
          insideShort: "sie arbeitet darin",
          turnUp: "dreh auf \u2014 mehr auf einmal, weniger Fragen",
          turnUpShort: "dreh auf \u2014 mehr auf einmal",
          unmoved: "die Grenze wandert nicht mit",
          unmovedShort: "die Grenze bleibt",
          stops: "sie h\u00e4lt genau an deiner Grenze",
          stopsShort: "sie h\u00e4lt an der Grenze",
          waits: "und wartet \u2014 das geh\u00f6rt dir",
          waitsShort: "das geh\u00f6rt dir",
          free: "so frei du willst, in deinen Grenzen",
          freeShort: "frei, in deinen Grenzen"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "W\u00e4hrend du woanders steckst",
          heading: "Nichts verf\u00e4llt",
          gradient: "im Stillen"
        },
        projects: [
          "Marketing-Website",
          "Doku",
          "Mobile App",
          "Design-System",
          "Support-Postfach",
          "Datenpipeline",
          "Admin-Tools",
          "Payments-API",
          "Suchdienst",
          "Onboarding",
          "Benachrichtigungen",
          "Internes Wiki"
        ],
        field: { handled: "erledigt" },
        panel: {
          badge: "Schlimmstes zuerst",
          rows: [
            { name: "Abh\u00e4ngigkeiten", since: "still seit 11 Tagen" },
            { name: "Nightly Build", since: "rot seit Freitag" }
          ],
          rest: "5 weitere Checks in Ordnung",
          finding: "Die Payment-Bibliothek ist 3 Versionen zur\u00fcck, eine mit bekannter L\u00fccke.",
          findingShort: "3 Versionen zur\u00fcck, eine mit L\u00fccke.",
          action: "\u00d6ffnen, was es behebt",
          actionShort: "Fix \u00f6ffnen",
          done: "Ge\u00f6ffnet"
        },
        caption: {
          survey: "Pr\u00fcft jedes Projekt",
          surfaced: "Drei brauchen dich",
          worst: "Dieses zuerst",
          found: "Seit 11 Tagen still",
          opened: "F\u00fcr dich ge\u00f6ffnet"
        },
        status: {
          view: "jedes Projekt von dir im Blick",
          viewShort: "alle im Blick",
          checking: "pr\u00fcft alle auf einmal",
          checkingShort: "pr\u00fcft alle",
          needing: "3 brauchen dich \u00b7 Schlimmstes zuerst",
          needingShort: "3 brauchen dich",
          travel: "direkt zum schlimmsten Fall",
          travelShort: "schlimmstes zuerst",
          quiet: "payments api \u00b7 11 Tage still",
          quietShort: "11 Tage still",
          opened: "hat ge\u00f6ffnet, was es behebt",
          openedShort: "f\u00fcr dich ge\u00f6ffnet",
          back: "zur\u00fcck aufs ganze Bild",
          backShort: "zur\u00fcck",
          settled: "1 erledigt \u00b7 2 warten noch",
          settledShort: "1 erledigt \u00b7 2 warten"
        }
      },
      memory: {
        intro: {
          eyebrow: "Je l\u00e4nger ihr zusammenarbeitet",
          heading: "desto mehr",
          gradient: "tr\u00e4gt sie mit"
        },
        talk: "das Gespr\u00e4ch des Tages",
        rail: "genug zum Dr\u00fcberschlafen",
        night: "sie schl\u00e4ft dar\u00fcber",
        shelf: "was sie beh\u00e4lt",
        kept: [
          "Du lieferst donnerstags aus.",
          "Auf Staging probierst du Sachen aus.",
          "Die Abrechnung macht dir Sorgen.",
          "Du willst zuerst die Kurzfassung."
        ],
        status: {
          day: "ein ganz normaler Arbeitstag zusammen",
          dayShort: "ein ganz normaler Tag",
          building: "alles, was ihr durchgeht, sammelt sich",
          buildingShort: "das Tagesgespr\u00e4ch sammelt sich",
          sleeps: "genug ist zusammen \u2014 sie schl\u00e4ft dar\u00fcber",
          sleepsShort: "sie schl\u00e4ft dar\u00fcber",
          wakes: "sie wacht mit etwas mehr auf",
          wakesShort: "etwas mehr als vorher",
          keeping: "noch eine Nacht, noch etwas Behaltenes",
          keepingShort: "noch etwas zum Behalten",
          quiet: "ein stiller Tag \u2014 kaum etwas gesagt",
          quietShort: "ein stiller Tag",
          notEnough: "zu wenig zum Dr\u00fcberschlafen, also l\u00e4sst sie es",
          notEnoughShort: "zu wenig zum Dr\u00fcberschlafen",
          nothingLost: "nichts geht verloren \u2014 der Tag bleibt",
          nothingLostShort: "bleibt da, nichts verloren",
          inUse: "und das Erste, was sie behielt, hilft heute",
          inUseShort: "vom ersten Tag, heute genutzt",
          sleepsAgain: "auch dar\u00fcber schl\u00e4ft sie",
          sleepsAgainShort: "auch dar\u00fcber schl\u00e4ft sie",
          cost: "das kostet sie weniger als eine Antwort",
          costShort: "weniger als eine Antwort",
          oneMore: "eine Nacht mehr, eine Sache mehr",
          oneMoreShort: "eine Sache mehr im Gep\u00e4ck",
          carries: "je l\u00e4nger ihr zusammenarbeitet, desto mehr tr\u00e4gt sie mit",
          carriesShort: "desto mehr tr\u00e4gt sie mit"
        }
      },
      oneMind: {
        intro: { eyebrow: "Wie viele Gespr\u00e4che auch laufen", heading: "immer", gradient: "dieselbe Person" },
        conversations: [
          { name: "Der Umbau", short: "Umbau" },
          { name: "Montagsrunde", short: "Montag" },
          { name: "Die Einrichtung", short: "Setup" },
          { name: "Der Ausfall", short: "Ausfall" },
          { name: "Die Preisseite", short: "Preise" },
          { name: "Rechnungen", short: "Rechnungen" }
        ],
        open: {
          label: "dieses Gespr\u00e4ch",
          question: "Woran arbeiten wir sonst noch?",
          from: "Quelle:",
          footer: "Sonst braucht dich heute nichts.",
          footerShort: "Sonst braucht dich nichts."
        },
        rows: [
          { claim: "Der letzte Check lief vor etwa einer Stunde durch", short: "Letzter Check bestanden" },
          {
            claim: "Zwei Projekte warten auf dich, beide nicht dringend",
            short: "2 warten, nichts dringend"
          },
          { claim: "Dein Kalender ist noch nicht verbunden", short: "Kalender nicht verbunden" }
        ],
        status: {
          live: "jedes Gespr\u00e4ch, das du f\u00fchrst",
          liveShort: "all deine Gespr\u00e4che",
          open: "alle gleichzeitig offen",
          openShort: "alle offen",
          asked: "du hast in einem gefragt",
          askedShort: "du fragst hier",
          answers: "sie antwortet aus allem, was sie wei\u00df",
          answersShort: "sie antwortet aus allem",
          sources: "jede Zeile, und woher sie kommt",
          sourcesShort: "jede Zeile mit Quelle",
          oneVoice: "eine Stimme \u2014 nie zwei zugleich",
          oneVoiceShort: "eine Stimme, nie zwei",
          samePerson: "dieselbe Person, in allen",
          samePersonShort: "dieselbe Person, in allen"
        }
      }
    },
};
