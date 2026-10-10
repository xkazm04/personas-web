import type { Translations } from "../../en";

export const zh: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "\u96c5\u5178\u5a1c",
        onboarding: "\u4e00\u8d77\u8bbe\u7f6e",
        fleet: "\u4e00\u53e5\u8bdd",
        workshop: "\u8303\u56f4",
        portfolio: "\u5168\u5c40",
        memory: "\u8bb0\u5fc6",
        oneMind: "\u540c\u4e00\u4e2a\u5979"
      },
      hero: {
        eyebrow: "\u4f60\u7684\u53c2\u8c0b",
        headline: "\u8ba4\u8bc6\u4e00\u4e0b",
        headlineGradient: "\u96c5\u5178\u5a1c",
        tagline: "\u6ca1\u4ec0\u4e48\u8981\u8bf4\u7684\u65f6\u5019\uff0c\u5979\u5c31\u4e0d\u8bf4\u3002",
        persona: "\u5979\u662f\u6218\u7565\u5bb6\uff0c\u4e0d\u662f\u70ed\u60c5\u7684\u52a9\u624b\uff1a\u76f4\u63a5\u3001\u6709\u4e3b\u89c1\u3001\u6e29\u6696\u800c\u4e0d\u505a\u4f5c\u3002\u201c\u5feb\u4e0d\u662f\u4f60\u7684\u6d3b\u513f\uff0c\u597d\u624d\u662f\u3002\u201d",
        ctaPrimary: "\u770b\u5979\u600e\u4e48\u505a\u4e8b",
        ctaSecondary: "\u4e0b\u8f7d Personas",
        statWhisper: "\u5168\u90e8\u5728\u4f60\u81ea\u5df1\u7684\u673a\u5668\u4e0a\u8dd1 \u00b7 \u653e\u624b\u5230\u54ea\u4e00\u6b65\u7531\u4f60\u5b9a",
        avatarAlt: "\u96c5\u5178\u5a1c\uff0cPersonas \u7684\u4f19\u4f34",
        orbAria: "\u96c5\u5178\u5a1c \u2014 \u6309\u4e0b Enter\uff0c\u5979\u4f1a\u56de\u5e94\u4f60",
        acknowledgeLine: "\u6211\u5728\u542c\u3002",
        calloutsAria: "\u96c5\u5178\u5a1c\u4e3a\u4f60\u505a\u7684\u4e8b",
        callouts: [
          {
            label: "\u8ddf\u5979\u8bf4\u8bdd",
            fact: "\u6309\u4f4f\u5c31\u80fd\u8bf4\uff0c\u4e0d\u7528\u6253\u5b57"
          },
          {
            label: "\u4e00\u773c\u770b\u6e05",
            fact: "\u770b\u89c1\u5979\u6b63\u5728\u505a\u4ec0\u4e48"
          },
          {
            label: "\u4f60\u7684\u684c\u9762",
            fact: "\u62d6\u5230\u4f60\u5de5\u4f5c\u7684\u5730\u65b9"
          },
          {
            label: "\u968f\u65f6\u90fd\u5728",
            fact: "Cmd/Ctrl+Shift+A\uff0c\u4efb\u4f55\u5e94\u7528\u91cc"
          }
        ]
      },
      onboarding: {
        intro: {
          eyebrow: "\u4e00\u8d77\u52a8\u624b\u8bbe\u7f6e",
          heading: "\u4ece\u7b2c\u4e00\u6b65\u5c31",
          gradient: "\u5728\u4e00\u8d77"
        },
        chrome: {
          appName: "Personas",
          search: "\u641c\u7d22\u2026",
          nav: [
            "\u4e3b\u9875",
            "\u667a\u80fd\u4f53",
            "\u6a21\u677f",
            "\u8fde\u63a5\u5668",
            "\u4fdd\u9669\u5e93",
            "\u8bbe\u7f6e"
          ],
          usageLabel: "\u4eca\u65e5\u8fd0\u884c",
          usageValue: "18 / 25",
          newAgent: "\u65b0\u5efa\u667a\u80fd\u4f53"
        },
        canvas: {
          crumbs: [
            "\u5de5\u4f5c\u533a",
            "\u81ea\u52a8\u5316"
          ],
          filters: [
            "\u5168\u90e8",
            "\u70ed\u95e8",
            "\u5b9a\u65f6",
            "\u6700\u65b0"
          ],
          templatesLabel: "\u6a21\u677f",
          templatesHint: "12 \u4e2a\u6a21\u677f",
          template: {
            title: "\u6bcf\u65e5\u6458\u8981",
            meta: "\u6c47\u603b \u00b7 \u53d1\u5e03 \u00b7 9:00",
            pill: "\u70ed\u95e8",
            schedule: "\u6bcf\u5929 9:00",
            runs: "142 \u6b21",
            health: "98% \u6b63\u5e38"
          },
          templateAlt: {
            title: "\u6536\u4ef6\u7bb1\u6574\u7406",
            meta: "\u6253\u6807 \u00b7 \u8d77\u8349 \u00b7 \u5f52\u6863",
            pill: "\u6700\u65b0",
            schedule: "\u6709\u65b0\u90ae\u4ef6\u65f6",
            runs: "86 \u6b21",
            health: "94% \u6b63\u5e38"
          },
          runsTitle: "\u6700\u8fd1\u7684\u8fd0\u884c",
          runsHint: "\u8fd1 24 \u5c0f\u65f6",
          runsCols: [
            "\u667a\u80fd\u4f53",
            "\u72b6\u6001",
            "\u8017\u65f6"
          ],
          runsRows: [
            {
              name: "\u6bcf\u65e5\u6458\u8981",
              state: "\u6b63\u5e38",
              took: "1.2s"
            },
            {
              name: "PR \u8bc4\u5ba1",
              state: "\u6b63\u5e38",
              took: "0.8s"
            },
            {
              name: "\u7b14\u8bb0\u540c\u6b65",
              state: "\u8fd0\u884c\u4e2d",
              took: "\u2014"
            }
          ],
          connectLabel: "\u8fde\u63a5\u4e00\u4e2a\u5de5\u5177",
          connectCount: "9 \u4e2a\u5df2\u8fde 2 \u4e2a",
          connectCountDone: "9 \u4e2a\u5df2\u8fde 3 \u4e2a",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 \u66f4\u65b0",
            connect: "\u8fde\u63a5",
            connecting: "\u8fde\u63a5\u4e2d\u2026",
            connected: "\u5df2\u8fde\u63a5"
          },
          chips: [
            {
              name: "GitHub",
              detail: "2 \u5206\u949f\u524d\u540c\u6b65",
              state: "\u5df2\u8fde\u63a5"
            },
            {
              name: "Notion",
              detail: "12 \u4e2a\u9875\u9762",
              state: "\u5df2\u8fde\u63a5"
            }
          ],
          triggerLabel: "\u89e6\u53d1",
          triggerIdle: "\u8fd8\u6ca1\u6709\u65f6\u95f4\u8868",
          triggerIdleShort: "\u672a\u8bbe\u7f6e",
          triggerValue: "\u6bcf\u5929\u65e9\u4e0a \u00b7 9:00",
          triggerValueShort: "\u6bcf\u5929 \u00b7 9:00",
          triggerHint: "\u4fee\u6539",
          triggerDays: [
            "\u65e5",
            "\u4e00",
            "\u4e8c",
            "\u4e09",
            "\u56db",
            "\u4e94",
            "\u516d"
          ],
          triggerZone: "UTC+1",
          triggerOff: "\u5173",
          triggerOn: "\u5f00",
          activityLabel: "\u76d1\u63a7\u4e2d",
          activityPill: "\u8fd0\u884c\u4e2d",
          stats: [
            {
              value: "24",
              label: "\u8fd0\u884c"
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
          action: "\u521b\u5efa\u667a\u80fd\u4f53",
          actionDone: "\u5df2\u521b\u5efa"
        },
        captions: {
          template: "\u9009\u4e2a\u8d77\u70b9",
          connect: "\u8fde\u4e0a\u4f60\u7684 Slack",
          trigger: "\u9009\u5b83\u4ec0\u4e48\u65f6\u5019\u8dd1",
          action: "\u70b9\u4e00\u4e0b\uff0c\u5c31\u4e0a\u7ebf\u4e86"
        },
        status: {
          setup: "\u5de5\u4f5c\u533a \u00b7 \u4e00\u8d77\u8bbe\u7f6e\u4e2d",
          setupShort: "\u8bbe\u7f6e\u4e2d",
          step: "\u7b2c {n}/{total} \u6b65 \u00b7 \u548c\u4f60\u4e00\u8d77\u505a",
          stepShort: "\u7b2c {n}/{total} \u6b65",
          live: "\u667a\u80fd\u4f53\u4e0a\u7ebf \u00b7 \u76d1\u63a7\u5df2\u5f00",
          liveShort: "\u8fd0\u884c\u4e2d"
        }
      },
      fleet: {
        intro: {
          eyebrow: "\u7528\u4f60\u81ea\u5df1\u7684\u8bdd\u8bf4\u5c31\u884c",
          heading: "\u4e00\u8d77",
          gradient: "\u8dd1\u8d77\u6765"
        },
        request: {
          placeholder: "\u4ec0\u4e48\u90fd\u53ef\u4ee5\u4ea4\u7ed9\u96c5\u5178\u5a1c\u2026",
          voice: "\u6216\u8005\u76f4\u63a5\u8bf4\u51fa\u6765",
          sent: "\u5df2\u53d1\u9001",
          clauses: [
            [
              "\u628a",
              "\u4e0a\u5468\u7684\u5de5\u5355",
              "\u90fd\u62c9\u51fa\u6765\uff0c"
            ],
            [
              "\u627e\u51fa",
              "\u53cd\u590d\u51fa\u73b0\u7684\u62b1\u6028",
              "\uff0c"
            ],
            [
              "\u770b\u770b",
              "\u6211\u4eec\u5df2\u7ecf\u4fee\u597d\u7684",
              "\uff0c"
            ],
            [
              "\u6570\u4e00\u4e0b",
              "\u5f71\u54cd\u4e86\u591a\u5c11\u4eba",
              "\uff0c"
            ],
            [
              "\u6700\u540e",
              "\u628a\u91cd\u8981\u7684\u544a\u8bc9\u56e2\u961f",
              "\u3002"
            ]
          ]
        },
        plan: {
          hint: "\u5f00\u59cb\u4e4b\u524d\uff0c\u4ec0\u4e48\u90fd\u80fd\u6539",
          hintShort: "\u5148\u6539\u4e5f\u53ef\u4ee5",
          edited: "\u5df2\u4fee\u6539",
          start: "\u5f00\u59cb",
          working: "\u8fdb\u884c\u4e2d",
          done: "\u5b8c\u6210"
        },
        task: {
          working: "\u8fdb\u884c\u4e2d",
          finished: "\u5b8c\u6210"
        },
        tasks: [
          {
            title: "\u628a\u5de5\u5355\u6536\u8d77\u6765",
            scope: "\u8fd1 7 \u5929",
            scopeEdited: "\u8fd1 14 \u5929",
            found: "1,284 \u5f20\u5de5\u5355"
          },
          {
            title: "\u628a\u53cd\u590d\u7684\u62b1\u6028\u5f52\u7c7b",
            scope: "\u6240\u6709\u6e20\u9053",
            found: "9 \u7ec4"
          },
          {
            title: "\u770b\u770b\u5df2\u7ecf\u4fee\u597d\u7684",
            scope: "\u81ea 5 \u6708\u8d77",
            found: "4 \u4e2a\u5df2\u4fee\u597d"
          },
          {
            title: "\u6570\u4e00\u6570\u53d7\u5f71\u54cd\u7684\u4eba",
            scope: "\u6309\u8d26\u6237",
            found: "612 \u4e2a\u8d26\u6237"
          }
        ],
        result: {
          title: "\u8fd9\u5468\u8981\u7d27\u7684\u4e8b",
          rows: [
            {
              label: "\u7ed3\u8d26\u62a5\u9519",
              meta: "214 \u4eba"
            },
            {
              label: "\u641c\u7d22\u5f88\u6162",
              meta: "96 \u4eba"
            },
            {
              label: "\u767b\u5f55\u6b7b\u5faa\u73af",
              meta: "\u5468\u4e8c\u5df2\u4fee\u597d"
            }
          ],
          footer: "\u5df2\u53d1\u7ed9\u56e2\u961f"
        },
        status: {
          speak: "\u8bf4\u7684\u6253\u7684\uff0c\u4e00\u4e2a\u6837",
          speakShort: "\u6253\u5b57\u6216\u8bf4\u8bdd",
          planning: "\u96c5\u5178\u5a1c\u76d8\u7b97\u8981\u505a\u54ea\u4e9b\u4e8b",
          pieces: "\u4e00\u53e5\u8bdd\uff0c\u56db\u4ef6\u4e8b",
          piecesShort: "\u56db\u4ef6\u4e8b",
          yourCall: "\u4f60\u4e0d\u53d1\u8bdd\uff0c\u4ec0\u4e48\u90fd\u4e0d\u52a8",
          yourCallShort: "\u7531\u4f60\u8bf4\u5f00\u59cb",
          parallel: "\u56db\u4ef6\u4e8b\u540c\u65f6\u8fdb\u884c",
          parallelShort: "\u56db\u4ef6\u4e00\u8d77",
          returning: "\u6c47\u6210\u4e00\u4e2a\u7b54\u6848\u56de\u6765",
          returningShort: "\u6c47\u6210\u4e00\u4e2a\u56de\u6765",
          closing: "\u4e00\u53e5\u8bdd\u8fdb \u00b7 \u4e00\u4e2a\u7b54\u6848\u51fa",
          closingShort: "\u4e00\u4e2a\u7b54\u6848"
        }
      },
      workshop: {
        intro: {
          eyebrow: "\u65e0\u8bba\u4f60\u4ea4\u7ed9\u5979\u591a\u5c11",
          heading: "\u4f60\u5212\u4e0b\u7684\u7ebf",
          gradient: "\u4e00\u76f4\u90fd\u5728"
        },
        beds: [
          {
            name: "\u7ed3\u8d26\u5e94\u7528",
            short: "\u7ed3\u8d26"
          },
          {
            name: "\u5b98\u7f51",
            short: "\u7f51\u7ad9"
          },
          {
            name: "\u8ba1\u8d39\u670d\u52a1",
            short: "\u8ba1\u8d39"
          }
        ],
        jobTitles: [
          "\u8dd1\u4e00\u904d\u6d4b\u8bd5",
          "\u68c0\u67e5\u94fe\u63a5",
          "\u6e05\u7406\u8b66\u544a",
          "\u4fee\u597d\u90a3\u4e2a\u4e0d\u7a33\u5b9a\u7684\u6d4b\u8bd5",
          "\u66f4\u65b0\u66f4\u65b0\u65e5\u5fd7",
          "\u6574\u7406\u65e7\u5206\u652f"
        ],
        fence: {
          plate: "\u4f60\u6253\u5f00\u7684\u5730\u65b9",
          plateShort: "\u6253\u5f00\u7684\u5730\u65b9"
        },
        dial: {
          label: "\u5979\u80fd\u81ea\u5df1\u505a\u591a\u5c11",
          labelShort: "\u81ea\u5df1\u505a\u591a\u5c11",
          stops: [
            "\u5148\u95ee\u6211\u4e00\u58f0",
            "\u5c0f\u4e8b\u81ea\u5df1\u6765",
            "\u653e\u624b\u53bb\u505a"
          ],
          stopsShort: [
            "\u5148\u95ee\u6211",
            "\u5c0f\u4e8b",
            "\u53bb\u505a"
          ]
        },
        job: {
          working: "\u8fdb\u884c\u4e2d",
          done: "\u5b8c\u6210"
        },
        outside: {
          name: "\u4ee5\u524d\u7684\u5ba2\u6237\u9879\u76ee",
          waits: "\u7b49\u4f60\u6765\u5b9a"
        },
        status: {
          line: "\u5148\u5212\u7ebf",
          lineShort: "\u5148\u5212\u7ebf",
          draw: "\u53ea\u7528\u5212\u4e00\u6b21",
          drawShort: "\u53ea\u7528\u5212\u4e00\u6b21",
          places: "\u8fd9\u4e9b\u5c31\u662f\u4f60\u6253\u5f00\u7684\u5730\u65b9",
          placesShort: "\u4f60\u6253\u5f00\u7684\u5730\u65b9",
          inside: "\u5728\u8fd9\u91cc\u9762\uff0c\u5979\u5168\u90fd\u80fd\u505a",
          insideShort: "\u5728\u91cc\u9762\u505a\u4e8b",
          turnUp: "\u5f80\u4e0a\u8c03\uff0c\u505a\u5f97\u66f4\u591a\uff0c\u95ee\u5f97\u66f4\u5c11",
          turnUpShort: "\u5f80\u4e0a\u8c03\uff0c\u505a\u5f97\u66f4\u591a",
          unmoved: "\u7ebf\u4e0d\u4f1a\u8ddf\u7740\u632a",
          unmovedShort: "\u7ebf\u4e0d\u4f1a\u632a",
          stops: "\u4f60\u8ba9\u5979\u505c\u5728\u54ea\uff0c\u5979\u5c31\u505c\u5728\u54ea",
          stopsShort: "\u5979\u505c\u5728\u7ebf\u4e0a",
          waits: "\u7136\u540e\u7b49\u7740 \u2014 \u90a3\u4e00\u5757\u5f52\u4f60",
          waitsShort: "\u90a3\u4e00\u5757\u5f52\u4f60",
          free: "\u5728\u4f60\u7684\u7ebf\u91cc\uff0c\u60f3\u591a\u81ea\u7531\u90fd\u884c",
          freeShort: "\u7ebf\u91cc\u9762\uff0c\u968f\u4f60\u81ea\u7531"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "\u5f53\u4f60\u5fd9\u7740\u522b\u7684\u4e8b",
          heading: "\u6ca1\u6709\u4e1c\u897f\u4f1a",
          gradient: "\u6084\u6084\u70c2\u6389"
        },
        projects: [
          "\u5b98\u7f51",
          "\u6587\u6863",
          "\u79fb\u52a8\u7aef",
          "\u8bbe\u8ba1\u7cfb\u7edf",
          "\u5ba2\u670d\u4fe1\u7bb1",
          "\u6570\u636e\u6d41\u6c34\u7ebf",
          "\u7ba1\u7406\u540e\u53f0",
          "\u652f\u4ed8 API",
          "\u641c\u7d22\u670d\u52a1",
          "\u65b0\u624b\u5f15\u5bfc",
          "\u901a\u77e5",
          "\u5185\u90e8\u7ef4\u57fa"
        ],
        field: {
          handled: "\u5df2\u5904\u7406"
        },
        panel: {
          badge: "\u6700\u7cdf\u7684\u6392\u524d\u9762",
          rows: [
            {
              name: "\u4f9d\u8d56",
              since: "\u9759\u4e86 11 \u5929"
            },
            {
              name: "\u591c\u95f4\u6784\u5efa",
              since: "\u5468\u4e94\u8d77\u5c31\u662f\u7ea2\u7684"
            }
          ],
          rest: "\u5176\u4f59 5 \u9879\u90fd\u6b63\u5e38",
          finding: "\u652f\u4ed8\u5e93\u843d\u540e 3 \u4e2a\u7248\u672c\uff0c\u5176\u4e2d\u4e00\u4e2a\u6709\u5df2\u77e5\u6f0f\u6d1e\u3002",
          findingShort: "\u843d\u540e 3 \u4e2a\u7248\u672c\uff0c\u4e00\u4e2a\u6709\u6f0f\u6d1e\u3002",
          action: "\u6253\u5f00\u80fd\u4fee\u597d\u5b83\u7684\u4e1c\u897f",
          actionShort: "\u6253\u5f00\u4fee\u590d",
          done: "\u5df2\u6253\u5f00"
        },
        caption: {
          survey: "\u5728\u67e5\u6bcf\u4e2a\u9879\u76ee",
          surfaced: "\u4e09\u4e2a\u9700\u8981\u4f60",
          worst: "\u5148\u770b\u8fd9\u4e2a",
          found: "\u9759\u4e86 11 \u5929",
          opened: "\u7ed9\u4f60\u6253\u5f00\u4e86"
        },
        status: {
          view: "\u4f60\u6240\u6709\u7684\u9879\u76ee\u90fd\u5728\u773c\u524d",
          viewShort: "\u5168\u90fd\u5728\u773c\u524d",
          checking: "\u4e00\u6b21\u5168\u90fd\u5728\u67e5",
          checkingShort: "\u5168\u90fd\u5728\u67e5",
          needing: "3 \u4e2a\u9700\u8981\u4f60 \u00b7 \u6700\u7cdf\u7684\u5728\u524d",
          needingShort: "3 \u4e2a\u9700\u8981\u4f60",
          travel: "\u76f4\u5954\u6700\u7cdf\u7684\u90a3\u4e2a",
          travelShort: "\u6700\u7cdf\u7684\u5148\u6765",
          quiet: "\u652f\u4ed8 api \u00b7 \u9759\u4e86 11 \u5929",
          quietShort: "\u9759\u4e86 11 \u5929",
          opened: "\u628a\u80fd\u4fee\u597d\u5b83\u7684\u4e1c\u897f\u6253\u5f00\u4e86",
          openedShort: "\u7ed9\u4f60\u6253\u5f00\u4e86",
          back: "\u9000\u56de\u5230\u5168\u5c40",
          backShort: "\u9000\u56de\u5168\u5c40",
          settled: "1 \u4e2a\u5df2\u5904\u7406 \u00b7 2 \u4e2a\u8fd8\u7b49\u7740",
          settledShort: "1 \u4e2a\u5df2\u5904\u7406 \u00b7 2 \u4e2a\u7b49\u7740"
        }
      },
      memory: {
        intro: {
          eyebrow: "\u4f60\u4eec\u4e00\u8d77\u505a\u5f97\u8d8a\u4e45",
          heading: "\u5979\u8bb0\u4f4f\u7684\u5c31",
          gradient: "\u8d8a\u591a"
        },
        talk: "\u6bcf\u5929\u7684\u5bf9\u8bdd",
        rail: "\u591f\u7761\u4e00\u89c9\u7684\u91cf",
        night: "\u5979\u7761\u4e00\u89c9\u60f3\u60f3",
        shelf: "\u5979\u7559\u4e0b\u7684\u4e1c\u897f",
        kept: [
          "\u4f60\u5468\u56db\u53d1\u7248\u3002",
          "\u9884\u53d1\u5e03\u662f\u4f60\u8bd5\u4e1c\u897f\u7684\u5730\u65b9\u3002",
          "\u4f60\u6700\u62c5\u5fc3\u7684\u662f\u8ba1\u8d39\u3002",
          "\u4f60\u559c\u6b22\u5148\u770b\u77ed\u7684\u90a3\u7248\u3002"
        ],
        status: {
          day: "\u4e00\u8d77\u5de5\u4f5c\u7684\u666e\u901a\u4e00\u5929",
          dayShort: "\u666e\u901a\u7684\u4e00\u5929",
          building: "\u4f60\u4eec\u4e00\u8d77\u8fc7\u7684\u4e8b\uff0c\u4e00\u70b9\u70b9\u5806\u8d77\u6765",
          buildingShort: "\u4e00\u5929\u7684\u5bf9\u8bdd\u5728\u5806\u79ef",
          sleeps: "\u6512\u591f\u4e86 \u2014 \u5979\u7761\u4e00\u89c9\u60f3\u60f3",
          sleepsShort: "\u5979\u7761\u4e00\u89c9\u60f3\u60f3",
          wakes: "\u9192\u6765\u65f6\uff0c\u6bd4\u6628\u5929\u591a\u61c2\u4e00\u70b9",
          wakesShort: "\u6bd4\u4e4b\u524d\u591a\u4e00\u70b9",
          keeping: "\u53c8\u4e00\u591c\uff0c\u53c8\u7559\u4e0b\u4e00\u4ef6\u503c\u5f97\u8bb0\u7684",
          keepingShort: "\u53c8\u4e00\u4ef6\u503c\u5f97\u8bb0\u7684",
          quiet: "\u5b89\u9759\u7684\u4e00\u5929 \u2014 \u51e0\u4e4e\u6ca1\u8bf4\u4ec0\u4e48",
          quietShort: "\u5b89\u9759\u7684\u4e00\u5929",
          notEnough: "\u4e0d\u591f\u60f3\u4e00\u591c\uff0c\u90a3\u5c31\u4e0d\u60f3",
          notEnoughShort: "\u4e0d\u591f\u60f3\u4e00\u591c",
          nothingLost: "\u4ec0\u4e48\u90fd\u6ca1\u4e22 \u2014 \u90a3\u5929\u8fd8\u5728\u90a3\u91cc",
          nothingLostShort: "\u8fd8\u5728\uff0c\u4ec0\u4e48\u90fd\u6ca1\u4e22",
          inUse: "\u5979\u6700\u65e9\u8bb0\u4e0b\u7684\u90a3\u4ef6\uff0c\u4eca\u5929\u8fd8\u5728\u7528",
          inUseShort: "\u7b2c\u4e00\u5929\u7684\uff0c\u4eca\u5929\u8fd8\u5728\u7528",
          sleepsAgain: "\u8fd9\u4e00\u4ef6\u5979\u4e5f\u7761\u4e00\u89c9\u60f3\u60f3",
          sleepsAgainShort: "\u8fd9\u4e00\u4ef6\u5979\u4e5f\u7761\u4e00\u89c9\u60f3\u60f3",
          cost: "\u82b1\u7684\u6bd4\u4e00\u6b21\u666e\u901a\u56de\u590d\u8fd8\u5c11",
          costShort: "\u6bd4\u4e00\u6b21\u56de\u590d\u8fd8\u5c11",
          oneMore: "\u53c8\u4e00\u591c\uff0c\u5979\u53c8\u591a\u5e26\u4e0a\u4e00\u4ef6",
          oneMoreShort: "\u5979\u53c8\u591a\u5e26\u4e00\u4ef6",
          carries: "\u4e00\u8d77\u505a\u5f97\u8d8a\u4e45\uff0c\u5979\u5e26\u4e0a\u7684\u8d8a\u591a",
          carriesShort: "\u5979\u5e26\u4e0a\u7684\u8d8a\u591a"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "\u4e0d\u7ba1\u6709\u591a\u5c11\u4e2a\u5bf9\u8bdd",
          heading: "\u59cb\u7ec8\u662f",
          gradient: "\u540c\u4e00\u4e2a\u4eba"
        },
        conversations: [
          {
            name: "\u91cd\u5199\u90a3\u4ef6\u4e8b",
            short: "\u91cd\u5199"
          },
          {
            name: "\u5468\u4e00\u590d\u76d8",
            short: "\u5468\u4e00"
          },
          {
            name: "\u521a\u5f00\u59cb\u8bbe\u7f6e",
            short: "\u8bbe\u7f6e"
          },
          {
            name: "\u90a3\u6b21\u6545\u969c",
            short: "\u6545\u969c"
          },
          {
            name: "\u5b9a\u4ef7\u9875",
            short: "\u5b9a\u4ef7"
          },
          {
            name: "\u53d1\u7968",
            short: "\u53d1\u7968"
          }
        ],
        open: {
          label: "\u8fd9\u4e2a\u5bf9\u8bdd",
          question: "\u6211\u4eec\u8fd8\u6709\u4ec0\u4e48\u5728\u505a\uff1f",
          from: "\u6765\u81ea",
          footer: "\u4eca\u5929\u6ca1\u6709\u522b\u7684\u4e8b\u9700\u8981\u4f60\u4e86\u3002",
          footerShort: "\u6ca1\u6709\u522b\u7684\u9700\u8981\u4f60\u4e86\u3002"
        },
        rows: [
          {
            claim: "\u6700\u540e\u4e00\u6b21\u68c0\u67e5\u5728\u4e00\u5c0f\u65f6\u524d\u901a\u8fc7\u4e86",
            short: "\u4e0a\u6b21\u68c0\u67e5\u901a\u8fc7"
          },
          {
            claim: "\u6709\u4e24\u4e2a\u9879\u76ee\u5728\u7b49\u4f60\uff0c\u90fd\u4e0d\u7b97\u6025",
            short: "2 \u4e2a\u5728\u7b49\uff0c\u90fd\u4e0d\u6025"
          },
          {
            claim: "\u4f60\u7684\u65e5\u5386\u8fd8\u6ca1\u8fde\u4e0a",
            short: "\u65e5\u5386\u672a\u8fde\u63a5"
          }
        ],
        status: {
          live: "\u4f60\u6b63\u5728\u8fdb\u884c\u7684\u6bcf\u4e2a\u5bf9\u8bdd",
          liveShort: "\u4f60\u6240\u6709\u7684\u5bf9\u8bdd",
          open: "\u5168\u90fd\u540c\u65f6\u5f00\u7740",
          openShort: "\u540c\u65f6\u5168\u5f00",
          asked: "\u4f60\u5728\u5176\u4e2d\u4e00\u4e2a\u91cc\u95ee\u4e86",
          askedShort: "\u4f60\u5728\u8fd9\u91cc\u95ee\u4e86",
          answers: "\u5979\u7528\u5979\u77e5\u9053\u7684\u4e00\u5207\u6765\u56de\u7b54",
          answersShort: "\u5979\u4ece\u5168\u90e8\u91cc\u56de\u7b54",
          sources: "\u6bcf\u4e00\u884c\uff0c\u90fd\u5e26\u7740\u51fa\u5904",
          sourcesShort: "\u6bcf\u4e00\u884c\u548c\u5b83\u7684\u51fa\u5904",
          oneVoice: "\u53ea\u6709\u4e00\u4e2a\u58f0\u97f3 \u2014 \u4f60\u4e0d\u4f1a\u540c\u65f6\u542c\u5230\u4e24\u4e2a",
          oneVoiceShort: "\u4e00\u4e2a\u58f0\u97f3\uff0c\u4e0d\u4f1a\u6709\u4e24\u4e2a",
          samePerson: "\u5728\u6bcf\u4e2a\u5bf9\u8bdd\u91cc\uff0c\u90fd\u662f\u540c\u4e00\u4e2a\u4eba",
          samePersonShort: "\u5728\u6bcf\u4e2a\u5bf9\u8bdd\u91cc\uff0c\u90fd\u662f\u540c\u4e00\u4e2a\u4eba"
        }
      }
    },
};
