import type { Translations } from "../../en";

export const ja: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "\u30a2\u30c6\u30ca",
        onboarding: "\u306f\u3058\u3081\u306b",
        fleet: "\u4e00\u8a00\u304b\u3089",
        workshop: "\u4efb\u305b\u308b\u7bc4\u56f2",
        portfolio: "\u5168\u4f53",
        memory: "\u8a18\u61b6",
        oneMind: "\u3072\u3068\u3064\u306e\u5fc3"
      },
      hero: {
        eyebrow: "\u3042\u306a\u305f\u306e\u53c2\u8b00",
        headline: "\u306f\u3058\u3081\u307e\u3057\u3066",
        headlineGradient: "\u30a2\u30c6\u30ca",
        tagline: "\u8a00\u3046\u3053\u3068\u304c\u306a\u3044\u3068\u304d\u306f\u3001\u4f55\u3082\u8a00\u3044\u307e\u305b\u3093\u3002",
        persona: "\u660e\u308b\u3044\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8\u3067\u306f\u306a\u304f\u3001\u6226\u7565\u5bb6\u3067\u3059\u3002\u7387\u76f4\u3067\u3001\u610f\u898b\u3092\u6301\u3061\u3001\u6f14\u3058\u306a\u3044\u6e29\u304b\u3055\u3002\u300c\u901f\u3055\u306f\u3042\u306a\u305f\u306e\u4ed5\u4e8b\u3058\u3083\u306a\u3044\u3002\u8cea\u304c\u305d\u3046\u3060\u3002\u300d",
        ctaPrimary: "\u50cd\u304f\u3068\u3053\u308d\u3092\u898b\u308b",
        ctaSecondary: "Personas\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
        statWhisper: "\u3059\u3079\u3066\u3042\u306a\u305f\u306e\u30de\u30b7\u30f3\u3067\u52d5\u304f \u00b7 \u3069\u3053\u307e\u3067\u4efb\u305b\u308b\u304b\u306f\u3042\u306a\u305f\u6b21\u7b2c",
        avatarAlt: "Personas\u306e\u76f8\u68d2\u3001\u30a2\u30c6\u30ca",
        orbAria: "\u30a2\u30c6\u30ca \u2014 Enter\u3092\u62bc\u3059\u3068\u5fdc\u3048\u307e\u3059",
        acknowledgeLine: "\u805e\u3044\u3066\u3044\u307e\u3059\u3002",
        calloutsAria: "\u30a2\u30c6\u30ca\u304c\u3042\u306a\u305f\u306e\u305f\u3081\u306b\u3059\u308b\u3053\u3068",
        callouts: [
          {
            label: "\u8a71\u3057\u304b\u3051\u308b",
            fact: "\u62bc\u3057\u3066\u8a71\u3059\u3060\u3051\u3001\u5165\u529b\u306a\u3057"
          },
          {
            label: "\u3072\u3068\u76ee\u3067\u308f\u304b\u308b",
            fact: "\u4eca\u306a\u306b\u3092\u3057\u3066\u3044\u308b\u304b\u898b\u3048\u308b"
          },
          {
            label: "\u3042\u306a\u305f\u306e\u30c7\u30b9\u30af\u30c8\u30c3\u30d7",
            fact: "\u50cd\u304f\u5834\u6240\u3078\u30c9\u30e9\u30c3\u30b0"
          },
          {
            label: "\u3044\u3064\u3067\u3082\u547c\u3079\u308b",
            fact: "Cmd/Ctrl+Shift+A\u3001\u3069\u306e\u30a2\u30d7\u30ea\u304b\u3089\u3067\u3082"
          }
        ]
      },
      onboarding: {
        intro: {
          eyebrow: "\u4e00\u7dd2\u306b\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7",
          heading: "\u306f\u3058\u3081\u304b\u3089",
          gradient: "\u4e00\u7dd2\u306b"
        },
        chrome: {
          appName: "Personas",
          search: "\u691c\u7d22\u2026",
          nav: [
            "\u30db\u30fc\u30e0",
            "\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8",
            "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
            "\u30b3\u30cd\u30af\u30bf",
            "\u4fdd\u7ba1\u5eab",
            "\u8a2d\u5b9a"
          ],
          usageLabel: "\u4eca\u65e5\u306e\u5b9f\u884c",
          usageValue: "18 / 25",
          newAgent: "\u65b0\u3057\u3044\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8"
        },
        canvas: {
          crumbs: [
            "\u30ef\u30fc\u30af\u30b9\u30da\u30fc\u30b9",
            "\u81ea\u52d5\u5316"
          ],
          filters: [
            "\u3059\u3079\u3066",
            "\u4eba\u6c17",
            "\u5b9a\u671f",
            "\u65b0\u7740"
          ],
          templatesLabel: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
          templatesHint: "12\u4ef6\u306e\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
          template: {
            title: "\u6bce\u65e5\u306e\u307e\u3068\u3081",
            meta: "\u8981\u7d04 \u00b7 \u6295\u7a3f \u00b7 9:00",
            pill: "\u4eba\u6c17",
            schedule: "\u6bce\u65e5 9:00",
            runs: "142\u56de",
            health: "98% \u6b63\u5e38"
          },
          templateAlt: {
            title: "\u53d7\u4fe1\u30c8\u30ec\u30a4\u306e\u4ed5\u5206\u3051",
            meta: "\u30e9\u30d9\u30eb \u00b7 \u4e0b\u66f8\u304d \u00b7 \u4fdd\u7ba1",
            pill: "\u65b0\u7740",
            schedule: "\u65b0\u7740\u30e1\u30fc\u30eb\u3067",
            runs: "86\u56de",
            health: "94% \u6b63\u5e38"
          },
          runsTitle: "\u6700\u8fd1\u306e\u5b9f\u884c",
          runsHint: "\u76f4\u8fd124\u6642\u9593",
          runsCols: [
            "\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8",
            "\u72b6\u614b",
            "\u6642\u9593"
          ],
          runsRows: [
            {
              name: "\u6bce\u65e5\u306e\u307e\u3068\u3081",
              state: "\u6b63\u5e38",
              took: "1.2s"
            },
            {
              name: "PR\u30ec\u30d3\u30e5\u30fc",
              state: "\u6b63\u5e38",
              took: "0.8s"
            },
            {
              name: "\u30e1\u30e2\u306e\u540c\u671f",
              state: "\u5b9f\u884c\u4e2d",
              took: "\u2014"
            }
          ],
          connectLabel: "\u30c4\u30fc\u30eb\u3092\u3064\u306a\u3050",
          connectCount: "9\u3064\u4e2d2\u3064\u63a5\u7d9a\u6e08\u307f",
          connectCountDone: "9\u3064\u4e2d3\u3064\u63a5\u7d9a\u6e08\u307f",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 \u66f4\u65b0",
            connect: "\u3064\u306a\u3050",
            connecting: "\u63a5\u7d9a\u4e2d\u2026",
            connected: "\u63a5\u7d9a\u6e08\u307f"
          },
          chips: [
            {
              name: "GitHub",
              detail: "2\u5206\u524d\u306b\u540c\u671f",
              state: "\u63a5\u7d9a\u6e08\u307f"
            },
            {
              name: "Notion",
              detail: "12\u30da\u30fc\u30b8",
              state: "\u63a5\u7d9a\u6e08\u307f"
            }
          ],
          triggerLabel: "\u30c8\u30ea\u30ac\u30fc",
          triggerIdle: "\u4e88\u5b9a\u306f\u307e\u3060\u306a\u3057",
          triggerIdleShort: "\u672a\u8a2d\u5b9a",
          triggerValue: "\u6bce\u671d\u304d\u307e\u3063\u3066 \u00b7 9:00",
          triggerValueShort: "\u6bce\u65e5 \u00b7 9:00",
          triggerHint: "\u7de8\u96c6",
          triggerDays: [
            "\u65e5",
            "\u6708",
            "\u706b",
            "\u6c34",
            "\u6728",
            "\u91d1",
            "\u571f"
          ],
          triggerZone: "UTC+1",
          triggerOff: "\u30aa\u30d5",
          triggerOn: "\u30aa\u30f3",
          activityLabel: "\u76e3\u8996\u4e2d",
          activityPill: "\u7a3c\u50cd\u4e2d",
          stats: [
            {
              value: "24",
              label: "\u5b9f\u884c"
            },
            {
              value: "98%",
              label: "\u6210\u529f"
            },
            {
              value: "1.4s",
              label: "\u5e73\u5747"
            }
          ],
          action: "\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u3092\u4f5c\u308b",
          actionDone: "\u4f5c\u6210\u3057\u307e\u3057\u305f"
        },
        captions: {
          template: "\u51fa\u767a\u70b9\u3092\u9078\u3076",
          connect: "Slack\u3092\u3064\u306a\u3050",
          trigger: "\u3044\u3064\u52d5\u304b\u3059\u304b\u6c7a\u3081\u308b",
          action: "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u3067\u7a3c\u50cd"
        },
        status: {
          setup: "\u30ef\u30fc\u30af\u30b9\u30da\u30fc\u30b9 \u00b7 \u4e00\u7dd2\u306b\u8a2d\u5b9a\u4e2d",
          setupShort: "\u8a2d\u5b9a\u4e2d",
          step: "\u30b9\u30c6\u30c3\u30d7 {n}/{total} \u00b7 \u4e00\u7dd2\u306b\u4f5c\u308b",
          stepShort: "\u30b9\u30c6\u30c3\u30d7 {n}/{total}",
          live: "\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u7a3c\u50cd \u00b7 \u76e3\u8996\u30aa\u30f3",
          liveShort: "\u7a3c\u50cd\u4e2d"
        }
      },
      fleet: {
        intro: {
          eyebrow: "\u81ea\u5206\u306e\u8a00\u8449\u3067\u8a00\u3046\u3060\u3051",
          heading: "\u307e\u3068\u3081\u3066",
          gradient: "\u52d5\u304b\u3059"
        },
        request: {
          placeholder: "\u30a2\u30c6\u30ca\u306b\u4f55\u3067\u3082\u983c\u3093\u3067\u2026",
          voice: "\u8a71\u3057\u304b\u3051\u3066\u3082\u3044\u3044",
          sent: "\u9001\u4fe1",
          clauses: [
            [
              "\u307e\u305a",
              "\u5148\u9031\u306e\u30c1\u30b1\u30c3\u30c8",
              "\u3092\u96c6\u3081\u3066\u3001"
            ],
            [
              "\u305d\u3053\u304b\u3089",
              "\u7e70\u308a\u8fd4\u3057\u3066\u3044\u308b\u4e0d\u6e80",
              "\u3092\u898b\u3064\u3051\u3066\u3001"
            ],
            [
              "\u305d\u308c\u3068",
              "\u3082\u3046\u76f4\u3057\u305f\u5206",
              "\u3092\u78ba\u8a8d\u3057\u3066\u3001"
            ],
            [
              "\u3055\u3089\u306b",
              "\u5f71\u97ff\u3057\u305f\u4eba\u6570",
              "\u3092\u6570\u3048\u3066\u3001"
            ],
            [
              "\u6700\u5f8c\u306b",
              "\u5927\u4e8b\u306a\u3053\u3068\u3060\u3051",
              "\u30c1\u30fc\u30e0\u306b\u4f1d\u3048\u3066\u3002"
            ]
          ]
        },
        plan: {
          hint: "\u59cb\u307e\u308b\u524d\u306b\u4f55\u3067\u3082\u5909\u3048\u3089\u308c\u307e\u3059",
          hintShort: "\u5148\u306b\u5909\u3048\u3066\u3082\u3044\u3044",
          edited: "\u5909\u66f4\u6e08\u307f",
          start: "\u958b\u59cb",
          working: "\u4f5c\u696d\u4e2d",
          done: "\u5b8c\u4e86"
        },
        task: {
          working: "\u4f5c\u696d\u4e2d",
          finished: "\u5b8c\u4e86"
        },
        tasks: [
          {
            title: "\u30c1\u30b1\u30c3\u30c8\u3092\u96c6\u3081\u308b",
            scope: "\u76f4\u8fd17\u65e5",
            scopeEdited: "\u76f4\u8fd114\u65e5",
            found: "1,284\u4ef6"
          },
          {
            title: "\u7e70\u308a\u8fd4\u3059\u4e0d\u6e80\u3092\u307e\u3068\u3081\u308b",
            scope: "\u5168\u30c1\u30e3\u30cd\u30eb",
            found: "9\u3064\u306e\u307e\u3068\u307e\u308a"
          },
          {
            title: "\u3082\u3046\u76f4\u3057\u305f\u5206\u3092\u78ba\u8a8d",
            scope: "5\u6708\u4ee5\u964d",
            found: "4\u4ef6\u306f\u4fee\u6b63\u6e08\u307f"
          },
          {
            title: "\u5f71\u97ff\u3092\u53d7\u3051\u305f\u4eba\u3092\u6570\u3048\u308b",
            scope: "\u30a2\u30ab\u30a6\u30f3\u30c8\u5358\u4f4d",
            found: "612\u30a2\u30ab\u30a6\u30f3\u30c8"
          }
        ],
        result: {
          title: "\u4eca\u9031\u306e\u5927\u4e8b\u306a\u3053\u3068",
          rows: [
            {
              label: "\u6c7a\u6e08\u306e\u30a8\u30e9\u30fc",
              meta: "214\u4eba"
            },
            {
              label: "\u691c\u7d22\u304c\u9045\u3044",
              meta: "96\u4eba"
            },
            {
              label: "\u30ed\u30b0\u30a4\u30f3\u306e\u5802\u3005\u5de1\u308a",
              meta: "\u706b\u66dc\u306b\u4fee\u6b63\u6e08\u307f"
            }
          ],
          footer: "\u30c1\u30fc\u30e0\u306b\u9001\u4fe1\u6e08\u307f"
        },
        status: {
          speak: "\u8a71\u3057\u3066\u3082\u5165\u529b\u3057\u3066\u3082\u540c\u3058",
          speakShort: "\u8a71\u3057\u3066\u3082\u5165\u529b\u3057\u3066\u3082",
          planning: "\u30a2\u30c6\u30ca\u304c\u5fc5\u8981\u306a\u624b\u9806\u3092\u8003\u3048\u308b",
          pieces: "\u4e00\u6587\u304b\u3089\u30014\u3064\u306e\u4ed5\u4e8b",
          piecesShort: "4\u3064\u306e\u4ed5\u4e8b",
          yourCall: "\u3042\u306a\u305f\u304c\u8a00\u3046\u307e\u3067\u52d5\u304b\u306a\u3044",
          yourCallShort: "\u59cb\u3081\u308b\u306e\u306f\u3042\u306a\u305f",
          parallel: "4\u3064\u3068\u3082\u540c\u6642\u306b\u9032\u3080",
          parallelShort: "4\u3064\u540c\u6642\u306b",
          returning: "\u3072\u3068\u3064\u306e\u7b54\u3048\u306b\u306a\u3063\u3066\u8fd4\u308b",
          returningShort: "\u3072\u3068\u3064\u306b\u306a\u3063\u3066\u8fd4\u308b",
          closing: "\u4e00\u6587\u5165\u308c\u3066 \u00b7 \u7b54\u3048\u306f\u3072\u3068\u3064",
          closingShort: "\u7b54\u3048\u306f\u3072\u3068\u3064"
        }
      },
      workshop: {
        intro: {
          eyebrow: "\u3069\u308c\u3060\u3051\u4efb\u305b\u3066\u3082",
          heading: "\u3042\u306a\u305f\u304c\u5f15\u3044\u305f\u7dda\u306f",
          gradient: "\u305d\u306e\u307e\u307e"
        },
        beds: [
          {
            name: "\u6c7a\u6e08\u30a2\u30d7\u30ea",
            short: "\u6c7a\u6e08"
          },
          {
            name: "\u30de\u30fc\u30b1\u30b5\u30a4\u30c8",
            short: "\u30b5\u30a4\u30c8"
          },
          {
            name: "\u8ab2\u91d1\u30b5\u30fc\u30d3\u30b9",
            short: "\u8ab2\u91d1"
          }
        ],
        jobTitles: [
          "\u30c6\u30b9\u30c8\u3092\u56de\u3059",
          "\u30ea\u30f3\u30af\u3092\u78ba\u8a8d\u3059\u308b",
          "\u8b66\u544a\u3092\u7247\u3065\u3051\u308b",
          "\u4e0d\u5b89\u5b9a\u306a\u30c6\u30b9\u30c8\u3092\u76f4\u3059",
          "\u5909\u66f4\u5c65\u6b74\u3092\u66f4\u65b0\u3059\u308b",
          "\u53e4\u3044\u30d6\u30e9\u30f3\u30c1\u3092\u6574\u7406\u3059\u308b"
        ],
        fence: {
          plate: "\u3042\u306a\u305f\u304c\u958b\u3051\u305f\u5834\u6240",
          plateShort: "\u958b\u3051\u305f\u5834\u6240"
        },
        dial: {
          label: "\u3069\u3053\u307e\u3067\u81ea\u5206\u3067\u9032\u3081\u308b\u304b",
          labelShort: "\u3069\u3053\u307e\u3067\u81ea\u5206\u3067",
          stops: [
            "\u307e\u305a\u76f8\u8ac7\u3057\u3066",
            "\u5c0f\u3055\u3044\u3053\u3068\u306f\u4efb\u305b\u308b",
            "\u3069\u3093\u3069\u3093\u9032\u3081\u3066"
          ],
          stopsShort: [
            "\u307e\u305a\u76f8\u8ac7",
            "\u5c0f\u3055\u3044\u3053\u3068",
            "\u9032\u3081\u3066"
          ]
        },
        job: {
          working: "\u4f5c\u696d\u4e2d",
          done: "\u5b8c\u4e86"
        },
        outside: {
          name: "\u6614\u306e\u30af\u30e9\u30a4\u30a2\u30f3\u30c8\u6848\u4ef6",
          waits: "\u3042\u306a\u305f\u3092\u5f85\u3063\u3066\u3044\u308b"
        },
        status: {
          line: "\u307e\u305a\u7dda\u3092\u5f15\u304f",
          lineShort: "\u307e\u305a\u7dda\u3092\u5f15\u304f",
          draw: "\u5f15\u304f\u306e\u306f\u4e00\u5ea6\u3060\u3051",
          drawShort: "\u5f15\u304f\u306e\u306f\u4e00\u5ea6\u3060\u3051",
          places: "\u3053\u3053\u304c\u3042\u306a\u305f\u306e\u958b\u3051\u305f\u5834\u6240",
          placesShort: "\u3042\u306a\u305f\u304c\u958b\u3051\u305f\u5834\u6240",
          inside: "\u305d\u306e\u4e2d\u3067\u306a\u3089\u3001\u3069\u3053\u307e\u3067\u3082\u52d5\u304f",
          insideShort: "\u305d\u306e\u4e2d\u3067\u52d5\u304f",
          turnUp: "\u4e0a\u3052\u308b\u307b\u3069\u3001\u540c\u6642\u306b\u591a\u304f\u3001\u78ba\u8a8d\u306f\u5c11\u306a\u304f",
          turnUpShort: "\u4e0a\u3052\u308c\u3070\u3001\u540c\u6642\u306b\u591a\u304f",
          unmoved: "\u305d\u308c\u3067\u3082\u7dda\u306f\u52d5\u304b\u306a\u3044",
          unmovedShort: "\u7dda\u306f\u52d5\u304b\u306a\u3044",
          stops: "\u3042\u306a\u305f\u304c\u6b62\u3081\u305f\u3068\u3053\u308d\u3067\u6b62\u307e\u308b",
          stopsShort: "\u7dda\u306e\u3068\u3053\u308d\u3067\u6b62\u307e\u308b",
          waits: "\u305d\u3057\u3066\u5f85\u3064 \u2014 \u305d\u308c\u306f\u3042\u306a\u305f\u306e\u9818\u5206",
          waitsShort: "\u305d\u308c\u306f\u3042\u306a\u305f\u306e\u9818\u5206",
          free: "\u3042\u306a\u305f\u306e\u7dda\u306e\u5185\u5074\u3067\u306a\u3089\u3001\u597d\u304d\u306a\u3060\u3051\u81ea\u7531\u306b",
          freeShort: "\u7dda\u306e\u5185\u5074\u3067\u3001\u81ea\u7531\u306b"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "\u3042\u306a\u305f\u304c\u4ed6\u306e\u3053\u3068\u3067\u624b\u4e00\u676f\u3067\u3082",
          heading: "\u9759\u304b\u306b\u8150\u308b\u3082\u306e\u306f",
          gradient: "\u3072\u3068\u3064\u3082\u306a\u3044"
        },
        projects: [
          "\u30de\u30fc\u30b1\u30b5\u30a4\u30c8",
          "\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8",
          "\u30e2\u30d0\u30a4\u30eb\u30a2\u30d7\u30ea",
          "\u30c7\u30b6\u30a4\u30f3\u30b7\u30b9\u30c6\u30e0",
          "\u30b5\u30dd\u30fc\u30c8\u53d7\u4fe1\u7bb1",
          "\u30c7\u30fc\u30bf\u57fa\u76e4",
          "\u7ba1\u7406\u30c4\u30fc\u30eb",
          "\u6c7a\u6e08API",
          "\u691c\u7d22\u30b5\u30fc\u30d3\u30b9",
          "\u521d\u56de\u30d5\u30ed\u30fc",
          "\u901a\u77e5",
          "\u793e\u5185Wiki"
        ],
        field: {
          handled: "\u5bfe\u5fdc\u6e08\u307f"
        },
        panel: {
          badge: "\u3072\u3069\u3044\u9806",
          rows: [
            {
              name: "\u4f9d\u5b58\u95a2\u4fc2",
              since: "11\u65e5\u9593\u306a\u306b\u3082"
            },
            {
              name: "\u6bce\u6669\u306e\u30d3\u30eb\u30c9",
              since: "\u91d1\u66dc\u304b\u3089\u8d64"
            }
          ],
          rest: "\u4ed6\u306e5\u4ef6\u306f\u554f\u984c\u306a\u3057",
          finding: "\u6c7a\u6e08\u30e9\u30a4\u30d6\u30e9\u30ea\u304c3\u30d0\u30fc\u30b8\u30e7\u30f3\u9045\u308c\u3002\u3046\u30611\u3064\u306b\u65e2\u77e5\u306e\u7a74\u304c\u3042\u308a\u307e\u3059\u3002",
          findingShort: "3\u30d0\u30fc\u30b8\u30e7\u30f3\u9045\u308c\u30011\u3064\u306b\u7a74\u3002",
          action: "\u76f4\u3059\u3082\u306e\u3092\u958b\u304f",
          actionShort: "\u4fee\u6b63\u3092\u958b\u304f",
          done: "\u958b\u304d\u307e\u3057\u305f"
        },
        caption: {
          survey: "\u5168\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u3092\u70b9\u691c",
          surfaced: "3\u4ef6\u304c\u3042\u306a\u305f\u5f85\u3061",
          worst: "\u307e\u305a\u306f\u3053\u308c",
          found: "11\u65e5\u9593\u3001\u9759\u304b",
          opened: "\u958b\u3044\u3066\u304a\u3044\u305f"
        },
        status: {
          view: "\u3042\u306a\u305f\u306e\u5168\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u304c\u8996\u754c\u306b",
          viewShort: "\u5168\u90e8\u304c\u8996\u754c\u306b",
          checking: "\u5168\u90e8\u3092\u4e00\u5ea6\u306b\u70b9\u691c\u4e2d",
          checkingShort: "\u5168\u90e8\u3092\u70b9\u691c\u4e2d",
          needing: "3\u4ef6\u304c\u3042\u306a\u305f\u5f85\u3061 \u00b7 \u3072\u3069\u3044\u9806",
          needingShort: "3\u4ef6\u304c\u5f85\u3061",
          travel: "\u3044\u3061\u3070\u3093\u3072\u3069\u3044\u3082\u306e\u3078\u76f4\u884c",
          travelShort: "\u3072\u3069\u3044\u3082\u306e\u304b\u3089",
          quiet: "\u6c7a\u6e08api \u00b7 11\u65e5\u9593\u306a\u306b\u3082",
          quietShort: "11\u65e5\u9593\u306a\u306b\u3082",
          opened: "\u76f4\u3059\u3082\u306e\u3092\u958b\u3044\u305f",
          openedShort: "\u958b\u3044\u3066\u304a\u3044\u305f",
          back: "\u307e\u305f\u5168\u4f53\u306b\u623b\u308b",
          backShort: "\u5168\u4f53\u3078\u623b\u308b",
          settled: "1\u4ef6\u5bfe\u5fdc\u6e08\u307f \u00b7 2\u4ef6\u306f\u5f85\u6a5f\u4e2d",
          settledShort: "1\u4ef6\u6e08\u307f \u00b7 2\u4ef6\u5f85\u3061"
        }
      },
      memory: {
        intro: {
          eyebrow: "\u4e00\u7dd2\u306b\u50cd\u304f\u307b\u3069",
          heading: "\u899a\u3048\u3066\u3044\u308b\u3053\u3068\u304c",
          gradient: "\u5897\u3048\u3066\u3044\u304f"
        },
        talk: "\u305d\u306e\u65e5\u306e\u4f1a\u8a71",
        rail: "\u4e00\u6669\u5bdd\u304b\u305b\u308b\u5206",
        night: "\u4e00\u6669\u5bdd\u304b\u305b\u308b",
        shelf: "\u6b8b\u3057\u3066\u304a\u304f\u3053\u3068",
        kept: [
          "\u30ea\u30ea\u30fc\u30b9\u306f\u6728\u66dc\u65e5\u3002",
          "\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u306f\u8a66\u3059\u5834\u6240\u3002",
          "\u6c17\u306b\u306a\u3063\u3066\u3044\u308b\u306e\u306f\u8ab2\u91d1\u3002",
          "\u307e\u305a\u306f\u77ed\u3044\u7248\u304c\u597d\u307f\u3002"
        ],
        status: {
          day: "\u4e00\u7dd2\u306b\u50cd\u304f\u3001\u3075\u3064\u3046\u306e\u4e00\u65e5",
          dayShort: "\u3075\u3064\u3046\u306e\u4e00\u65e5",
          building: "\u4e8c\u4eba\u3067\u3053\u306a\u3057\u305f\u3053\u3068\u304c\u3001\u7a4d\u307f\u4e0a\u304c\u308b",
          buildingShort: "\u305d\u306e\u65e5\u306e\u4f1a\u8a71\u304c\u7a4d\u307f\u4e0a\u304c\u308b",
          sleeps: "\u5341\u5206\u305f\u307e\u3063\u305f \u2014 \u4e00\u6669\u5bdd\u304b\u305b\u308b",
          sleepsShort: "\u4e00\u6669\u5bdd\u304b\u305b\u308b",
          wakes: "\u671d\u306b\u306f\u3001\u5c11\u3057\u3060\u3051\u591a\u304f\u3092\u6301\u3063\u3066\u3044\u308b",
          wakesShort: "\u524d\u3088\u308a\u5c11\u3057\u3060\u3051\u591a\u304f",
          keeping: "\u307e\u305f\u4e00\u6669\u3001\u307e\u305f\u6b8b\u3059\u4fa1\u5024\u306e\u3042\u308b\u3053\u3068",
          keepingShort: "\u307e\u305f\u6b8b\u3059\u4fa1\u5024\u306e\u3042\u308b\u3053\u3068",
          quiet: "\u9759\u304b\u306a\u4e00\u65e5 \u2014 \u307b\u3068\u3093\u3069\u8a00\u8449\u3082\u306a\u304f",
          quietShort: "\u9759\u304b\u306a\u4e00\u65e5",
          notEnough: "\u5bdd\u304b\u305b\u308b\u307b\u3069\u3067\u3082\u306a\u3044\u304b\u3089\u3001\u305d\u306e\u307e\u307e",
          notEnoughShort: "\u5bdd\u304b\u305b\u308b\u307b\u3069\u3067\u3082\u306a\u3044",
          nothingLost: "\u4f55\u3082\u5931\u308f\u308c\u306a\u3044 \u2014 \u305d\u306e\u65e5\u306f\u3061\u3083\u3093\u3068\u6b8b\u3063\u3066\u3044\u308b",
          nothingLostShort: "\u6b8b\u3063\u3066\u3044\u308b\u3001\u5931\u308f\u308c\u306a\u3044",
          inUse: "\u6700\u521d\u306b\u6b8b\u3057\u305f\u3053\u3068\u304c\u3001\u4eca\u65e5\u3082\u52b9\u3044\u3066\u3044\u308b",
          inUseShort: "\u521d\u65e5\u306e\u5206\u304c\u3001\u4eca\u65e5\u3082",
          sleepsAgain: "\u3053\u308c\u3082\u4e00\u6669\u5bdd\u304b\u305b\u308b",
          sleepsAgainShort: "\u3053\u308c\u3082\u4e00\u6669\u5bdd\u304b\u305b\u308b",
          cost: "\u3075\u3064\u3046\u306e\u8fd4\u4e8b\u4e00\u56de\u3088\u308a\u8efd\u3044",
          costShort: "\u8fd4\u4e8b\u4e00\u56de\u3088\u308a\u8efd\u3044",
          oneMore: "\u307e\u305f\u4e00\u6669\u3001\u62b1\u3048\u308b\u3082\u306e\u304c\u307e\u305f\u4e00\u3064",
          oneMoreShort: "\u62b1\u3048\u308b\u3082\u306e\u304c\u307e\u305f\u4e00\u3064",
          carries: "\u4e00\u7dd2\u306b\u50cd\u304f\u307b\u3069\u3001\u62b1\u3048\u308b\u3082\u306e\u306f\u5897\u3048\u3066\u3044\u304f",
          carriesShort: "\u62b1\u3048\u308b\u3082\u306e\u306f\u5897\u3048\u3066\u3044\u304f"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "\u4f1a\u8a71\u304c\u3044\u304f\u3064\u3042\u3063\u3066\u3082",
          heading: "\u3044\u3064\u3082",
          gradient: "\u540c\u3058\u4eba"
        },
        conversations: [
          {
            name: "\u66f8\u304d\u76f4\u3057\u306e\u4ef6",
            short: "\u66f8\u304d\u76f4\u3057"
          },
          {
            name: "\u6708\u66dc\u306e\u30ec\u30d3\u30e5\u30fc",
            short: "\u6708\u66dc"
          },
          {
            name: "\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u306e\u8a71",
            short: "\u8a2d\u5b9a"
          },
          {
            name: "\u969c\u5bb3\u306e\u4ef6",
            short: "\u969c\u5bb3"
          },
          {
            name: "\u6599\u91d1\u30da\u30fc\u30b8",
            short: "\u6599\u91d1"
          },
          {
            name: "\u8acb\u6c42\u66f8",
            short: "\u8acb\u6c42"
          }
        ],
        open: {
          label: "\u3053\u306e\u4f1a\u8a71",
          question: "\u307b\u304b\u306b\u4f55\u3092\u9032\u3081\u3066\u308b\uff1f",
          from: "\u51fa\u5178",
          footer: "\u4eca\u65e5\u306f\u307b\u304b\u306b\u624b\u3092\u501f\u308a\u308b\u3053\u3068\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
          footerShort: "\u307b\u304b\u306b\u7528\u306f\u3042\u308a\u307e\u305b\u3093\u3002"
        },
        rows: [
          {
            claim: "\u6700\u5f8c\u306e\u30c1\u30a7\u30c3\u30af\u306f1\u6642\u9593\u307b\u3069\u524d\u306b\u901a\u3063\u305f",
            short: "\u76f4\u8fd1\u306e\u30c1\u30a7\u30c3\u30af\u306f\u901a\u904e"
          },
          {
            claim: "2\u3064\u306e\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u304c\u5f85\u3063\u3066\u3044\u308b\u3002\u3069\u3061\u3089\u3082\u6025\u304e\u3067\u306f\u306a\u3044",
            short: "2\u4ef6\u5f85\u3061\u3001\u6025\u304e\u306a\u3057"
          },
          {
            claim: "\u30ab\u30ec\u30f3\u30c0\u30fc\u306f\u307e\u3060\u3064\u306a\u304c\u3063\u3066\u3044\u306a\u3044",
            short: "\u30ab\u30ec\u30f3\u30c0\u30fc\u672a\u63a5\u7d9a"
          }
        ],
        status: {
          live: "\u9032\u884c\u4e2d\u306e\u4f1a\u8a71\u3059\u3079\u3066",
          liveShort: "\u4f1a\u8a71\u3059\u3079\u3066",
          open: "\u5168\u90e8\u304c\u540c\u6642\u306b\u958b\u3044\u3066\u3044\u308b",
          openShort: "\u5168\u90e8\u540c\u6642\u306b\u958b\u304f",
          asked: "\u305d\u306e\u3046\u3061\u306e\u4e00\u3064\u3067\u5c0b\u306d\u305f",
          askedShort: "\u3053\u3053\u3067\u5c0b\u306d\u305f",
          answers: "\u77e5\u3063\u3066\u3044\u308b\u3053\u3068\u5168\u90e8\u304b\u3089\u7b54\u3048\u308b",
          answersShort: "\u5168\u90e8\u304b\u3089\u7b54\u3048\u308b",
          sources: "\u4e00\u884c\u3054\u3068\u306b\u3001\u305d\u306e\u51fa\u3069\u3053\u308d\u3082",
          sourcesShort: "\u4e00\u884c\u3054\u3068\u306b\u51fa\u3069\u3053\u308d",
          oneVoice: "\u58f0\u306f\u3072\u3068\u3064 \u2014 \u4e8c\u3064\u540c\u6642\u306b\u805e\u304f\u3053\u3068\u306f\u306a\u3044",
          oneVoiceShort: "\u58f0\u306f\u3072\u3068\u3064\u3001\u4e8c\u3064\u306f\u306a\u3044",
          samePerson: "\u3069\u306e\u4f1a\u8a71\u3067\u3082\u3001\u540c\u3058\u4eba",
          samePersonShort: "\u3069\u306e\u4f1a\u8a71\u3067\u3082\u3001\u540c\u3058\u4eba"
        }
      }
    },
};
