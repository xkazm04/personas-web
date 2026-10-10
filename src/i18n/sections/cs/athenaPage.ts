import type { Translations } from "../../en";

export const cs: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "POZNEJ ATHENU",
        onboarding: "ZA\u010c\u00cdN\u00c1ME",
        fleet: "Z JEDN\u00c9 V\u011aTY",
        workshop: "CO \u0158\u00cdD\u00cd",
        portfolio: "PROJEKTY",
        memory: "PAM\u011a\u0164",
        oneMind: "JEDNA MYSL"
      },
      hero: {
        eyebrow: "Tvoje prav\u00e1 ruka",
        headline: "Tohle je",
        headlineGradient: "Athena",
        tagline: "Kdy\u017e nen\u00ed co \u0159\u00edct, nic ne\u0159\u00edk\u00e1.",
        persona: "Strat\u00e9\u017eka, ne rozj\u00e1san\u00e1 asistentka \u2014 p\u0159\u00edm\u00e1, s vlastn\u00edm n\u00e1zorem, v\u0159el\u00e1 bez p\u0159ehr\u00e1v\u00e1n\u00ed. \u201eRychlost nen\u00ed tvoje pr\u00e1ce. Kvalita ano.\u201c",
        ctaPrimary: "Pod\u00edvej se, jak pracuje",
        ctaSecondary: "St\u00e1hnout Personas",
        statWhisper: "B\u011b\u017e\u00ed cel\u00e1 u tebe v po\u010d\u00edta\u010di \u00b7 jak daleko zajde, ur\u010duje\u0161 ty",
        avatarAlt: "Athena, spole\u010dnice z Personas",
        orbAria: "Athena \u2014 stiskni Enter a ozve se ti",
        acknowledgeLine: "Poslouch\u00e1m.",
        calloutsAria: "Co pro tebe Athena d\u011bl\u00e1",
        callouts: [
          { label: "Mluv s n\u00ed", fact: "Podr\u017e a mluv \u2014 bez psan\u00ed" },
          { label: "Jedn\u00edm pohledem", fact: "Vid\u00ed\u0161, na \u010dem pracuje" },
          { label: "Tvoje plocha", fact: "P\u0159et\u00e1hni ji, kam pracuje\u0161" },
          { label: "V\u017edy po ruce", fact: "Cmd/Ctrl+Shift+A, odkudkoli" }
        ]
      },
      onboarding: {
        intro: {
          eyebrow: "Nastav\u00edme to spolu",
          heading: "Par\u0165\u00e1k",
          gradient: "na za\u010d\u00e1tek"
        },
        chrome: {
          appName: "Personas",
          search: "Hledat\u2026",
          nav: ["Dom\u016f", "Agenti", "\u0160ablony", "Konektory", "Trezor", "Nastaven\u00ed"],
          usageLabel: "spu\u0161t\u011bn\u00ed dnes",
          usageValue: "18 / 25",
          newAgent: "Nov\u00fd agent"
        },
        canvas: {
          crumbs: ["Pracovn\u00ed prostor", "Automatizace"],
          filters: ["V\u0161e", "Obl\u00edben\u00e9", "Napl\u00e1novan\u00e9", "Nov\u00e9"],
          templatesLabel: "\u0160ablony",
          templatesHint: "12 \u0161ablon",
          template: {
            title: "Denn\u00ed p\u0159ehled",
            meta: "shrnout \u00b7 odeslat \u00b7 9:00",
            pill: "obl\u00edben\u00e9",
            schedule: "Denn\u011b v 9:00",
            runs: "142 spu\u0161t\u011bn\u00ed",
            health: "98 % ok"
          },
          templateAlt: {
            title: "T\u0159\u00edd\u011bn\u00ed po\u0161ty",
            meta: "\u0161t\u00edtek \u00b7 n\u00e1vrh \u00b7 archiv",
            pill: "nov\u00e9",
            schedule: "P\u0159i nov\u00e9 po\u0161t\u011b",
            runs: "86 spu\u0161t\u011bn\u00ed",
            health: "94 % ok"
          },
          runsTitle: "Posledn\u00ed spu\u0161t\u011bn\u00ed",
          runsHint: "posledn\u00edch 24 h",
          runsCols: ["agent", "stav", "trvalo"],
          runsRows: [
            { name: "Denn\u00ed p\u0159ehled", state: "ok", took: "1,2 s" },
            { name: "Kontrola PR", state: "ok", took: "0,8 s" },
            { name: "Sync pozn\u00e1mek", state: "b\u011b\u017e\u00ed", took: "\u2014" }
          ],
          connectLabel: "P\u0159ipoj n\u00e1stroj",
          connectCount: "2 z 9 p\u0159ipojeno",
          connectCountDone: "3 z 9 p\u0159ipojeno",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 novinky",
            connect: "p\u0159ipojit",
            connecting: "p\u0159ipojuji\u2026",
            connected: "p\u0159ipojeno"
          },
          chips: [
            { name: "GitHub", detail: "sync p\u0159ed 2 min", state: "p\u0159ipojeno" },
            { name: "Notion", detail: "12 str\u00e1nek", state: "p\u0159ipojeno" }
          ],
          triggerLabel: "Spou\u0161t\u011b\u010d",
          triggerIdle: "Zat\u00edm bez pl\u00e1nu",
          triggerIdleShort: "Bez pl\u00e1nu",
          triggerValue: "Ka\u017ed\u00e9 r\u00e1no \u00b7 9:00",
          triggerValueShort: "Denn\u011b \u00b7 9:00",
          triggerHint: "upravit",
          triggerDays: ["N", "P", "\u00da", "S", "\u010c", "P", "S"],
          triggerZone: "UTC+1",
          triggerOff: "vyp",
          triggerOn: "zap",
          activityLabel: "Sledov\u00e1n\u00ed",
          activityPill: "\u017eiv\u011b",
          stats: [
            { value: "24", label: "spu\u0161t\u011bn\u00ed" },
            { value: "98 %", label: "\u00fasp\u011bch" },
            { value: "1,4 s", label: "pr\u016fm\u011br" }
          ],
          action: "Vytvo\u0159it agenta",
          actionDone: "Agent vytvo\u0159en"
        },
        captions: {
          template: "vyber si v\u00fdchoz\u00ed bod",
          connect: "p\u0159ipoj sv\u016fj Slack",
          trigger: "ur\u010di, kdy pob\u011b\u017e\u00ed",
          action: "jedno kliknut\u00ed \u2014 a jede"
        },
        status: {
          setup: "prostor \u00b7 nastavujeme spolu",
          setupShort: "nastavujeme",
          step: "krok {n}/{total} \u00b7 tvo\u0159\u00edte spolu",
          stepShort: "krok {n}/{total}",
          live: "agent b\u011b\u017e\u00ed \u00b7 sledov\u00e1n\u00ed zap",
          liveShort: "b\u011b\u017e\u00ed"
        }
      },
      fleet: {
        intro: { eyebrow: "\u0158ekni to sv\u00fdmi slovy", heading: "Orchestrace", gradient: "flotily" },
        request: {
          placeholder: "Zeptej se Atheny na cokoli\u2026",
          voice: "nebo to prost\u011b \u0159ekni",
          sent: "odesl\u00e1no",
          clauses: [
            ["Vyt\u00e1hni ", "tikety z minul\u00e9ho t\u00fddne", ","],
            [" najdi ", "st\u00ed\u017enosti, kter\u00e9 se opakuj\u00ed", ","],
            [" zjisti, ", "co u\u017e jsme opravili", ","],
            [" spo\u010d\u00edtej, ", "kolika lid\u00ed se to t\u00fdkalo", ","],
            [" a ", "\u0159ekni t\u00fdmu, na \u010dem z\u00e1le\u017e\u00ed", "."]
          ]
        },
        plan: {
          hint: "Ne\u017e to spust\u00ed\u0161, m\u016f\u017ee\u0161 cokoli zm\u011bnit",
          hintShort: "Nejd\u0159\u00edv cokoli zm\u011b\u0148",
          edited: "Zm\u011bn\u011bno",
          start: "Spustit",
          working: "Pracuje",
          done: "Hotovo"
        },
        task: { working: "pracuje", finished: "hotovo" },
        tasks: [
          {
            title: "Posb\u00edrat tikety",
            scope: "posledn\u00edch 7 dn\u00ed",
            scopeEdited: "posledn\u00edch 14 dn\u00ed",
            found: "1 284 tiket\u016f"
          },
          {
            title: "Seskupit opakovan\u00e9 st\u00ed\u017enosti",
            scope: "v\u0161echny kan\u00e1ly",
            found: "9 skupin"
          },
          {
            title: "Ov\u011b\u0159it, co u\u017e jsme vydali",
            scope: "od kv\u011btna",
            found: "4 u\u017e opraveno"
          },
          {
            title: "Spo\u010d\u00edtat zasa\u017een\u00e9 lidi",
            scope: "podle \u00fa\u010dtu",
            found: "612 \u00fa\u010dt\u016f"
          }
        ],
        result: {
          title: "Na \u010dem tento t\u00fdden z\u00e1le\u017e\u00ed",
          rows: [
            { label: "Chyby v pokladn\u011b", meta: "214 lid\u00ed" },
            { label: "Pomal\u00e9 hled\u00e1n\u00ed", meta: "96 lid\u00ed" },
            { label: "Smy\u010dka p\u0159ihl\u00e1\u0161en\u00ed", meta: "opraveno v \u00fater\u00fd" }
          ],
          footer: "odesl\u00e1no t\u00fdmu"
        },
        status: {
          speak: "\u0159ekni to nebo napi\u0161 \u2014 nez\u00e1le\u017e\u00ed",
          speakShort: "napi\u0161 to nebo \u0159ekni",
          planning: "Athena promysl\u00ed, co to obn\u00e1\u0161\u00ed",
          pieces: "jedna v\u011bta, \u010dty\u0159i kusy pr\u00e1ce",
          piecesShort: "\u010dty\u0159i kusy pr\u00e1ce",
          yourCall: "nic neb\u011b\u017e\u00ed, dokud ne\u0159ekne\u0161",
          yourCallShort: "start je na tob\u011b",
          parallel: "v\u0161echny \u010dty\u0159i ve stejnou chv\u00edli",
          parallelShort: "v\u0161echny \u010dty\u0159i nar\u00e1z",
          returning: "vrac\u00ed se jako jedna odpov\u011b\u010f",
          returningShort: "vrac\u00ed se jako jedna",
          closing: "jedna v\u011bta tam \u00b7 jedna odpov\u011b\u010f zp\u011bt",
          closingShort: "jedna odpov\u011b\u010f zp\u011bt"
        }
      },
      workshop: {
        intro: {
          eyebrow: "A\u0165 j\u00ed sv\u011b\u0159\u00ed\u0161 cokoli",
          heading: "Tvoje hranice",
          gradient: "dr\u017e\u00ed"
        },
        beds: [
          { name: "Aplikace pokladny", short: "Pokladna" },
          { name: "Marketingov\u00fd web", short: "Web" },
          { name: "Faktura\u010dn\u00ed slu\u017eba", short: "Fakturace" }
        ],
        jobTitles: [
          "spustit testy",
          "zkontrolovat odkazy",
          "uklidit varov\u00e1n\u00ed",
          "opravit nestabiln\u00ed test",
          "aktualizovat changelog",
          "uklidit star\u00e9 v\u011btve"
        ],
        fence: { plate: "m\u00edsta, kter\u00e1 jsi otev\u0159el", plateShort: "co jsi otev\u0159el" },
        dial: {
          label: "kolik toho zvl\u00e1dne sama",
          labelShort: "kolik zvl\u00e1dne sama",
          stops: ["nejd\u0159\u00edv se m\u011b zeptej", "ty drobnosti", "jen do toho"],
          stopsShort: ["zeptej se m\u011b", "drobnosti", "do toho"]
        },
        job: { working: "pracuje", done: "hotovo" },
        outside: { name: "Star\u00e1 zak\u00e1zka", waits: "\u010dek\u00e1 na tebe" },
        status: {
          line: "nejd\u0159\u00edv je hranice",
          lineShort: "nejd\u0159\u00edv je hranice",
          draw: "nakresl\u00ed\u0161 ji jednou",
          drawShort: "nakresl\u00ed\u0161 ji jednou",
          places: "tohle jsou m\u00edsta, cos otev\u0159el",
          placesShort: "m\u00edsta, cos otev\u0159el",
          inside: "uvnit\u0159 pracuje naplno \u2014 v\u0161ude",
          insideShort: "pracuje uvnit\u0159",
          turnUp: "p\u0159idej \u2014 v\u00edc nar\u00e1z, m\u00ed\u0148 ot\u00e1zek",
          turnUpShort: "p\u0159idej \u2014 v\u00edc nar\u00e1z",
          unmoved: "hranice se s t\u00edm nehne",
          unmovedShort: "hranice se nehne",
          stops: "zastav\u00ed tam, kde jsi \u0159ekl",
          stopsShort: "zastav\u00ed na hranici",
          waits: "a \u010dek\u00e1 \u2014 tohle je tvoje",
          waitsShort: "tohle je tvoje",
          free: "voln\u011b, jak chce\u0161 \u2014 uvnit\u0159 hranic",
          freeShort: "voln\u011b, uvnit\u0159 tv\u00fdch hranic"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "Zat\u00edmco m\u00e1\u0161 pr\u00e1ci jinde",
          heading: "Nic ti\u0161e",
          gradient: "nech\u00e1tr\u00e1"
        },
        projects: [
          "Marketingov\u00fd web",
          "Dokumentace",
          "Mobiln\u00ed aplikace",
          "Design syst\u00e9m",
          "Schr\u00e1nka podpory",
          "Datov\u00e1 pipeline",
          "Admin n\u00e1stroje",
          "Platebn\u00ed API",
          "Vyhled\u00e1v\u00e1n\u00ed",
          "Onboarding",
          "Notifikace",
          "Intern\u00ed wiki"
        ],
        field: { handled: "vy\u0159e\u0161eno" },
        panel: {
          badge: "nejhor\u0161\u00ed prvn\u00ed",
          rows: [
            { name: "Z\u00e1vislosti", since: "ticho 11 dn\u00ed" },
            { name: "No\u010dn\u00ed build", since: "\u010derven\u00fd od p\u00e1tku" }
          ],
          rest: "5 dal\u0161\u00edch kontrol v po\u0159\u00e1dku",
          finding: "Platebn\u00ed knihovna je o 3 verze pozadu, jedna z nich m\u00e1 zn\u00e1mou d\u00edru.",
          findingShort: "3 verze pozadu, jedna s d\u00edrou.",
          action: "Otev\u0159\u00edt, co to sprav\u00ed",
          actionShort: "Otev\u0159\u00edt opravu",
          done: "Otev\u0159eno"
        },
        caption: {
          survey: "Proch\u00e1z\u00ed ka\u017ed\u00fd projekt",
          surfaced: "T\u0159i t\u011b pot\u0159ebuj\u00ed",
          worst: "Tenhle prvn\u00ed",
          found: "Ticho u\u017e 11 dn\u00ed",
          opened: "Otev\u0159eno pro tebe"
        },
        status: {
          view: "v\u0161echny tvoje projekty na o\u010d\u00edch",
          viewShort: "v\u0161echny na o\u010d\u00edch",
          checking: "kontroluje v\u0161echny nar\u00e1z",
          checkingShort: "kontroluje v\u0161echny",
          needing: "3 t\u011b pot\u0159ebuj\u00ed \u00b7 nejhor\u0161\u00ed prvn\u00ed",
          needingShort: "3 t\u011b pot\u0159ebuj\u00ed",
          travel: "m\u00ed\u0159\u00ed rovnou k tomu nejhor\u0161\u00edmu",
          travelShort: "nejhor\u0161\u00ed prvn\u00ed",
          quiet: "payments api \u00b7 ticho 11 dn\u00ed",
          quietShort: "ticho 11 dn\u00ed",
          opened: "otev\u0159ela to, co to sprav\u00ed",
          openedShort: "otev\u0159eno pro tebe",
          back: "zp\u00e1tky na cel\u00fd obraz",
          backShort: "zp\u00e1tky ven",
          settled: "1 vy\u0159e\u0161eno \u00b7 2 st\u00e1le \u010dekaj\u00ed",
          settledShort: "1 vy\u0159e\u0161eno \u00b7 2 \u010dekaj\u00ed"
        }
      },
      memory: {
        intro: {
          eyebrow: "\u010c\u00edm d\u00e9le spolu pracujete",
          heading: "T\u00edm v\u00edc si",
          gradient: "toho nese"
        },
        talk: "pov\u00edd\u00e1n\u00ed za den",
        rail: "dost, aby se vyspala",
        night: "vysp\u00ed se na to",
        shelf: "co si nech\u00e1v\u00e1",
        kept: [
          "Vyd\u00e1v\u00e1\u0161 ve \u010dtvrtek.",
          "Na stagingu zkou\u0161\u00ed\u0161 v\u011bci.",
          "Fakturace je to, co t\u011b tr\u00e1p\u00ed.",
          "Nejd\u0159\u00edv chce\u0161 kr\u00e1tkou verzi."
        ],
        status: {
          day: "jeden oby\u010dejn\u00fd den spolupr\u00e1ce",
          dayShort: "jeden oby\u010dejn\u00fd den",
          building: "v\u0161echno, \u010d\u00edm spolu projdete, se vrstv\u00ed",
          buildingShort: "denn\u00ed pov\u00edd\u00e1n\u00ed se vrstv\u00ed",
          sleeps: "nasb\u00edralo se dost \u2014 vysp\u00ed se",
          sleepsShort: "vysp\u00ed se na to",
          wakes: "probud\u00ed se o kousek d\u00e1l",
          wakesShort: "o kousek d\u00e1l",
          keeping: "dal\u0161\u00ed noc, dal\u0161\u00ed v\u011bc k zapamatov\u00e1n\u00ed",
          keepingShort: "dal\u0161\u00ed v\u011bc k zapamatov\u00e1n\u00ed",
          quiet: "klidn\u00fd den \u2014 skoro nic \u0159e\u010deno",
          quietShort: "klidn\u00fd den",
          notEnough: "nenasb\u00edralo se dost, tak nesp\u00ed",
          notEnoughShort: "nenasb\u00edralo se dost",
          nothingLost: "nic nen\u00ed pry\u010d \u2014 ten den z\u016fst\u00e1v\u00e1",
          nothingLostShort: "z\u016fst\u00e1v\u00e1, nic nen\u00ed pry\u010d",
          inUse: "a prvn\u00ed poznatek pou\u017e\u00edv\u00e1 i dnes",
          inUseShort: "prvn\u00ed poznatek, dnes",
          sleepsAgain: "i na tuhle se vysp\u00ed",
          sleepsAgainShort: "i na tuhle se vysp\u00ed",
          cost: "stoj\u00ed ji m\u00ed\u0148 ne\u017e jedna odpov\u011b\u010f",
          costShort: "m\u00ed\u0148 ne\u017e jedna odpov\u011b\u010f",
          oneMore: "dal\u0161\u00ed noc, dal\u0161\u00ed v\u011bc nav\u00edc",
          oneMoreShort: "dal\u0161\u00ed v\u011bc, co si nese",
          carries: "\u010d\u00edm d\u00e9le spolu pracujete, t\u00edm v\u00edc si toho nese",
          carriesShort: "t\u00edm v\u00edc si toho nese"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "A\u0165 m\u00e1\u0161 rozhovor\u016f kolik chce\u0161",
          heading: "Po\u0159\u00e1d ta",
          gradient: "stejn\u00e1 osoba"
        },
        conversations: [
          { name: "Ten p\u0159epis", short: "P\u0159epis" },
          { name: "Pond\u011bln\u00ed review", short: "Pond\u011bl\u00ed" },
          { name: "Rozj\u00ed\u017ed\u00edme to", short: "Rozjezd" },
          { name: "V\u00fdpadek", short: "V\u00fdpadek" },
          { name: "Str\u00e1nka s cenami", short: "Ceny" },
          { name: "Faktury", short: "Faktury" }
        ],
        open: {
          label: "tenhle rozhovor",
          question: "Na \u010dem dal\u0161\u00edm pracujeme?",
          from: "zdroj:",
          footer: "Dnes t\u011b nic dal\u0161\u00edho nepot\u0159ebuje.",
          footerShort: "Nic dal\u0161\u00edho t\u011b nepot\u0159ebuje."
        },
        rows: [
          {
            claim: "Posledn\u00ed kontrola pro\u0161la asi p\u0159ed hodinou",
            short: "Posledn\u00ed kontrola pro\u0161la"
          },
          {
            claim: "Dva projekty \u010dekaj\u00ed na tebe, ani jeden neho\u0159\u00ed",
            short: "2 \u010dekaj\u00ed, nic neho\u0159\u00ed"
          },
          {
            claim: "Kalend\u00e1\u0159 po\u0159\u00e1d nem\u00e1\u0161 p\u0159ipojen\u00fd",
            short: "Kalend\u00e1\u0159 nen\u00ed p\u0159ipojen\u00fd"
          }
        ],
        status: {
          live: "v\u0161echny rozhovory, co m\u00e1\u0161 rozjet\u00e9",
          liveShort: "v\u0161echny tvoje rozhovory",
          open: "v\u0161echny otev\u0159en\u00e9 nar\u00e1z",
          openShort: "v\u0161echny nar\u00e1z",
          asked: "zeptal ses v jednom z nich",
          askedShort: "zeptal ses tady",
          answers: "odpov\u00edd\u00e1 ze v\u0161eho, co v\u00ed",
          answersShort: "odpov\u00edd\u00e1 ze v\u0161eho",
          sources: "ka\u017ed\u00fd \u0159\u00e1dek i s t\u00edm, odkud je",
          sourcesShort: "ka\u017ed\u00fd \u0159\u00e1dek a odkud je",
          oneVoice: "jeden hlas \u2014 nikdy dva nar\u00e1z",
          oneVoiceShort: "jeden hlas, nikdy dva",
          samePerson: "ve v\u0161ech ta stejn\u00e1 osoba",
          samePersonShort: "ve v\u0161ech ta stejn\u00e1 osoba"
        }
      }
    },
};
