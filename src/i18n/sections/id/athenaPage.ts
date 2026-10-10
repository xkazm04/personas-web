import type { Translations } from "../../en";

export const id: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "Kenali Athena",
        onboarding: "Persiapan",
        fleet: "Dari satu kalimat",
        workshop: "Yang dia jalankan",
        portfolio: "Semua proyek",
        memory: "Ingatan",
        oneMind: "Satu pikiran"
      },
      hero: {
        eyebrow: "Tangan kanan kamu",
        headline: "Kenalkan,",
        headlineGradient: "Athena",
        tagline: "Dia diam kalau memang tidak ada yang perlu dikatakan.",
        persona: "Seorang perancang strategi, bukan asisten yang selalu ceria \u2014 lugas, punya pendapat, hangat tanpa berpura-pura. \u201cKecepatan bukan tugasmu. Kualitas yang jadi tugasmu.\u201d",
        ctaPrimary: "Lihat cara kerjanya",
        ctaSecondary: "Unduh Personas",
        statWhisper: "Berjalan sepenuhnya di mesin kamu \u00b7 kamu yang menentukan sejauh mana dia melangkah",
        avatarAlt: "Athena, pendamping Personas",
        orbAria: "Athena \u2014 tekan Enter dan dia akan menyahut",
        acknowledgeLine: "Aku mendengarkan.",
        calloutsAria: "Apa yang Athena lakukan untukmu",
        callouts: [
          {
            label: "Ajak dia bicara",
            fact: "Tahan lalu bicara \u2014 tanpa mengetik"
          },
          {
            label: "Sekilas pandang",
            fact: "Lihat apa yang sedang dia kerjakan"
          },
          {
            label: "Desktop kamu",
            fact: "Seret dia ke tempat kamu bekerja"
          },
          {
            label: "Selalu siap",
            fact: "Cmd/Ctrl+Shift+A, dari aplikasi mana pun"
          }
        ]
      },
      onboarding: {
        intro: {
          eyebrow: "Disiapkan bersama",
          heading: "Pendamping",
          gradient: "persiapan"
        },
        chrome: {
          appName: "Personas",
          search: "Cari\u2026",
          nav: [
            "Beranda",
            "Agen",
            "Templat",
            "Konektor",
            "Brankas",
            "Pengaturan"
          ],
          usageLabel: "eksekusi hari ini",
          usageValue: "18 / 25",
          newAgent: "Agen baru"
        },
        canvas: {
          crumbs: [
            "Ruang kerja",
            "Otomatisasi"
          ],
          filters: [
            "Semua",
            "Populer",
            "Terjadwal",
            "Baru"
          ],
          templatesLabel: "Templat",
          templatesHint: "12 templat",
          template: {
            title: "Ringkasan harian",
            meta: "rangkum \u00b7 posting \u00b7 9:00",
            pill: "populer",
            schedule: "Harian 9:00",
            runs: "142 eksekusi",
            health: "98% oke"
          },
          templateAlt: {
            title: "Pilah kotak masuk",
            meta: "label \u00b7 draf \u00b7 arsip",
            pill: "baru",
            schedule: "Saat ada surel baru",
            runs: "86 eksekusi",
            health: "94% oke"
          },
          runsTitle: "Eksekusi terbaru",
          runsHint: "24 jam terakhir",
          runsCols: [
            "agen",
            "status",
            "durasi"
          ],
          runsRows: [
            {
              name: "Ringkasan harian",
              state: "oke",
              took: "1.2s"
            },
            {
              name: "Tinjauan PR",
              state: "oke",
              took: "0.8s"
            },
            {
              name: "Sinkron catatan",
              state: "berjalan",
              took: "\u2014"
            }
          ],
          connectLabel: "Hubungkan satu alat",
          connectCount: "2 dari 9 terhubung",
          connectCountDone: "3 dari 9 terhubung",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 pembaruan",
            connect: "hubungkan",
            connecting: "menghubungkan\u2026",
            connected: "terhubung"
          },
          chips: [
            {
              name: "GitHub",
              detail: "disinkron 2 mnt lalu",
              state: "terhubung"
            },
            {
              name: "Notion",
              detail: "12 halaman",
              state: "terhubung"
            }
          ],
          triggerLabel: "Pemicu",
          triggerIdle: "Belum ada jadwal",
          triggerIdleShort: "Belum diatur",
          triggerValue: "Setiap pagi \u00b7 9:00",
          triggerValueShort: "Harian \u00b7 9:00",
          triggerHint: "ubah",
          triggerDays: [
            "M",
            "S",
            "S",
            "R",
            "K",
            "J",
            "S"
          ],
          triggerZone: "UTC+1",
          triggerOff: "mati",
          triggerOn: "nyala",
          activityLabel: "Pemantauan",
          activityPill: "aktif",
          stats: [
            {
              value: "24",
              label: "eksekusi"
            },
            {
              value: "98%",
              label: "sukses"
            },
            {
              value: "1.4s",
              label: "rata-rata"
            }
          ],
          action: "Buat agen",
          actionDone: "Agen dibuat"
        },
        captions: {
          template: "pilih titik awal",
          connect: "hubungkan Slack kamu",
          trigger: "pilih kapan dia jalan",
          action: "satu klik \u2014 langsung aktif"
        },
        status: {
          setup: "ruang kerja \u00b7 disiapkan bersama",
          setupShort: "sedang disiapkan",
          step: "langkah {n}/{total} \u00b7 dibangun bersamamu",
          stepShort: "langkah {n}/{total}",
          live: "agen aktif \u00b7 pemantauan menyala",
          liveShort: "aktif"
        }
      },
      fleet: {
        intro: {
          eyebrow: "Katakan dengan kata-katamu sendiri",
          heading: "Orkestrasi",
          gradient: "armada"
        },
        request: {
          placeholder: "Minta apa saja ke Athena\u2026",
          voice: "atau cukup ucapkan",
          sent: "terkirim",
          clauses: [
            [
              "Ambil ",
              "tiket minggu lalu",
              ","
            ],
            [
              " cari ",
              "keluhan yang terus berulang",
              ","
            ],
            [
              " periksa ",
              "apa yang sudah kita perbaiki",
              ","
            ],
            [
              " hitung ",
              "berapa banyak yang terkena",
              ","
            ],
            [
              " lalu ",
              "beri tahu tim apa yang penting",
              "."
            ]
          ]
        },
        plan: {
          hint: "Ubah apa pun sebelum dia mulai",
          hintShort: "Ubah dulu apa pun",
          edited: "Diubah",
          start: "Mulai",
          working: "Sedang jalan",
          done: "Selesai"
        },
        task: {
          working: "berjalan",
          finished: "selesai"
        },
        tasks: [
          {
            title: "Kumpulkan tiketnya",
            scope: "7 hari terakhir",
            scopeEdited: "14 hari terakhir",
            found: "1.284 tiket"
          },
          {
            title: "Kelompokkan keluhan berulang",
            scope: "semua kanal",
            found: "9 klaster"
          },
          {
            title: "Periksa yang sudah dirilis",
            scope: "sejak Mei",
            found: "4 sudah diperbaiki"
          },
          {
            title: "Hitung orang yang terdampak",
            scope: "per akun",
            found: "612 akun"
          }
        ],
        result: {
          title: "Yang penting minggu ini",
          rows: [
            {
              label: "Error checkout",
              meta: "214 orang"
            },
            {
              label: "Pencarian lambat",
              meta: "96 orang"
            },
            {
              label: "Loop login",
              meta: "beres Selasa"
            }
          ],
          footer: "dikirim ke tim"
        },
        status: {
          speak: "diucapkan atau diketik \u2014 sama saja",
          speakShort: "ketik atau ucapkan",
          planning: "Athena menyusun apa yang dibutuhkan",
          pieces: "satu kalimat, empat pekerjaan",
          piecesShort: "empat pekerjaan",
          yourCall: "tidak ada yang jalan sebelum kamu bilang",
          yourCallShort: "kamu yang memulai",
          parallel: "keempatnya berjalan bersamaan",
          parallelShort: "empat sekaligus",
          returning: "kembali sebagai satu jawaban",
          returningShort: "jadi satu jawaban",
          closing: "satu kalimat masuk \u00b7 satu jawaban kembali",
          closingShort: "satu jawaban kembali"
        }
      },
      workshop: {
        intro: {
          eyebrow: "Sebanyak apa pun yang kamu serahkan",
          heading: "Garis yang kamu tarik",
          gradient: "tetap berlaku"
        },
        beds: [
          {
            name: "Aplikasi checkout",
            short: "Checkout"
          },
          {
            name: "Situs marketing",
            short: "Situs"
          },
          {
            name: "Layanan penagihan",
            short: "Penagihan"
          }
        ],
        jobTitles: [
          "jalankan tesnya",
          "cek tautannya",
          "bersihkan peringatannya",
          "perbaiki tes yang labil",
          "segarkan changelog",
          "rapikan branch lama"
        ],
        fence: {
          plate: "tempat yang kamu buka",
          plateShort: "yang kamu buka"
        },
        dial: {
          label: "seberapa banyak dia lakukan sendiri",
          labelShort: "seberapa mandiri",
          stops: [
            "tanya aku dulu",
            "urus hal-hal kecil",
            "lanjutkan saja"
          ],
          stopsShort: [
            "tanya dulu",
            "hal kecil",
            "lanjutkan"
          ]
        },
        job: {
          working: "berjalan",
          done: "selesai"
        },
        outside: {
          name: "Pekerjaan klien lama",
          waits: "menunggu kamu"
        },
        status: {
          line: "garisnya lebih dulu",
          lineShort: "garisnya lebih dulu",
          draw: "kamu menariknya sekali",
          drawShort: "kamu menariknya sekali",
          places: "inilah tempat yang kamu buka",
          placesShort: "tempat yang kamu buka",
          inside: "dia bekerja di dalamnya \u2014 seluruhnya",
          insideShort: "dia bekerja di dalam",
          turnUp: "naikkan \u2014 lebih banyak sekaligus, lebih sedikit bertanya",
          turnUpShort: "naikkan \u2014 lebih banyak sekaligus",
          unmoved: "garisnya tidak ikut bergeser",
          unmovedShort: "garisnya tidak bergeser",
          stops: "dia berhenti di tempat kamu menghentikannya",
          stopsShort: "dia berhenti di garis",
          waits: "lalu menunggu \u2014 yang itu milikmu",
          waitsShort: "yang itu milikmu",
          free: "sebebas yang kamu mau, di dalam garismu",
          freeShort: "bebas, di dalam garismu"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "Saat kamu sibuk di tempat lain",
          heading: "Tidak ada yang diam-diam",
          gradient: "membusuk"
        },
        projects: [
          "Situs marketing",
          "Dokumentasi",
          "Aplikasi mobile",
          "Sistem desain",
          "Kotak masuk dukungan",
          "Pipeline data",
          "Alat admin",
          "API pembayaran",
          "Layanan pencarian",
          "Alur onboarding",
          "Notifikasi",
          "Wiki internal"
        ],
        field: {
          handled: "beres"
        },
        panel: {
          badge: "terparah dulu",
          rows: [
            {
              name: "Dependensi",
              since: "sunyi 11 hari"
            },
            {
              name: "Build malam",
              since: "merah sejak Jumat"
            }
          ],
          rest: "5 pemeriksaan lain aman",
          finding: "Pustaka pembayaran tertinggal 3 versi, salah satunya punya celah yang sudah dikenal.",
          findingShort: "Tertinggal 3 versi, satu berlubang.",
          action: "Buka yang memperbaikinya",
          actionShort: "Buka perbaikannya",
          done: "Dibuka"
        },
        caption: {
          survey: "Memeriksa setiap proyek",
          surfaced: "Tiga butuh kamu",
          worst: "Yang ini dulu",
          found: "Sunyi selama 11 hari",
          opened: "Dibuka untuk kamu"
        },
        status: {
          view: "semua proyekmu, dalam satu pandangan",
          viewShort: "semuanya, dalam pandangan",
          checking: "memeriksa semuanya sekaligus",
          checkingShort: "memeriksa semuanya",
          needing: "3 butuh kamu \u00b7 terparah dulu",
          needingShort: "3 butuh kamu",
          travel: "langsung menuju yang terparah",
          travelShort: "yang terparah dulu",
          quiet: "api pembayaran \u00b7 sunyi selama 11 hari",
          quietShort: "sunyi 11 hari",
          opened: "membuka hal yang memperbaikinya",
          openedShort: "dibuka untuk kamu",
          back: "kembali ke gambaran utuh",
          backShort: "kembali keluar",
          settled: "1 beres \u00b7 2 masih menunggu",
          settledShort: "1 beres \u00b7 2 menunggu"
        }
      },
      memory: {
        intro: {
          eyebrow: "Makin lama kalian bekerja bersama",
          heading: "Makin banyak yang",
          gradient: "dia bawa"
        },
        talk: "obrolan tiap hari",
        rail: "cukup untuk dipikirkan semalam",
        night: "dia memikirkannya semalam",
        shelf: "yang dia simpan",
        kept: [
          "Kamu rilis tiap Kamis.",
          "Staging tempat kamu mencoba-coba.",
          "Penagihan yang bikin kamu waswas.",
          "Kamu suka versi singkatnya dulu."
        ],
        status: {
          day: "satu hari biasa bekerja bersama",
          dayShort: "satu hari biasa",
          building: "semua yang kalian lalui, menumpuk pelan-pelan",
          buildingShort: "obrolan hari itu, menumpuk",
          sleeps: "sudah cukup menumpuk \u2014 dia memikirkannya semalam",
          sleepsShort: "dia memikirkannya semalam",
          wakes: "dia bangun dengan sedikit lebih banyak dari sebelumnya",
          wakesShort: "sedikit lebih dari sebelumnya",
          keeping: "satu malam lagi, satu hal lagi yang layak disimpan",
          keepingShort: "satu hal lagi yang layak disimpan",
          quiet: "hari yang sepi \u2014 nyaris tak ada yang dibilang",
          quietShort: "hari yang sepi",
          notEnough: "tidak cukup untuk dipikirkan semalam, jadi tidak dia lakukan",
          notEnoughShort: "tidak cukup untuk dipikirkan",
          nothingLost: "tidak ada yang hilang \u2014 hari itu masih ada",
          nothingLostShort: "masih ada, tak ada yang hilang",
          inUse: "dan hal pertama yang dia simpan masih terpakai hari ini",
          inUseShort: "dari hari pertama, terpakai hari ini",
          sleepsAgain: "yang ini pun dia pikirkan semalam",
          sleepsAgainShort: "yang ini pun dia pikirkan semalam",
          cost: "biayanya kurang dari satu balasan biasa",
          costShort: "kurang dari satu balasan",
          oneMore: "satu malam lagi, satu hal lagi yang dia bawa",
          oneMoreShort: "satu hal lagi yang dia bawa",
          carries: "makin lama kalian bekerja bersama, makin banyak yang dia bawa",
          carriesShort: "makin banyak yang dia bawa"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "Sebanyak apa pun percakapannya",
          heading: "Selalu",
          gradient: "orang yang sama"
        },
        conversations: [
          {
            name: "Penulisan ulang",
            short: "Tulis ulang"
          },
          {
            name: "Tinjauan Senin",
            short: "Senin"
          },
          {
            name: "Persiapan awal",
            short: "Persiapan"
          },
          {
            name: "Gangguan layanan",
            short: "Gangguan"
          },
          {
            name: "Halaman harga",
            short: "Harga"
          },
          {
            name: "Faktur",
            short: "Faktur"
          }
        ],
        open: {
          label: "percakapan ini",
          question: "Apa lagi yang sedang kita kerjakan?",
          from: "dari",
          footer: "Hari ini tidak ada lagi yang butuh kamu.",
          footerShort: "Tidak ada lagi yang butuh kamu."
        },
        rows: [
          {
            claim: "Pemeriksaan terakhir lolos sekitar sejam lalu",
            short: "Pemeriksaan terakhir lolos"
          },
          {
            claim: "Dua proyek menunggu kamu, tidak ada yang mendesak",
            short: "2 menunggu, tak ada yang mendesak"
          },
          {
            claim: "Kalendermu masih belum terhubung",
            short: "Kalender belum terhubung"
          }
        ],
        status: {
          live: "setiap percakapan yang sedang kamu jalani",
          liveShort: "semua percakapanmu",
          open: "semuanya terbuka pada saat yang sama",
          openShort: "semua terbuka sekaligus",
          asked: "kamu bertanya di salah satunya",
          askedShort: "kamu bertanya di sini",
          answers: "dia menjawab dari semua yang dia tahu",
          answersShort: "dia menjawab dari semuanya",
          sources: "setiap baris, dan dari mana asalnya",
          sourcesShort: "setiap baris dan sumbernya",
          oneVoice: "satu suara \u2014 kamu tidak pernah dengar dua sekaligus",
          oneVoiceShort: "satu suara, bukan dua",
          samePerson: "orang yang sama, di semuanya",
          samePersonShort: "orang yang sama, di semuanya"
        }
      }
    },
};
