import type { Translations } from './en';

export const id: Translations = {
    notFound: {
      title: "Halaman tidak ditemukan",
      description: "Halaman yang Anda cari tidak ada atau telah dipindahkan. Coba salah satu dari ini:",
      home: "Beranda",
      getStarted: "Mulai",
      backToHome: "Kembali ke beranda"
    },
    errorPage: {
      title: "Halaman ini mengalami masalah tak terduga",
      description: "Terjadi kesalahan saat memuat halaman ini. Tim kami telah diberi tahu \u2014 coba lagi, atau kembali ke beranda.",
      tryAgain: "Coba lagi",
      errorReference: "Referensi kesalahan",
      copyReference: "Salin referensi kesalahan",
      backToHome: "Kembali ke beranda"
    },
    nav: {
      home: "Personas",
      how: "Cara kerja",
      connections: "Koneksi",
      roadmap: "Peta jalan",
      templates: "Templat",
      download: "Unduh",
      dashboard: "Dasbor",
      features: "Fitur",
      guide: "Panduan",
      useCases: "Kasus penggunaan",
      tour: "Tur",
      security: "Keamanan",
      blog: "Blog",
      changelog: "Catatan perubahan",
      pricing: "Harga",
      menu: "Menu"
    },
    compareSection: {
      heading: "Semuanya",
      headingGradient: "gratis",
      description: "Aplikasi desktop dan setiap kemampuan di bawah ini gratis selamanya. Tanpa tingkatan, tanpa biaya per kursi \u2014 hanya platform agen lengkap yang berjalan di mesin Anda.",
      offerBadges: [
        "Gratis selamanya",
        "Self-hosted",
        "Tanpa markup per-run",
        "Open source"
      ],
      offerBody: "Personas berjalan di mesin Anda. Tidak ada markup orkestrasi dan tidak ada harga per-kursi. Cloud berbayar dan dukungan prioritas bersifat opsional, bukan wajib.",
      ctaLabel: "Mulai gratis",
      readGuide: "Baca panduan",
      groups: {
        "agents-prompts": {
          title: "Agen & Prompt",
          tagline: "Berfokus pada pengguna",
          concepts: [
            "Pembuatan persona dalam bahasa alami",
            "40+ templat yang dapat diadopsi",
            "BYOM \u2014 Claude atau Ollama lokal",
            "Mode prompt terstruktur + sederhana",
            "Memori agen persisten"
          ]
        },
        triggers: {
          title: "Orkestrasi",
          tagline: "Setiap cara untuk memulai agen",
          concepts: [
            "Jadwal (cron)",
            "Endpoint webhook",
            "Pemantau berkas",
            "Pemantau papan klip",
            "Pemicu rantai / peristiwa",
            "Kondisi gabungan"
          ]
        },
        pipelines: {
          title: "Pipeline & Tim",
          tagline: "Kolaborasi agen secara visual",
          concepts: [
            "Kanvas tim visual",
            "Koneksi aliran data",
            "Bus peristiwa langsung",
            "Eksekusi yang memperbaiki diri",
            "Pemutaran ulang pipeline + perjalanan waktu"
          ]
        },
        credentials: {
          title: "Kredensial & Keamanan",
          tagline: "Rahasia Anda tetap di mesin Anda",
          concepts: [
            "Brankas AES-256-GCM",
            "Keyring asli OS",
            "OAuth dengan bantuan AI",
            "Penyegaran token otomatis",
            "Tanpa telemetri, mengutamakan lokal"
          ]
        },
        monitoring: {
          title: "Pemantauan",
          tagline: "Lihat, hitung biaya, dan kendalikan setiap proses",
          concepts: [
            "Dasbor observabilitas langsung",
            "Pelacakan span per eksekusi",
            "Atribusi biaya per model",
            "Antrean tinjauan manusia",
            "Peringatan anggaran + penegakan"
          ]
        },
        testing: {
          title: "Lab Pengujian",
          tagline: "Evolusi otomatis",
          concepts: [
            "Arena untuk pengujian A/B",
            "Pembuatan versi prompt + diff",
            "Penilaian kebugaran",
            "Siklus pembiakan",
            "Kotak pasir alat tiruan"
          ]
        }
      }
    },
    footer: {
      tagline: "Agen AI yang bekerja untuk Anda",
      motto: "Agen AI yang mengotomatiskan pekerjaan Anda, sehingga Anda bisa fokus pada hal yang paling penting.",
      product: "Produk",
      resources: "Sumber Daya",
      legal: "Hukum",
      privacy: "Privasi",
      terms: "Ketentuan",
      copyright: "Personas. Hak cipta dilindungi.",
      slogan: "Otomatiskan pekerjaan Anda. Ambil kembali waktu Anda."
    },
    pricing: {
      local: "Lokal",
      cloud: "Cloud",
      enterprise: "Enterprise",
      downloadLocal: "Unduh Lokal",
      goCloud: "Gunakan Cloud",
      contactSales: "Hubungi Penjualan",
      comingSoon: "Segera Hadir",
      bestFor: "Terbaik untuk",
      forever: "selamanya",
      mo: "/bln",
      custom: "Kustom",
      bestForLocal: "Pengembang solo untuk memulai",
      bestForCloud: "Tim individu yang bergerak cepat",
      bestForEnterprise: "Organisasi dengan kebutuhan kepatuhan & skala",
      features: {
        unlimitedLocalAgents: "Agen lokal tak terbatas",
        localEventBus: "Event bus & penjadwal lokal",
        fullObservability: "Dasbor observabilitas penuh",
        designEngine: "Mesin desain",
        teamCanvasLocal: "Kanvas tim (lokal)",
        everythingInFree: "Semua di paket Gratis",
        cloudWorkers3: "3 worker cloud",
        executions1000: "1.000 eksekusi/bln",
        events10000: "10.000 event/bln",
        burstAutoScaling: "Auto-scaling lonjakan",
        everythingInPro: "Semua di Pro",
        ssoSaml: "SSO via SAML & OIDC",
        multiTenantRbac: "Workspace multi-tenant dengan RBAC",
        auditTrailExport: "Ekspor jejak audit eksekusi",
        dedicatedWorkers: "Worker cloud khusus & SLA",
        prioritySupport: "Dukungan prioritas"
      }
    },
    hero: {
      downloadCta: "Unduh",
      trustLine: "Tanpa pendaftaran, tanpa kartu kredit. Berjalan di mesin Anda. Nol telemetri.",
      badge: "Platform Agen AI",
      headingLine1: "Agen cerdas",
      headingLine2: "yang bekerja untuk Anda",
      description: "Desain agen dalam bahasa alami. Orkestrasi secara lokal atau di cloud.",
      descriptionBold: "Tanpa diagram alur kerja. Tanpa gerombolan agen. Tanpa kode.",
      mode2: "Penyiapan sederhana",
      mode3: "Gratis",
      mode5: "Meningkatkan diri",
      viewOnGithub: "Lihat di GitHub",
      downloadForWindows: "Unduh untuk Windows",
      commandCenter: "Pusat Komando",
      adoptionSnapshot: "Ringkasan adopsi",
      scroll: "Gulir",
      publicBeta: "BETA PUBLIK",
      agents: "Agen",
      connectors: "Konektor",
      templates: "Templat"
    },
    sections: {
      vision: "Visi",
      pricing: "Harga",
      faq: "FAQ",
      features: "Fitur",
      useCases: "Kasus Penggunaan",
      eventBus: "Event Bus",
      download: "Unduh"
    },
    common: {
      skipToMain: "Langsung ke konten utama",
      loading: "Memuat...",
      cancel: "Batal",
      close: "Tutup",
      back: "Kembali",
      next: "Selanjutnya",
      save: "Simpan",
      delete: "Hapus",
      edit: "Edit",
      search: "Cari",
      noResults: "Tidak ada hasil ditemukan",
      signOut: "Keluar",
      signingOut: "Sedang keluar\u2026",
      signIn: "Masuk",
      notifyMe: "beritahu saya",
      step: "Langkah",
      learnMore: "Pelajari lebih lanjut",
      viewAll: "Lihat semua",
      status: "Status",
      active: "aktif",
      idle: "idle",
      total: "total",
      checking: "Memeriksa\u2026",
      connected: "Terhubung",
      disconnected: "Terputus",
      demo: "Demo",
      viewFullSite: "Lihat situs lengkap"
    },
    useCasesSection: {
      heading: "Satu persona,",
      headingGradient: "banyak kemampuan",
      integrations: "integrasi",
      patterns: "kemampuan",
      description: "Setiap persona membawa identitas yang stabil dan sekumpulan kemampuan yang dapat disusun \u2014 klik integrasi mana pun untuk menjelajahi tugas yang bisa dilakukan persona.",
      autoplayHint: "Berganti otomatis \u2014 klik untuk berhenti.",
      browseTemplates: "Jelajahi Semua Templat",
      whatCanAutomate: "Apa yang bisa diotomatiskan Personas",
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
      heading: "Pertanyaan",
      headingGradient: "yang sering diajukan",
      subtitle: "Semua yang perlu Anda ketahui tentang memulai dengan Personas.",
      stillQuestions: "Masih punya pertanyaan?",
      joinDiscord: "Gabung Discord",
      discordSubtitle: "Bergabunglah dengan komunitas Discord kami untuk bantuan dan diskusi.",
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
      heading: "Siap membangun",
      headingGradient: "agen Anda?",
      subtitle: "Unduh Personas gratis. Mulai membangun dalam hitungan menit.",
      downloadInstaller: "Unduh installer",
      downloadFor: "Unduh untuk {platform}",
      joinWaitlist: "Gabung daftar tunggu",
      connectCli: "Hubungkan Claude CLI",
      launchAgent: "Luncurkan agen pertama",
      exploreFirst: "Jelajahi kemampuan dulu",
      requiresCli: "Memerlukan Claude CLI",
      installerSize: "Installer 12 MB",
      noSignupLine: "Tanpa pendaftaran, tanpa kartu kredit. Berjalan di mesin Anda. Nol telemetri.",
      windows: "Windows",
      macos: "macOS",
      linux: "Linux"
    },
    dashboard: {
      title: "Dasbor",
      overview: "Ringkasan",
      agents: "Agen",
      executions: "Eksekusi",
      events: "Event",
      reviews: "Tinjauan",
      observability: "Observabilitas",
      knowledge: "Pengetahuan",
      settings: "Pengaturan",
      leaderboard: "Papan Peringkat",
      director: "Sutradara",
      sla: "SLA",
      incidents: "Insiden",
      health: "Status",
      messages: "Pesan",
      more: "Lainnya",
      greeting: {
        morning: "Selamat Pagi",
        afternoon: "Selamat Siang",
        evening: "Selamat Malam"
      },
      agentsStatus: "Berikut yang terjadi dengan agen Anda",
      lastSeen: "Terakhir dilihat",
      greetingFallback: "teman",
      pendingReviews: "tinjauan tertunda",
      totalExecutions: "total eksekusi",
      successRate: "tingkat keberhasilan",
      activeAgents: "agen aktif",
      recentActivity: "Aktivitas Terbaru",
      running: "berjalan",
      noExecutionsYet: "Belum ada eksekusi.",
      executeToSee: "Jalankan agen untuk melihat aktivitas di sini.",
      trafficErrors: "Trafik & Error",
      last14Days: "14 hari terakhir",
      noTrafficYet: "Belum ada lalu lintas",
      deployed: "dideploy",
      metricsHealth: "Metrik & kesehatan",
      workers: "worker",
      errorBoundary: {
        title: "Panel dashboard gagal dirender",
        description: "Bagian ini mengalami kesalahan tak terduga. Anda dapat mencoba lagi tanpa meninggalkan halaman ini.",
        retry: "Coba lagi",
        errorIdLabel: "Error ID",
        copyErrorId: "Salin error ID",
        copied: "Disalin"
      },
      unreadMessages: "pesan belum dibaca",
      fleetHealth: "kesehatan armada",
      fleet: {
        title: "Optimasi armada",
        severity: {
          urgent: "Mendesak",
          suggested: "Disarankan",
          insight: "Wawasan"
        },
        expand: "Detail",
        collapse: "Sembunyikan",
        dismiss: "Tutup"
      },
      staleness: {
        justNow: "Baru saja",
        secondsAgo: "{n}d lalu",
        minutesAgo: "{n}m lalu",
        hoursAgo: "{n}j lalu",
        daysAgo: "{n}h lalu",
        error: "Gagal memuat"
      },
      scope: {
        allPersonas: "Semua persona",
        personaLabel: "Filter persona",
        compare: "Bandingkan",
        dateRange: {
          last24h: "24j",
          last7d: "7h",
          last30d: "30h",
          last90d: "90h",
          custom: "Kustom"
        }
      },
      home: {
        vitals: {
          runs: "Eksekusi",
          alerts: "Peringatan"
        },
        cockpit: {
          vitalsTitle: "Vital armada",
          vitalsTrend: "Keberhasilan \u00b7 14 hari",
          triageTitle: "Antrean triase",
          triageSubtitle: "Diurutkan berdasarkan urgensi",
          triageEmpty: "Semua aman \u2014 tidak ada yang memerlukan perhatian Anda saat ini.",
          triageKindBreach: "Pelanggaran SLA",
          triageKindIncident: "Insiden",
          triageKindReview: "Tinjauan",
          tickerLabel: "Langsung",
          tickerSuccess: "Keberhasilan armada",
          tickerAgents: "Agen daring",
          tickerProviders: "Penyedia",
          tickerNextRoutine: "Rutinitas berikutnya",
          tickerAlerts: "Peringatan terbuka",
          tickerAllClear: "Semua aman",
          instrumentsTitle: "Instrumen",
          tickerPause: "Jeda tiker status",
          tickerResume: "Lanjutkan tiker status"
        },
        fleetSessions: {
          title: "Sesi armada",
          needsYou: "{count} menunggu Anda",
          athenaOnIt: "Athena menanganinya",
          states: {
            working: "Bekerja",
            needsYou: "Butuh Anda",
            finished: "Selesai",
            frozen: "Beku"
          }
        },
        approvedWork: {
          title: "Pekerjaan disetujui",
          summary: "{undispatched} dari {total} ide yang disetujui tidak pernah menjadi tugas",
          stale: "{count} menunggu lebih dari {days} hari",
          neverDispatched: "Tidak pernah dikirim",
          dispatched: "Terkirim",
          dispatch: "Kirim",
          sendAll: "Kirim ke armada ({count})",
          toast: "{count} terkirim \u2014 Armada",
          empty: "Tidak ada yang menunggu dikirim"
        },
        heatmap: {
          title: "Aktivitas eksekusi",
          subtitle: "Eksekusi per agen \u00b7 7 hari terakhir",
          less: "Sedikit",
          more: "Banyak",
          empty: "Belum ada eksekusi."
        },
        medals: {
          first: "ke-1",
          second: "ke-2",
          third: "ke-3"
        },
        errors: {
          topPerformers: "Gagal memuat performa terbaik",
          routines: "Gagal memuat rutinitas",
          executions: "Gagal memuat eksekusi"
        },
        topPerformers: {
          title: "Performa terbaik"
        },
        upcomingRoutines: {
          title: "Rutinitas mendatang",
          subtitle: "Eksekusi terjadwal berikutnya",
          empty: "Tidak ada rutinitas terjadwal.",
          triggers: {
            schedule: "Jadwal",
            polling: "Polling",
            webhook: "Webhook",
            event: "Peristiwa"
          }
        },
        vaultChanges: {
          title: "Brankas kredensial",
          subtitle: "Perubahan terbaru",
          empty: "Tidak ada perubahan terbaru.",
          actions: {
            rotated: "Dirotasi",
            added: "Ditambahkan",
            revoked: "Dicabut",
            synced: "Disinkronkan"
          }
        }
      }
    },
    dashboardUi: {
      status: {
        queued: "Dalam antrean",
        running: "Berjalan",
        completed: "Selesai",
        processed: "Diproses",
        failed: "Gagal",
        cancelled: "Dibatalkan",
        pending: "Menunggu",
        approved: "Disetujui",
        rejected: "Ditolak"
      },
      testFlow: "Uji Alur",
      eventTypes: "Jenis Event",
      stdout: "stdout",
      jumpToLatest: "Lompat ke terbaru",
      loadMoreExecutions: "Muat lebih banyak eksekusi ({visible}/{total})",
      cancelling: "Membatalkan...",
      cancelQueuedRun: "Batalkan run dalam antrean",
      conflict: "Konflik",
      manualReviews: "Tinjauan Manual",
      manualReviewsSubtitle: "Tinjau dan setujui keputusan agent yang memerlukan pengawasan manusia",
      content: "Konten",
      selectReview: "Pilih tinjauan",
      selectReviewDesc: "Pilih tinjauan dari daftar untuk melihat detail dan mengambil tindakan",
      navigate: "navigasi",
      execution: "Eksekusi",
      reviewerNotes: "Catatan Peninjau",
      notesPlaceholder: "Tambahkan catatan opsional sebelum menyelesaikan...",
      selected: "dipilih",
      selectReviewsBulk: "Pilih tinjauan untuk tindakan massal",
      noReviewsInFilter: "Tidak ada tinjauan dalam filter ini",
      refreshing: "Menyegarkan...",
      rejectSelectedTitle: "Tolak tinjauan yang dipilih?",
      rejectSelectedBody: "Ini akan menolak {count} tinjauan{plural} yang dipilih. Anda memiliki 5 detik untuk membatalkan tindakan ini.",
      undo: "Urungkan",
      retry: "Coba lagi",
      bulkFailedApprove: "{failed} dari {total} gagal disetujui",
      bulkFailedReject: "{failed} dari {total} gagal ditolak",
      bulkSucceededReselected: "{count} berhasil \u00b7 item yang gagal dipilih ulang",
      allShortcuts: "Semua pintasan",
      keyboardShortcuts: "Pintasan keyboard",
      searchShortcuts: "Cari pintasan...",
      noShortcutsMatch: "Tidak ada pintasan yang cocok dengan \"{query}\"",
      failedAgentDetails: "Gagal memuat detail agent",
      retryAgentDetails: "Coba lagi",
      recentExecutions: "Eksekusi Terbaru",
      noExecutionsYet: "Belum ada eksekusi",
      subscription: "langganan",
      subscriptions: "langganan",
      trigger: "trigger",
      triggers: "trigger",
      closeAgentDetails: "Tutup detail agent",
      metricConcurrency: "Konkurensi",
      metricTimeout: "Batas waktu",
      metricBudget: "Anggaran",
      metricConcurrencyTitle: "Hingga {n} eksekusi bersamaan",
      metricTimeoutTitle: "Batas waktu eksekusi: {n} detik",
      metricBudgetTitle: "Batas anggaran: {n} per eksekusi",
      sessionVerifyFailed: "Tidak dapat memverifikasi sesi Anda",
      sessionHelp: "Jika ini terus terjadi, periksa jaringan Anda atau pemblokir iklan apa pun.",
      devModeMock: "Mode Pengembangan - menggunakan data mock",
      signInTitlePrefix: "Masuk ke",
      signInTitleDashboard: "Dashboard",
      devSignInDesc: "Klik di bawah untuk masuk ke dashboard dengan data contoh dan menjelajahi UI.",
      prodSignInDesc: "Pantau agent cloud Anda, tinjau eksekusi, dan kelola event dari satu tempat.",
      signingIn: "Sedang masuk...",
      enterDemoDashboard: "Masuk ke Dashboard Demo",
      continueWithGoogle: "Lanjutkan dengan Google",
      tryDemo: "Coba Demo",
      devNoAuth: "Tidak diperlukan autentikasi dalam mode pengembangan",
      securedBySupabase: "Diamankan oleh Autentikasi Supabase",
      errorBoundaryFallback: "Tampilan ini terus gagal. Silakan segarkan halaman atau hubungi dukungan dengan error ID di atas.",
      brandName: "Personas",
      connected: "Terhubung",
      weekAbbr: "m",
      disconnected: "Terputus",
      totalLabel: "Total",
      agent: "Agent",
      connections: "Koneksi",
      eventAnimationPaused: "Animasi alur event dijeda (gerakan berkurang)",
      node: "node",
      eventBus: "Event Bus",
      eventType: "Jenis Event",
      timestamp: "Timestamp",
      trafficVolume: "Volume Lalu Lintas",
      samplePayload: "Contoh Payload",
      systemHealth: "Kesehatan Sistem",
      health: "Kesehatan",
      memoryInsights: "Wawasan Memori",
      suggestion: "saran",
      suggestions: "saran",
      dismissAction: "Tutup: {title}",
      allSuggestionsDismissed: "Semua saran telah ditutup. Periksa lagi nanti.",
      noDataAvailable: "Belum ada data tersedia",
      errors: "Kesalahan",
      totalLower: "total",
      copyPayload: "Salin payload"
    },
    memoriesPage: {
      title: "Memori",
      subtitle: "Pola yang dipelajari dan diterapkan otomatis oleh agen Anda",
      totalCount: "{n} memori",
      filters: {
        all: "Semua",
        throttle: "Throttle",
        schedule: "Jadwal",
        alert: "Peringatan",
        config: "Konfigurasi",
        routing: "Routing"
      },
      status: {
        active: "Aktif",
        pending: "Menunggu",
        archived: "Diarsipkan"
      },
      uses: "{n} penggunaan",
      empty: "Tidak ada memori yang cocok dengan filter ini",
      seeAll: "Lihat semua",
      conflicts: {
        count: "{n} konflik",
        resolveButton: "Selesaikan konflik",
        modalTitle: "Selesaikan {n} konflik",
        modalSubtitle: "Terima atau tolak masing-masing untuk menjaga konsistensi penyimpanan memori Anda.",
        accept: "Terima",
        reject: "Tolak",
        cancel: "Batal",
        apply: "Terapkan",
        allResolved: "Semua konflik terselesaikan",
        discardTitle: "Buang keputusan Anda?",
        discardBody: "Anda telah mengklasifikasikan {n} konflik. Menutup sekarang akan membuang semuanya tanpa menerapkannya.",
        discardConfirm: "Buang",
        discardKeep: "Tetap edit"
      }
    },
    knowledgePage: {
      viewSwitcherLabel: "Tampilan pengetahuan",
      title: "Graf Pengetahuan",
      subtitle: "Pola yang dipelajari dari eksekusi agen",
      denseTable: "Tabel Padat",
      graph: "Graf",
      memories: "Memori",
      type: "Jenis",
      patternKey: "Kunci pola",
      agent: "Agen",
      success: "Berhasil",
      successLower: "berhasil",
      failures: "Kegagalan",
      failuresLower: "kegagalan",
      fails: "Gagal",
      rate: "Rasio",
      rateLower: "rasio",
      cost: "Biaya",
      tokens: "Token",
      retries: "Coba ulang",
      duration: "Durasi",
      confidence: "Keyakinan",
      lastSeen: "Terakhir terlihat",
      nodes: "Node",
      agents: "Agen",
      clusters: "Klaster",
      avgConfidence: "Keyakinan rata-rata",
      all: "Semua",
      agentLinks: "Tautan agen",
      nodeSize: "Ukuran node",
      confidenceLegend: "= keyakinan",
      low: "rendah",
      high: "tinggi",
      patterns: "Pola",
      avgCost: "Biaya rata-rata",
      clear: "Hapus",
      noPatterns: "Tidak ada pola yang cocok dengan filter saat ini",
      types: {
        tool_sequence: "Urutan alat",
        failure_pattern: "Pola kegagalan",
        cost_quality: "Biaya / kualitas",
        model_performance: "Performa model",
        data_flow: "Alur data"
      }
    },
    reviewsPage: {
      selectReview: "Pilih tinjauan",
      selectAllPending: "Pilih semua tinjauan tertunda",
      focus: {
        enter: "Mode fokus",
        exit: "Keluar",
        volume: "Volume",
        skipTo: "Lompat ke",
        chapterHome: "Beranda",
        progress: "{n} dari {total}",
        skip: "Lewati",
        empty: "Semua sudah selesai \u2014 tidak ada tinjauan tertunda",
        approve: "Setujui",
        reject: "Tolak"
      },
      parseError: {
        label: "Kesalahan parsing",
        detail: "Payload tidak valid \u2014 dieskalasi menjadi kritis hingga ditinjau"
      }
    },
    leaderboardPage: {
      title: "Papan Peringkat",
      subtitle: "Peringkat armada berdasarkan kinerja komposit",
      rank: "Peringkat",
      composite: "Komposit",
      delta: "Perubahan",
      sortBy: "Urutkan berdasarkan {field}",
      compare: "Bandingkan",
      versus: "vs",
      radarTitle: "Profil metrik",
      rankBy: "Urutkan menurut",
      overall: "Keseluruhan",
      metrics: {
        reliability: "Keandalan",
        cost: "Biaya",
        tokens: "Token",
        retries: "Coba ulang",
        speed: "Kecepatan",
        quality: "Kualitas",
        volume: "Volume",
        skipTo: "Lompat ke",
        chapterHome: "Beranda"
      },
      trend: {
        up: "Naik",
        down: "Turun",
        flat: "Stabil"
      }
    },
    directorPage: {
      title: "Sutradara",
      subtitle: "Pusat komando pembinaan untuk agen berbintang Anda",
      periodLabel: "{n} hari terakhir",
      kpi: {
        valueRate: "Nilai tersampaikan",
        valueRateHint: "Eksekusi armada yang menyampaikan nilai",
        avgVerdict: "Rata-rata vonis",
        avgVerdictHint: "Rata-rata skor terbaru dari agen yang ditinjau",
        costPerValue: "Biaya / nilai",
        costPerValueHint: "Pengeluaran per eksekusi yang menyampaikan nilai",
        inScope: "Dalam cakupan",
        inScopeHint: "{reviewed} ditinjau \u00b7 {unreviewed} menunggu"
      },
      momentum: {
        label: "Momentum",
        improving: "membaik",
        flat: "datar",
        declining: "menurun",
        steady: "Tetap stabil"
      },
      breakdown: {
        title: "Rincian nilai",
        empty: "Belum ada eksekusi yang dinilai pada periode ini",
        bands: {
          delivered: "Tersampaikan",
          partial: "Sebagian",
          blocked: "Terblokir",
          noInput: "Tanpa input",
          unassessed: "Belum dinilai"
        }
      },
      distribution: {
        title: "Distribusi skor",
        avgLabel: "rata-rata",
        empty: "Belum ada agen yang diberi skor",
        agents: "{count} agen"
      },
      coaching: {
        title: "Cakupan pembinaan",
        agent: "Agen",
        latest: "Terbaru",
        trend: "Tren",
        value: "Nilai",
        attention: "Perhatian",
        lastReview: "Tinjauan terakhir",
        never: "Tidak pernah",
        healthy: "Semua agen dalam cakupan sehat",
        filterEmpty: "Tidak ada agen yang cocok dengan filter ini",
        clearFilter: "Hapus filter",
        flags: {
          needsReview: "Baru",
          low: "Rendah",
          declining: "Menurun",
          stale: "Usang"
        },
        flagHints: {
          needsReview: "Dalam cakupan tetapi belum pernah diberi skor \u2014 jalankan Sutradara untuk mendapatkan garis dasar.",
          low: "Vonis terakhir 2 atau kurang \u2014 agen ini butuh pembinaan.",
          declining: "Skor terbaru turun dari tinjauan sebelumnya.",
          stale: "Tinjauan terakhir lebih dari dua minggu lalu \u2014 periksa apakah mereka masih layak."
        }
      },
      verdictFeed: {
        title: "Vonis pembinaan terbaru",
        empty: "Belum ada vonis \u2014 jalankan tinjauan untuk melihat pembinaan di sini",
        categories: {
          prompt: "Prompt",
          health: "Kesehatan",
          triggers: "Pemicu",
          credentials: "Kredensial",
          memory: "Memori",
          usefulness: "Kegunaan"
        }
      }
    },
    slaPage: {
      title: "SLA",
      subtitle: "Sasaran tingkat layanan, kepatuhan, dan riwayat pelanggaran",
      compliance: "Kepatuhan",
      activeBreaches: "Pelanggaran aktif",
      objectives: "Objektif",
      target: "Target",
      current: "Saat ini",
      timeInSla: "Waktu dalam SLA",
      targetFilter: {
        all: "Semua",
        atRisk: "Berisiko",
        healthy: "Sehat"
      },
      metricType: {
        availability: "Ketersediaan",
        latency: "Latensi p95",
        successRate: "Tingkat keberhasilan"
      },
      severity: {
        minor: "Ringan",
        major: "Berat",
        critical: "Kritis"
      },
      breachLog: {
        title: "Log pelanggaran",
        all: "Semua",
        started: "Mulai",
        resolved: "Selesai",
        otherBreaches: "Pelanggaran lain oleh {persona}: {n}",
        timeToResolve: "Waktu penyelesaian",
        elapsed: "Berlalu",
        empty: "Tidak ada pelanggaran dalam 7 hari terakhir.",
        ongoing: "Sedang berlangsung",
        duration: "{n} menit"
      }
    },
    incidentsPage: {
      title: "Insiden",
      subtitle: "Insiden log audit di seluruh armada",
      open: "Terbuka",
      total: "Total",
      bySeverity: "Berdasarkan tingkat keparahan",
      bySource: "Berdasarkan sumber",
      incidents: "insiden",
      groupByLabel: "Kelompokkan menurut",
      clearFilters: "Hapus filter",
      allPersonas: "Semua persona",
      statusLabel: "Status",
      severity: {
        critical: "Kritis",
        high: "Tinggi",
        medium: "Sedang",
        low: "Rendah"
      },
      status: {
        all: "Semua",
        open: "Terbuka",
        resolved: "Selesai",
        ignored: "Diabaikan",
        escalated: "Dieskalasi"
      },
      source: {
        all: "Semua sumber",
        executions: "Eksekusi",
        events: "Peristiwa",
        triggers: "Pemicu",
        vault: "Brankas",
        messages: "Pesan",
        reviews: "Tinjauan"
      },
      groupBy: {
        none: "Tidak ada",
        agent: "Agen",
        severity: "Tingkat keparahan",
        source: "Sumber"
      },
      badges: {
        circuitBreaker: "Pemutus sirkuit",
        autoFixed: "Diperbaiki otomatis"
      },
      detail: {
        recommendation: "Tindakan yang disarankan",
        source: "Sumber",
        category: "Kategori",
        persona: "Agen",
        detected: "Terdeteksi",
        resolved: "Selesai",
        ongoing: "Berlangsung"
      },
      empty: {
        title: "Tidak ada insiden",
        description: "Armada sehat \u2014 tidak ada insiden audit yang tercatat.",
        filteredTitle: "Tidak ada insiden yang cocok",
        filteredDescription: "Tidak ada insiden yang cocok dengan filter saat ini."
      }
    },
    healthPage: {
      title: "Status sistem",
      subtitle: "Runtime, layanan, sumber daya, dan integrasi",
      sections: {
        runtime: "Runtime",
        services: "Layanan",
        resources: "Sumber daya",
        integrations: "Integrasi"
      },
      status: {
        ok: "Sehat",
        warn: "Peringatan",
        error: "Kesalahan",
        info: "Info"
      },
      diskUsage: "Penggunaan disk",
      used: "terpakai",
      free: "bebas",
      actions: {
        install: "Pasang",
        configure: "Konfigurasikan"
      },
      toast: {
        configured: "dikonfigurasi (demo)",
        installed: "diaktifkan (demo)"
      }
    },
    messagesPage: {
      title: "Pesan",
      subtitle: "Umpan balik asinkron dari setiap persona di armada",
      unread: "Belum dibaca",
      read: "Dibaca",
      empty: "Tidak ada pesan di halaman ini.",
      expand: "Tampilkan payload",
      collapse: "Sembunyikan payload",
      pagination: {
        prev: "Sebelumnya",
        next: "Berikutnya",
        page: "Halaman {n} dari {total}"
      },
      markAllRead: "Tandai semua dibaca",
      viewThreads: "Utas",
      viewList: "Daftar",
      reply: "Balasan"
    },
    observabilityPage: {
      usageInsight: "{top} digunakan {ratio}x lebih sering daripada {second}, menjadikannya integrasi alat yang paling banyak Anda gunakan.",
      title: "Observabilitas",
      subtitle: "Metrik kinerja, pelacakan biaya, dan pemanfaatan alat",
      tabPerformance: "Kinerja",
      tabUsage: "Penggunaan Alat",
      tabActivity: "Aktivitas",
      circuitBreaker: "Circuit breaker",
      autoFixed: "Diperbaiki otomatis",
      resolved: "Selesai",
      autoFixApplied: "Perbaikan otomatis diterapkan",
      costAnomalyDetected: "Anomali biaya terdeteksi pada",
      budgetThresholdExceeded: "Ambang anggaran terlampaui untuk",
      totalCost: "Total biaya",
      executions: "Eksekusi",
      successRate: "Tingkat sukses",
      activePersonas: "Persona aktif",
      costOverTime: "Biaya dari waktu ke waktu",
      previousPeriod: "vs periode sebelumnya",
      executionHealth: "Kesehatan eksekusi",
      latencyDistribution: "Distribusi latensi",
      latencyPercentiles: "P50 / P95 / P99",
      spendByAgent: "Belanja per agen",
      noSpendData: "Tidak ada data belanja",
      healthIssues: "Masalah kesehatan",
      open: "terbuka",
      analyzing: "Menganalisis...",
      runAnalysis: "Jalankan analisis",
      runningAnalysis: "Menjalankan analisis kesehatan di semua layanan yang dipantau...",
      allSystemsHealthy: "Semua sistem sehat",
      noIssuesDetected: "Tidak ada masalah terdeteksi di layanan yang dipantau",
      noSeverityIssues: "Tidak ada masalah tingkat {severity}",
      exampleDataNotice: "Menampilkan data contoh. Analitik nyata akan muncul setelah agen mulai menjalankan eksekusi.",
      toolInvocations: "Pemanggilan alat",
      distribution: "Distribusi",
      usageOverTime: "Penggunaan dari waktu ke waktu",
      last14Days: "14 hari terakhir",
      toolUsageByAgent: "Penggunaan alat per agen",
      other: "Lainnya",
      athenaUsage: "Penggunaan Athena",
      athenaSubtitle: "Biaya Companion per tindakan",
      athenaActions: {
        invoke: "Panggil",
        recall: "Ambil",
        fallback: "Cadangan"
      },
      athenaActionMix: "Biaya per jenis aksi",
      athenaOps: {
        chat: "Obrolan",
        fleetSpawn: "Peluncuran armada",
        canvasControl: "Kontrol kanvas",
        recall: "Pemanggilan ulang",
        proactiveNudge: "Dorongan proaktif",
        execTriage: "Triase eksekusi",
        msgTriage: "Triase pesan",
        reviewResolution: "Penyelesaian tinjauan"
      },
      turnsCount: "{count} giliran",
      athenaSpendLane: "Jalur pengeluaran Athena",
      spendTurns: "Giliran",
      spendCost: "Biaya Athena",
      spendAvgPerTurn: "Rata\u002drata / giliran",
      spendTokens: "Token",
      spendTokensDetail: "{in} masuk · {out} keluar",
      athenaVsFleet: "Athena vs armada",
      athenaVsFleetCaption: "{athena} dari total pengeluaran {total} pada jendela ini",
      valueRollup: "Ringkasan nilai",
      valueDelivered: "Nilai terkirim",
      costPerValue: "Biaya per nilai",
      outcomes: {
        delivered: "Terkirim",
        partial: "Sebagian",
        blocked: "Terblokir"
      },
      severity: {
        all: "semua",
        critical: "kritis",
        high: "tinggi",
        medium: "sedang",
        low: "rendah"
      }
    },
    agentsPage: {
      statusLive: "Aktif",
      statusOff: "Mati",
      title: "Agen",
      noAgents: "Tidak ada agen yang dideploy",
      noAgentsDesc: "Deploy agen pertama Anda dari aplikasi desktop Personas, lalu kembali ke sini untuk memantaunya.",
      agentDeployed: "agen dideploy",
      agentsDeployed: "agen dideploy",
      manualExecution: "Eksekusi manual dari dasbor",
      maxConcurrent: "maks",
      timeoutSeconds: "timeout {n}d",
      budget: "anggaran",
      execute: "Jalankan",
      executing: "Menjalankan\u2026",
      executeQueued: "Eksekusi diantrekan untuk {name}",
      executeFailed: "Tidak dapat memulai {name}",
      details: "Detail"
    },
    executionsPage: {
      title: "Eksekusi",
      all: "Semua",
      active: "Aktif",
      completed: "Selesai",
      failed: "Gagal",
      cancelled: "Dibatalkan",
      agent: "Agen",
      duration: "Durasi",
      cost: "Biaya",
      tokens: "Token",
      retries: "Coba ulang",
      started: "Dimulai",
      noExecutions: "Belum ada eksekusi",
      noExecutionsDesc: "Jalankan agen untuk melihat hasil di sini",
      waitingForWorker: "Menunggu worker...",
      noOutputYet: "Belum ada output",
      noFilteredActive: "Tidak ada eksekusi aktif dalam tampilan ini",
      noFilteredCompleted: "Tidak ada eksekusi selesai dalam tampilan ini",
      noFilteredFailed: "Tidak ada eksekusi gagal dalam tampilan ini",
      noFilteredCancelled: "Tidak ada eksekusi dibatalkan dalam tampilan ini",
      filteredEmptyDesc: "Ada eksekusi lain, tetapi tidak ada yang cocok dengan filter ini.",
      showAllExecutions: "Tampilkan semua"
    },
    eventsPage: {
      title: "Event",
      subtitle: "Aktivitas event bus di semua agen",
      tabEvents: "Event",
      tabSubscriptions: "Langganan",
      tabVisualization: "Visualisasi",
      tabSwimlane: "Linimasa",
      event: "Event",
      source: "Sumber",
      time: "Waktu",
      id: "ID",
      sourceLabel: "Sumber",
      processed: "Diproses",
      retry: "Coba lagi",
      selectForBulkRetry: "Pilih untuk coba lagi massal",
      showRelatedEvents: "Tampilkan {count} event terkait",
      retriedCount: "Dicoba ulang {count} kali",
      retryEvent: "Coba lagi event",
      searchPlaceholder: "Cari payload, tipe event, sumber, kesalahan...",
      clearSearch: "Hapus pencarian",
      eventType: "Tipe event",
      sourceType: "Tipe sumber",
      clearFilters: "Hapus filter",
      chain: "Rantai",
      events: "event",
      result: "hasil",
      results: "hasil",
      noDeadLetters: "Tidak ada dead letter",
      noDeadLettersDescription: "Event gagal dengan kesalahan akan muncul di sini untuk dicoba lagi",
      noMatchingEvents: "Tidak ada event yang cocok",
      noEvents: "Tidak ada event",
      noMatchingEventsDescription: "Coba sesuaikan pencarian atau filter Anda",
      noEventsDescription: "Event akan muncul di sini saat agen memproses pemicu dan langganan",
      loadMore: "Muat lebih banyak event",
      failedEventSelected: "event gagal dipilih",
      failedEventsSelected: "event gagal dipilih",
      selectAllFailed: "Pilih semua yang gagal",
      retryAll: "Coba Lagi Semua",
      active: "Aktif",
      disabled: "Dinonaktifkan",
      created: "Dibuat",
      match: "cocok",
      matches: "cocok",
      deleteSubscription: "Hapus langganan",
      unknownAgent: "Agen tidak dikenal",
      disableSubscription: "Nonaktifkan langganan",
      enableSubscription: "Aktifkan langganan",
      createSubscription: "Buat Langganan",
      persona: "Persona",
      selectPersona: "Pilih persona...",
      selectEventType: "Pilih tipe event...",
      sourceFilter: "Filter Sumber",
      optional: "opsional",
      sourceFilterPlaceholder: "mis. github, pagerduty...",
      create: "Buat",
      newSubscription: "Langganan Baru",
      noMatchingSubscriptions: "Tidak ada langganan yang cocok",
      noSubscriptions: "Tidak ada langganan",
      noSubscriptionsDescription: "Buat langganan untuk merutekan event ke agen Anda",
      swimlane: {
        title: "Jalur event",
        subtitle: "Jejak event per persona berurutan waktu",
        empty: "Tidak ada event dalam jendela yang dipilih"
      },
      connectionStatus: {
        connected: "Real-time: terhubung",
        reconnecting: "Menghubungkan ulang ke aliran event\u2026",
        polling: "Polling pembaruan (tertunda)"
      }
    },
    settingsPage: {
      title: "Pengaturan",
      subtitle: "Konfigurasi akun dan koneksi cloud",
      account: "Akun",
      cloudConnection: "Koneksi Cloud",
      orchestrator: "Orchestrator",
      notConfigured: "Belum dikonfigurasi",
      totalWorkers: "Total Worker",
      queueLength: "Panjang Antrian",
      activeExecutions: "Eksekusi Aktif",
      notifications: {
        title: "Notifikasi",
        subtitle: "Peringatan penyembuhan otomatis dan ringkasan",
        weeklyDigest: "Ringkasan kesehatan mingguan",
        voice: {
          label: "Umumkan ulasan baru dengan suara",
          preview: "Pratinjau",
          newReviewRequest: "Permintaan ulasan baru",
          announcement: "Ulasan {severity} baru dari {persona}",
          unknownPersona: "seorang agen",
          severity: {
            critical: "kritis",
            warning: "peringatan",
            info: "info"
          }
        },
        severity: {
          critical: "Kritis",
          high: "Tinggi",
          medium: "Sedang",
          low: "Rendah"
        }
      },
      providers: {
        title: "Penyedia model",
        subtitle: "Model mana yang boleh dipakai agen Anda",
        allowed: "Diizinkan",
        requests: "permintaan"
      },
      rotation: {
        title: "Rotasi kredensial",
        subtitle: "Status rotasi brankas",
        hasPolicy: "Kebijakan",
        noPolicy: "Tanpa kebijakan",
        auto: "Otomatis",
        manual: "Manual",
        anomaly: "Anomali",
        next: "Berikutnya",
        overdue: "Terlambat"
      }
    },
    legalPage: {
      title: "Hukum",
      heading: "Halaman hukum segera hadir",
      description: "Kebijakan privasi dan ketentuan layanan kami sedang diselesaikan. Sementara itu, jika Anda memiliki pertanyaan silakan hubungi kami."
    },
    waitlist: {
      title: "Personas untuk {platform}",
      emailPlaceholder: "Masukkan email Anda",
      earlyBeta: "Saya ingin akses beta awal",
      earlyBetaHint: "Dapatkan akses ke build tidak stabil sebelum rilis publik",
      joining: "Bergabung...",
      success: "Anda ada di daftar!",
      duplicate: "Sudah terdaftar",
      joinCount: "Bergabunglah dengan {count} orang yang menunggu {platform}",
      spotSaved: "Tempat Anda untuk {platform} telah disimpan.",
      spotAlreadySaved: "Tempat Anda untuk {platform} sudah tersimpan sebelumnya.",
      betaFlagged: "Anda memilih beta awal, jadi entri Anda ditandai untuk gelombang build pertama.",
      emailUseOnly: "Alamat Anda hanya dipakai untuk mengukur daftar tunggu - kami tidak mengirim email pemasaran.",
      announceWhere: "Ketersediaan beta diumumkan di {link} dan di GitHub - pantau salah satunya.",
      roadmapLink: "peta jalan publik",
      share: "Bagikan ke teman",
      manualCopy: "Tidak bisa menyalin otomatis - salin tautan ini",
      invalidEmail: "Masukkan alamat email yang valid",
      errorTimeout: "Permintaan habis waktu - silakan coba lagi",
      errorRateLimited: "Terlalu banyak percobaan - tunggu satu menit lalu coba lagi.",
      errorInvalidPlatform: "Platform itu belum didukung.",
      errorRetryable: "Tempat Anda belum bisa disimpan sekarang - coba lagi sebentar.",
      copied: "Disalin!",
      errorGeneric: "Terjadi kesalahan. Silakan coba lagi."
    },
    templatesPage: {
      title: "Templat Agen",
      subtitle: "Jelajahi {count} templat agen siap pakai yang dikelompokkan berdasarkan jenis pekerjaan. Pilih kategori untuk melihat templat di dalamnya.",
      gridHeading: "Jelajahi templat berdasarkan kategori",
      gridDescription: "Template adalah Personas yang telah dikonfigurasi sebelumnya dan dapat Anda gunakan dengan satu klik. Setiap template sudah memiliki prompt, tools, dan trigger yang siap untuk tugas tertentu \u2014 tanpa perlu pengaturan.",
      changeCategory: "Ganti kategori",
      complexityAll: "Semua",
      complexityBasic: "Dasar",
      complexityProfessional: "Profesional",
      complexityEnterprise: "Enterprise",
      searchPlaceholder: "Cari templat, alat, layanan...",
      searchAriaLabel: "Cari templat",
      showingCount: "Menampilkan {shown} dari {total} templat",
      noMatches: "Tidak ada templat yang cocok dengan filter Anda",
      clearFilters: "Hapus filter",
      viewDetails: "Lihat detail",
      filterByComplexity: "Filter berdasarkan kompleksitas",
      backToTemplates: "Kembali ke template",
      keyBenefits: "Manfaat utama",
      triggers: "Pemicu",
      services: "Layanan",
      configuration: "Konfigurasi",
      copied: "Disalin",
      copy: "Salin",
      copyFailed: "Gagal menyalin",
      copyConfiguration: "Salin konfigurasi",
      getStartedTitle: "Mulai dengan template ini",
      getStartedDescription: "Impor template ini langsung ke Personas, atau salin konfigurasinya untuk Anda sesuaikan sendiri.",
      openInPersonas: "Buka di Personas",
      moreTemplates: "Template {category} lainnya",
      appNotFoundTitle: "Aplikasi Personas tidak ditemukan",
      appNotFoundDescription: "Sepertinya Personas belum terpasang di perangkat Anda. Unduh untuk mengimpor template langsung, atau salin konfigurasi untuk menyiapkannya secara manual.",
      templateNotFound: "Template tidak ditemukan",
      templateNotFoundDescription: "Template ini tidak ada atau telah dihentikan. Jelajahi galeri untuk koleksi terbaru.",
      browseTemplates: "Jelajahi template",
      backToHome: "Kembali ke beranda",
      customTrigger: "Pemicu kustom"
    },
    roadmapSection: {
      inProgress: "Sedang Berjalan",
      next: "Selanjutnya",
      planned: "Direncanakan",
      completed: "Selesai",
      empty: "Belum ada yang direncanakan saat ini.",
      emptyHint: "Periksa lagi nanti \u2014 milestone berikutnya akan muncul di sini seiring kami merencanakannya.",
      heading: "Peta Jalan",
      gradient: "Produk",
      description: "Di mana setiap area Personas berada hari ini \u2014 pemenuhan dari kiri ke kanan, bukan janji dari atas ke bawah.",
      progress: {
        phasesComplete: "{completed} dari {total} fase selesai",
        noneDone: "Belum ada fase yang selesai",
        firstDone: "Fase 1 selesai",
        rangeDone: "Fase 1-{count} selesai",
        toGoOne: "{count} fase lagi",
        toGoOther: "{count} fase lagi"
      },
      areas: {
        i18n: {
          title: "Internasionalisasi",
          caption: "{count} bahasa, diterjemahkan manual \u2014 setiap bendera berkembang seiring cakupan"
        },
        devices: {
          title: "Dukungan Perangkat",
          caption: "Personas di setiap perangkat yang Anda miliki"
        },
        collaboration: {
          title: "Kolaborasi",
          caption: "Dari satu operator hingga seluruh organisasi"
        },
        platform: {
          title: "Platform Inti",
          caption: "Mode dev, eksekusi cloud, konektor, instalasi tanpa repot"
        },
        templates: {
          title: "Galeri Templat",
          caption: "Agen awal menurut kategori \u2014 jumlah galeri langsung"
        }
      },
      bars: {
        europe: "Eropa",
        asiaPacific: "Asia-Pasifik",
        southAsia: "Asia Selatan",
        middleEast: "Timur Tengah \u00b7 RTL",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        web: "Web",
        mobileCompanion: "Pendamping seluler",
        solo: "Perorangan",
        team: "Tim",
        enterprise: "Perusahaan",
        devMode: "Mode dev",
        connectors: "Konektor",
        cloudExecution: "Eksekusi cloud",
        installersUpdates: "Penginstal & pembaruan",
        allCategories: "Semua kategori",
        devops: "DevOps",
        productivity: "Produktivitas",
        communication: "Komunikasi",
        marketing: "Pemasaran",
        research: "Riset",
        security: "Keamanan",
        financeCluster: "Keuangan \u00b7 Penjualan \u00b7 Dukungan \u00b7 Legal"
      },
      detail: {
        localeOne: "{n} bahasa",
        localeOther: "{n} bahasa",
        shipped: "dirilis",
        inDevelopment: "dalam pengembangan",
        thisSite: "situs ini",
        preview: "pratinjau",
        sharedAgents: "agen bersama",
        ssoAudit: "SSO \u00b7 audit",
        instantPreview: "pratinjau instan",
        services: "{n} layanan",
        runs247: "operasi 24/7",
        autoUpdate: "pembaruan otomatis",
        templatesTotal: "{n} / {total} templat"
      },
      barAria: "{label}: {pct}%"
    },
    featureVoting: {
      eyebrow: "Komunitas",
      heading: "Pilih",
      headingGradient: "fitur berikutnya",
      subheading: "Bantu kami menentukan prioritas. Pilih fitur yang paling penting bagi Anda dan bentuk masa depan Personas.",
      features: {
        macos: {
          title: "Dukungan macOS",
          description: "Build macOS native sepenuhnya dengan optimasi Apple Silicon, integrasi Spotlight, dan kontrol agen dari menu bar."
        },
        i18n: {
          title: "Internasionalisasi",
          description: "Instruksi agen multibahasa, antarmuka terlokalisasi, dan penjadwalan yang sadar wilayah untuk tim di seluruh dunia."
        },
        dashboard: {
          title: "Dasbor Web",
          description: "Dasbor berbasis browser untuk pemantauan agen real-time, riwayat eksekusi, dan manajemen armada dari perangkat apa pun."
        },
        enterprise: {
          title: "Proyek Enterprise",
          description: "Ruang kerja multi-tenant, RBAC, log audit, integrasi SSO, dan templat agen bersama di seluruh organisasi Anda."
        }
      },
      voteAria: "Pilih {feature}",
      commentsToggleAria: "Tampilkan komentar untuk {feature}",
      discussion: "Diskusi",
      noComments: "Belum ada komentar. Jadilah yang pertama berbagi pendapat.",
      replying: "Membalas",
      reply: "Balas",
      addCommentPlaceholder: "Tambahkan komentar...",
      writeReplyPlaceholder: "Tulis balasan...",
      sendCommentAria: "Kirim komentar",
      summary: {
        totalVotes: "{count} total suara",
        commentOne: "{count} komentar",
        commentOther: "{count} komentar",
        boostOne: "{count} boost",
        boostOther: "{count} boost",
        live: "Langsung"
      },
      boost: {
        label: "Boost",
        toggleAria: "Boost {feature}",
        tierAria: "Boost dengan {amount}"
      },
      request: {
        title: "Ada ide lain?",
        subtitle: "Sarankan fitur",
        placeholder: "Jelaskan fitur yang ingin Anda lihat...",
        submitAria: "Kirim saran",
        success: "Terima kasih! Saran Anda telah dicatat.",
        errorNetwork: "Kesalahan jaringan \u2014 periksa koneksi Anda dan coba lagi.",
        errorRateLimit: "Anda mengirim saran terlalu cepat. Harap tunggu sebentar.",
        errorInvalid: "Masukkan saran yang valid (1\u20131000 karakter).",
        errorGeneric: "Terjadi kesalahan saat menyimpan saran Anda. Silakan coba lagi.",
        sponsor: "Dukung permintaan ini"
      },
      timeAgo: {
        justNow: "baru saja",
        minutes: "{n} mnt lalu",
        hours: "{n} jam lalu",
        days: "{n} hr lalu"
      }
    },
    eventBusSection: {
      dynamicSwarm: "Swarm Dinamis",
      latencyLanes: "Jalur Latensi",
      ephemeralConnections: "Koneksi efemeral",
      queueDepth: "Kedalaman antrian + throughput"
    },
    guide: {
      title: "Pengguna",
      subtitle: "Semua yang perlu Anda ketahui tentang Personas \u2014 dari agent pertama Anda hingga pipeline multi-agent tingkat lanjut.",
      searchPlaceholder: "Cari 100+ topik...",
      searchAllTopics: "Cari semua topik",
    searchInCategory: "Cari di kategori ini...",
      topics: "topik",
      backToGuide: "Kembali ke Panduan",
      showAllResults: "Tampilkan semua hasil",
      noResults: "Tidak ada topik ditemukan. Coba istilah pencarian lain.",
      stillQuestions: "Masih punya pertanyaan?",
      joinDiscord: "Gabung Discord kami",
      copyAnchor: "Salin tautan ke bagian",
      guideHub: "Pusat panduan",
      categoryNotFound: {
        title: "Kategori panduan tidak ditemukan",
        description: "Kategori itu tidak ada. Lihat semua kategori di pusat panduan."
      },
      topicNotFound: {
        title: "Topik panduan tidak ditemukan",
        description: "Topik ini tidak ada. Gunakan pencarian panduan atau jelajahi pusat panduan untuk menemukan yang Anda butuhkan."
      },
      categories: {
        "getting-started": "Memulai",
        companion: "Pendamping (Athena)",
        "agents-prompts": "Agen & Prompt",
        triggers: "Pemicu & Penjadwalan",
        credentials: "Kredensial & Keamanan",
        pipelines: "Pipeline & Tim",
        testing: "Pengujian & Optimasi",
        memories: "Memori & Pengetahuan",
        monitoring: "Pemantauan & Biaya",
        deployment: "Deployment & Integrasi",
        troubleshooting: "Pemecahan Masalah"
      },
      categoryDescriptions: {
        "getting-started": "Instal Personas, buat agen pertama Anda, dan pelajari dasar-dasarnya dalam waktu kurang dari 10 menit.",
        companion: "Kenali Athena, asisten yang selalu siap. Ketik atau bicara dengannya, biarkan dia menjalankan aplikasi untuk Anda, dan andalkan dia mengingat hal yang penting.",
        credentials: "Hubungkan ke layanan dengan aman. Pahami vault terenkripsi dan bagaimana data Anda tetap terlindungi.",
        "agents-prompts": "Buat, konfigurasikan, dan sempurnakan agen AI Anda. Kuasai mode prompt sederhana dan terstruktur.",
        triggers: "Atur kapan dan bagaimana agent Anda berjalan \u2014 jadwal, webhook, pemantau file, dan lainnya.",
        pipelines: "Hubungkan agen menjadi pipeline visual. Bangun alur kerja multi-agen di kanvas tim.",
        memories: "Agen Anda belajar dan mengingat. Kelola apa yang mereka ketahui dan bagaimana mereka menggunakan pengalaman sebelumnya.",
        monitoring: "Pantau setiap eksekusi secara real time. Lihat apa yang dilakukan agen Anda, seberapa baik kinerjanya, dan berapa biayanya.",
        testing: "Jalankan tes arena, perbandingan A/B, dan biarkan sistem genome mengembangkan prompt terbaik Anda.",
        deployment: "Deploy agen ke cloud, hubungkan ke GitHub Actions, GitLab CI, dan alur kerja n8n.",
        troubleshooting: "Perbaiki masalah umum, pahami pesan error, dan kembalikan agen Anda ke jalur yang benar."
      }
    },
    featurePages: {
      orchestration: {
        headline: "Agen yang bekerja bersama",
        description: "Bangun pipeline visual di mana banyak agent berkolaborasi pada tugas kompleks. Output satu agent menjadi input agent berikutnya \u2014 tanpa kode penghubung, tanpa langkah manual, tanpa batasan pada apa yang bisa Anda orkestrasi.",
        cta: "Bangun pipeline pertama Anda"
      },
      security: {
        headline: "Rahasia Anda tetap milik Anda",
        description: "Setiap kata sandi, API key, dan access token dienkripsi di perangkat Anda menggunakan enkripsi AES-256 setara bank. Kredensial Anda disimpan dalam vault aman milik sistem operasi Anda sendiri \u2014 tidak ada yang pernah dikirim ke cloud.",
        cta: "Amankan koneksi Anda"
      },
      "multi-provider": {
        headline: "Tidak terikat pada satu AI",
        description: "Gunakan Claude, OpenAI, Gemini, atau jalankan model secara lokal dengan Ollama. Beralih antar provider dengan bebas, tetapkan model berbeda untuk agent berbeda, dan jika satu provider mengalami gangguan \u2014 agent Anda otomatis beralih ke provider lain.",
        cta: "Pilih AI Anda"
      },
      genome: {
        headline: "Agen Anda semakin pintar secara otomatis",
        description: "Alih-alih menyesuaikan prompt secara manual selama berjam-jam, biarkan sistem Genome yang melakukannya untuk Anda. Sistem ini menguji berbagai variasi, mempertahankan yang berhasil, dan membuang sisanya \u2014 seperti seleksi alam untuk agent AI Anda.",
        cta: "Evolusikan agen Anda"
      }
    },
    blogPage: {
      eyebrow: "Blog",
      heading: "Pembaruan &",
      headingGradient: "wawasan",
      description: "Pengumuman produk, ulasan teknis mendalam, tutorial, dan contoh penggunaan nyata dari tim Personas.",
      searchPlaceholder: "Cari posting...",
      searchAriaLabel: "Cari posting blog",
      clearSearch: "Hapus pencarian",
      showing: "Menampilkan",
      of: "dari",
      posts: "posting",
      noMatches: "Tidak ada posting yang cocok dengan pencarian Anda",
      clearFilters: "Hapus semua filter",
      allPosts: "Semua posting",
      featured: "Unggulan",
      min: "mnt",
      minRead: "mnt baca",
      read: "Baca",
      readArticle: "Baca artikel",
      article: "Artikel",
      backToBlog: "Kembali ke blog",
      published: "Diterbitkan",
      continueExploring: "Lanjut menjelajah",
      seeItInAction: "Lihat cara kerjanya",
      browseTemplates: "Jelajahi template",
      postNotFound: "Posting blog tidak ditemukan",
      postNotFoundDescription: "Kami tidak dapat menemukan artikel yang Anda cari. Artikel mungkin telah diganti nama atau dipindahkan.",
      browseAllPosts: "Jelajahi semua posting",
      backToHome: "Kembali ke beranda"
    },
    accessibility: {
      changeLanguage: "Ubah bahasa",
      selectLanguage: "Pilih bahasa",
      selectTheme: "Pilih tema: {name}"
    },
    pageNav: {
      onThisPage: "Di halaman ini",
      closeMenu: "Tutup menu",
      landmarkLabel: "Navigasi halaman",
      scrollMap: "Peta halaman"
    },
    themes: {
      midnight: "Tengah Malam",
      cyan: "Sian",
      bronze: "Perunggu",
      frost: "Embun Beku",
      purple: "Ungu",
      pink: "Merah Muda",
      red: "Merah",
      matrix: "Matrix",
      light: "Terang",
      ice: "Es",
      news: "Berita"
    },
    themeDescriptions: {
      midnight: "Tema gelap biru dongker",
      cyan: "Tema gelap aksen teal",
      bronze: "Tema gelap aksen amber hangat",
      frost: "Tema gelap perak sejuk",
      purple: "Tema gelap aksen violet",
      pink: "Tema gelap aksen magenta",
      red: "Tema gelap aksen merah tua",
      matrix: "Tema gelap hijau neon",
      light: "Tema terang klasik",
      ice: "Tema terang biru sejuk",
      news: "Tema terang kontras tinggi"
    },
    tour: {
      launch: "Mulai tur",
      play: "Putar",
      pause: "Jeda",
      next: "Langkah berikutnya",
      previous: "Langkah sebelumnya",
      exit: "Keluar dari tur",
      volume: "Volume",
      skipTo: "Lompat ke",
      chapterHome: "Beranda",
      begin: "Mulai",
      skip: "Lewati",
      introTitle: "Kenali Athena, pemandu Anda",
      introBody: "Athena akan memandu Anda menjelajahi Personas dalam waktu sekitar satu menit \u2014 apa itu persona, cara kerjanya, dan cara memulai. Anda bisa menjeda, melewati, atau memutar ulang langkah mana pun.",
      bridgePrompt: "Itu sekilas tentang Personas. Ingin mendalami lebih jauh dan melihat cara kerja tiap bagian, fitur demi fitur?",
      bridgeConfirm: "Tunjukkan fiturnya",
      bridgeDismiss: "Mungkin nanti",
      bridgeToDashboardPrompt: "Sekarang lihat Personas beraksi \u2014 coba dasbor demo.",
      bridgeToDashboardConfirm: "Buka dasbor",
      step1: "Kenalan dengan persona \u2014 satu agen AI dengan identitas yang stabil dan kumpulan keterampilan yang dapat disusun. Beri ia alat yang dibutuhkan, dari Gmail dan Slack hingga GitHub dan kalender Anda, dan ia belajar bertindak di semuanya. Satu persona, banyak pekerjaan, semuanya bekerja bersama.",
      step2: "Sekarang beri persona itu sebuah tujuan dalam bahasa sehari-hari, misalnya \"tata Gmail saya.\" Saksikan pikirannya bekerja secara langsung: ia membaca permintaan, memecahnya menjadi langkah-langkah, dan merencanakan pendekatannya sebelum menyentuh apa pun. Lalu ia menjalankannya \u2014 dan menunjukkan setiap langkahnya kepada Anda.",
      step3: "Sebuah agen hanya berguna sebatas momen saat ia terbangun. Personas dapat dipicu dengan sepuluh cara \u2014 sesuai jadwal, oleh sebuah peristiwa, dengan polling sebuah sumber, atau dari webhook masuk. Orkestrator mengarahkan setiap sinyal ke agen yang tepat dan menjaga semuanya tetap bergerak, memperbaiki dirinya sendiri jika sebuah langkah gagal.",
      step4: "Semua ini berdiri di atas satu platform yang dibangun untuk kepercayaan dan skala. Brankas terenkripsi menjaga kredensial Anda, templat siap pakai membuat Anda cepat mulai, dan \"bawa model Anda sendiri\" menjaga Anda tetap mengendalikan AI-nya. Pemantauan langsung, lab eksperimen, dan orkestrasi tim melengkapinya \u2014 enam pilar, satu tempat.",
      step5: "Siap mencobanya sendiri? Personas berjalan di komputer Anda sendiri melalui Claude Code \u2014 alat baris perintah dari Anthropic \u2014 jadi Anda tetap privat dan memegang kendali. Unduh penginstal untuk Windows 11, sambungkan CLI, dan agen pertama Anda aktif dalam hitungan menit.",
      features1: "Setiap agen lahir dari satu kalimat niat. Personas membaca apa yang Anda inginkan dan mengisi matriks persona delapan dimensi \u2014 tugas, memori, pemicu, peninjauan, dan lainnya \u2014 serta hanya bertanya saat benar-benar perlu keputusan. Dalam sekejap, ide yang samar menjadi agen yang terstruktur dan siap dijalankan.",
      features2: "Lalu ia mulai belajar. Setiap tugas yang dijalankannya meninggalkan jejak, dan pelajaran yang penting naik ke lapisan memorinya sementara derau mengendap ke bawah. Semakin banyak agen Anda bekerja, semakin tajam dan sadar konteks ia menjadi.",
      features3: "Pekerjaan nyata bisa gagal, jadi Personas dibangun untuk pulih. Ketika sebuah langkah gagal, sirkuit tidak macet \u2014 ia mendiagnosis apa yang salah, memperbaiki jalurnya, dan mencoba lagi sendiri. Tanpa peringatan pukul 3 pagi, tanpa mulai ulang manual; alur kerja terus berjalan.",
      features4: "Dan Anda tak pernah kehilangan jejak apa pun. Setiap eksekusi, pesan, peristiwa, dan memori mengalir langsung melalui satu dek observabilitas \u2014 sparkline, biaya, dan status, semuanya secara real-time. Transparansi penuh, tanpa penyiapan.",
      features5: "Agen hebat jarang benar pada percobaan pertama, jadi Lab adalah tempat Anda menyempurnakannya. Mengobrollah dengan persona untuk melatihnya, adu dua versi di arena, kembangkan lintas generasi, atau beri skor pada dimensi yang penting. Setiap peningkatan yang Anda simpan terversi dan dapat dikembalikan.",
      features6: "Personas hadir dengan enam plugin yang dibuat khusus, masing-masing ruang kerja mandiri yang dapat dijalankan agen Anda. Ambil Dev Tools: ia mengubah persona menjadi rekan koding yang menjalankan tugas, membaca keluaran, dan berulang. Ganti tab dan Anda bertemu spesialis lain \u2014 semuanya berbagi kredensial dan memori yang sama.",
      dashboardHome: "Selamat datang di pusat kendali \u2014 seluruh armada Anda dalam satu layar. Di atas, tanda-tanda vital: tingkat keberhasilan, proses yang berjalan, agen aktif, peringatan terbuka, dan tinjauan yang menanti Anda. Di bawahnya, pengoptimal menampilkan satu perbaikan berdampak besar pada satu waktu \u2014 saat ini, perubahan perutean yang memangkas biaya tanpa menyentuh kualitas. Dua panel di bawahnya melacak kesehatan tiap agen dan memori baru yang telah mereka pelajari dan ingin dipromosikan. Lalu gambaran langsung: setiap eksekusi saat tiba di kiri, empat belas hari lalu lintas dan kesalahan di kanan. Peta panas menampilkan proses per agen, hari demi hari, dan baris bawah melengkapinya \u2014 agen terbaik Anda, rutinitas terjadwal berikutnya, dan setiap rotasi kredensial. Satu halaman, seluruh operasi.",
      dashboardAgents: "Ini daftar tim Anda. Setiap kartu adalah persona \u2014 satu agen dengan satu identitas dan seperangkat keterampilan yang bisa dipadukan. Potretnya dibuat agar sesuai dengan karakternya; di bawahnya, statistik langsung: tingkat keberhasilan, proses, dan pengeluaran. Tekan Jalankan untuk menjalankan satu sesuai permintaan, atau buka Detail untuk memeriksa konfigurasi dan riwayat terbarunya. Lima agen di sini, masing-masing diam-diam menjalankan satu tugasnya dengan baik.",
      dashboardExecutions: "Setiap proses yang pernah dijalankan armada ada di sini, terbaru lebih dulu. Tabel menampilkan persona, status, durasi, biaya, dan waktu mulai \u2014 saring hanya yang gagal, atau yang masih berjalan. Klik baris mana pun dan eksekusi lengkap terbuka: strip metrik, penjelasan kesalahan apa pun, dan keluaran langsung yang mengalir baris demi baris, persis seperti yang dihasilkan agen.",
      dashboardEvents: "Agen tidak bekerja sendirian \u2014 mereka bereaksi terhadap peristiwa. Ini bus peristiwa: setiap sinyal yang mengalir melalui sistem, dari jadwal dan webhook hingga pesan antar-agen. Setiap baris menampilkan jenis peristiwa, sumbernya, status, dan berapa lama sejak terpicu. Peristiwa yang gagal dapat dicoba lagi di tempat, dan peristiwa terkait saling terangkai sehingga Anda dapat mengikuti satu kaskade dari ujung ke ujung.",
      dashboardReviews: "Beberapa keputusan membutuhkan manusia. Ketika agen menemui sesuatu yang tidak boleh diputuskannya sendiri, ia berhenti dan mengalihkan keputusan itu ke sini. Setiap item memuat persona, konteks, dan tindakan yang diusulkannya \u2014 setujui, tolak, atau lewati untuk nanti, dengan klik atau keyboard. Tidak ada yang berisiko diluncurkan tanpa persetujuan Anda, dan antrean menjaga sisa armada tetap berjalan selagi Anda memutuskan.",
      roadmap1: "Inilah posisi kami sekarang: setiap fase di peta jalan dinilai menurut status begitu dirilis.",
      roadmap2: "Apa yang berikutnya terserah Anda \u2014 pilih fitur yang paling Anda inginkan, dan ide terpopuler membentuk apa yang kami bangun.",
      roadmap3: "Dan inilah semua yang sudah dirilis \u2014 setiap rilis ditata berurutan, yang terbaru lebih dulu."
    },
    playgroundPage: {
      heroHeading: "Lihat agen dalam",
      heroHeadingGradient: "aksi",
      heroDescription: "Pilih tugas di bawah dan saksikan bagaimana agen Personas menguraikannya, memilih alat yang tepat, dan memberikan hasil \u2014 semua dalam hitungan detik.",
      ctaTitle: "Siap membangun agen Anda sendiri?",
      ctaDescription: "Unduh Personas dan buat agen otonom yang terhubung ke alat Anda, mengikuti aturan Anda, dan berjalan sesuai jadwal Anda.",
      ctaDownload: "Unduh Personas",
      ctaBrowseTemplates: "Jelajahi Templat",
      selectTask: "Pilih tugas di atas untuk memulai simulasi",
      simulatedExecution: "Eksekusi simulasi",
      statusExecuting: "menjalankan\u2026",
      statusComplete: "selesai",
      statusReady: "siap",
      chromeTitle: "agent-playground \u2014 langsung",
      reset: "Atur ulang"
    },
    // athenaPage: seeded from en, pending translation
    athenaPage: {
      hero: {
        eyebrow: "Your chief of staff",
        headline: "Meet",
        headlineGradient: "Athena",
        tagline: "She says nothing when nothing needs saying.",
        persona: "A strategist, not a cheerful assistant \u2014 direct, opinionated, warm without performing. \u201CSpeed is not your job. Quality is.\u201D",
        ctaPrimary: "See her work",
        ctaSecondary: "Download Personas",
        statWhisper: "Runs entirely on your machine \u00B7 you decide how far she goes",
        avatarAlt: "Athena, the Personas companion",
        orbAria: "Athena \u2014 press Enter and she acknowledges you",
        acknowledgeLine: "I'm listening.",
        calloutsAria: "What Athena does for you",
        callouts: [
          {
            label: "Talk to her",
            fact: "Hold to speak \u2014 no typing"
          },
          {
            label: "At a glance",
            fact: "See what she's working on"
          },
          {
            label: "Your desktop",
            fact: "Drag her where you work"
          },
          {
            label: "Always ready",
            fact: "Cmd/Ctrl+Shift+A, from any app"
          }
        ]
      },
      onboarding: {
        intro: {
          eyebrow: "Set up together",
          heading: "Onboarding",
          gradient: "partner"
        },
        chrome: {
          appName: "Personas",
          search: "Search\u2026",
          nav: [
            "Home",
            "Agents",
            "Templates",
            "Connectors",
            "Vault",
            "Settings"
          ],
          usageLabel: "runs today",
          usageValue: "18 / 25",
          newAgent: "New agent"
        },
        canvas: {
          crumbs: [
            "Workspace",
            "Automation"
          ],
          filters: [
            "All",
            "Popular",
            "Scheduled",
            "New"
          ],
          templatesLabel: "Templates",
          templatesHint: "12 templates",
          template: {
            title: "Daily digest",
            meta: "summarize \u00B7 post \u00B7 9:00",
            pill: "popular",
            schedule: "Daily 9:00",
            runs: "142 runs",
            health: "98% ok"
          },
          templateAlt: {
            title: "Inbox triage",
            meta: "label \u00B7 draft \u00B7 archive",
            pill: "new",
            schedule: "On new mail",
            runs: "86 runs",
            health: "94% ok"
          },
          runsTitle: "Recent runs",
          runsHint: "last 24h",
          runsCols: [
            "agent",
            "status",
            "took"
          ],
          runsRows: [
            {
              name: "Daily digest",
              state: "ok",
              took: "1.2s"
            },
            {
              name: "PR review",
              state: "ok",
              took: "0.8s"
            },
            {
              name: "Notes sync",
              state: "running",
              took: "\u2014"
            }
          ],
          connectLabel: "Connect a tool",
          connectCount: "2 of 9 connected",
          connectCountDone: "3 of 9 connected",
          slack: {
            name: "Slack",
            detail: "#general \u00B7 updates",
            connect: "connect",
            connecting: "connecting\u2026",
            connected: "connected"
          },
          chips: [
            {
              name: "GitHub",
              detail: "synced 2m ago",
              state: "connected"
            },
            {
              name: "Notion",
              detail: "12 pages",
              state: "connected"
            }
          ],
          triggerLabel: "Trigger",
          triggerIdle: "No schedule yet",
          triggerIdleShort: "Not set",
          triggerValue: "Every morning \u00B7 9:00",
          triggerValueShort: "Daily \u00B7 9:00",
          triggerHint: "edit",
          triggerDays: [
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S"
          ],
          triggerZone: "UTC+1",
          triggerOff: "off",
          triggerOn: "on",
          activityLabel: "Monitoring",
          activityPill: "live",
          stats: [
            {
              value: "24",
              label: "runs"
            },
            {
              value: "98%",
              label: "success"
            },
            {
              value: "1.4s",
              label: "avg"
            }
          ],
          action: "Create agent",
          actionDone: "Agent created"
        },
        captions: {
          template: "pick a starting point",
          connect: "connect your Slack",
          trigger: "choose when it runs",
          action: "one click \u2014 it's live"
        },
        status: {
          setup: "workspace \u00B7 setting up together",
          setupShort: "setting up",
          step: "step {n}/{total} \u00B7 built with you",
          stepShort: "step {n}/{total}",
          live: "agent live \u00B7 monitoring on",
          liveShort: "live"
        }
      },
      fleet: {
        intro: {
          eyebrow: "Say it in your own words",
          heading: "Fleet",
          gradient: "orchestration"
        },
        request: {
          placeholder: "Ask Athena for anything\u2026",
          voice: "or just say it",
          sent: "sent",
          clauses: [
            [
              "Pull ",
              "last week's tickets",
              ","
            ],
            [
              " find ",
              "the complaints that repeat",
              ","
            ],
            [
              " check ",
              "what we already fixed",
              ","
            ],
            [
              " count ",
              "how many it hit",
              ","
            ],
            [
              " and ",
              "tell the team what matters",
              "."
            ]
          ]
        },
        plan: {
          hint: "Change anything before it starts",
          hintShort: "Change anything first",
          edited: "Changed",
          start: "Start",
          working: "Working",
          done: "Done"
        },
        task: {
          working: "working",
          finished: "done"
        },
        tasks: [
          {
            title: "Collect the tickets",
            scope: "last 7 days",
            scopeEdited: "last 14 days",
            found: "1,284 tickets"
          },
          {
            title: "Group the repeat complaints",
            scope: "all channels",
            found: "9 clusters"
          },
          {
            title: "Check what we already shipped",
            scope: "since May",
            found: "4 already fixed"
          },
          {
            title: "Count the people affected",
            scope: "by account",
            found: "612 accounts"
          }
        ],
        result: {
          title: "What matters this week",
          rows: [
            {
              label: "Checkout errors",
              meta: "214 people"
            },
            {
              label: "Slow search",
              meta: "96 people"
            },
            {
              label: "Login loop",
              meta: "fixed Tuesday"
            }
          ],
          footer: "sent to the team"
        },
        status: {
          speak: "speak it or type it \u2014 same either way",
          speakShort: "type it or say it",
          planning: "Athena works out what it takes",
          pieces: "one sentence, four pieces of work",
          piecesShort: "four pieces of work",
          yourCall: "nothing runs until you say so",
          yourCallShort: "your call to start",
          parallel: "all four at the same time",
          parallelShort: "all four at once",
          returning: "coming back as one answer",
          returningShort: "coming back as one",
          closing: "one sentence in \u00B7 one answer back",
          closingShort: "one answer back"
        }
      },
      workshop: {
        intro: {
          eyebrow: "However much you hand her",
          heading: "The lines you drew",
          gradient: "hold"
        },
        beds: [
          {
            name: "Checkout app",
            short: "Checkout"
          },
          {
            name: "Marketing site",
            short: "Website"
          },
          {
            name: "Billing service",
            short: "Billing"
          }
        ],
        jobTitles: [
          "run the tests",
          "check the links",
          "clean up the warnings",
          "fix the flaky test",
          "refresh the changelog",
          "tidy the old branches"
        ],
        fence: {
          plate: "the places you opened",
          plateShort: "places you opened"
        },
        dial: {
          label: "how much she does on her own",
          labelShort: "how much on her own",
          stops: [
            "check with me first",
            "the small stuff",
            "go ahead"
          ],
          stopsShort: [
            "ask me first",
            "small stuff",
            "go ahead"
          ]
        },
        job: {
          working: "working",
          done: "done"
        },
        outside: {
          name: "Old client work",
          waits: "waits for you"
        },
        status: {
          line: "the line comes first",
          lineShort: "the line comes first",
          draw: "you draw it once",
          drawShort: "you draw it once",
          places: "these are the places you opened",
          placesShort: "the places you opened",
          inside: "she works inside it \u2014 all of it",
          insideShort: "she works inside",
          turnUp: "turn it up \u2014 more at once, fewer questions",
          turnUpShort: "turn it up \u2014 more at once",
          unmoved: "the line doesn't move with it",
          unmovedShort: "the line doesn't move",
          stops: "she stops where you stopped her",
          stopsShort: "she stops at the line",
          waits: "and waits \u2014 that one is yours",
          waitsShort: "that one is yours",
          free: "as free as you like, inside your lines",
          freeShort: "free, inside your lines"
        }
      },
      portfolio: {
        intro: {
          eyebrow: "While you are busy elsewhere",
          heading: "Nothing quietly",
          gradient: "rots"
        },
        projects: [
          "Marketing site",
          "Docs",
          "Mobile app",
          "Design system",
          "Support inbox",
          "Data pipeline",
          "Admin tools",
          "Payments API",
          "Search service",
          "Onboarding flow",
          "Notifications",
          "Internal wiki"
        ],
        field: {
          handled: "handled"
        },
        panel: {
          badge: "worst first",
          rows: [
            {
              name: "Dependencies",
              since: "quiet 11 days"
            },
            {
              name: "Nightly build",
              since: "red since Friday"
            }
          ],
          rest: "5 other checks fine",
          finding: "Payment library is 3 versions behind, one with a known hole.",
          findingShort: "3 versions behind, one with a hole.",
          action: "Open what fixes it",
          actionShort: "Open the fix",
          done: "Opened"
        },
        caption: {
          survey: "Checking every project",
          surfaced: "Three need you",
          worst: "This one first",
          found: "Quiet for 11 days",
          opened: "Opened for you"
        },
        status: {
          view: "every project you own, in view",
          viewShort: "all of them, in view",
          checking: "checking all of them at once",
          checkingShort: "checking all of them",
          needing: "3 need you \u00B7 worst first",
          needingShort: "3 need you",
          travel: "going straight to the worst one",
          travelShort: "worst one first",
          quiet: "payments api \u00B7 quiet for 11 days",
          quietShort: "quiet for 11 days",
          opened: "opened the thing that fixes it",
          openedShort: "opened for you",
          back: "back out to the whole picture",
          backShort: "back out",
          settled: "1 handled \u00B7 2 still waiting",
          settledShort: "1 handled \u00B7 2 waiting"
        }
      },
      memory: {
        intro: {
          eyebrow: "The longer you work together",
          heading: "The more she",
          gradient: "carries"
        },
        talk: "each day's talk",
        rail: "enough to sleep on",
        night: "she sleeps on it",
        shelf: "what she keeps",
        kept: [
          "You ship on Thursdays.",
          "Staging is where you try things.",
          "Billing is the one you worry about.",
          "You like the short version first."
        ],
        status: {
          day: "one ordinary day of working together",
          dayShort: "one ordinary day",
          building: "everything you two get through, building up",
          buildingShort: "the day's talk, building up",
          sleeps: "enough has built up \u2014 she sleeps on it",
          sleepsShort: "she sleeps on it",
          wakes: "she wakes with a little more than she had",
          wakesShort: "a little more than before",
          keeping: "another night, another thing worth keeping",
          keepingShort: "another thing worth keeping",
          quiet: "a quiet day \u2014 barely anything said",
          quietShort: "a quiet day",
          notEnough: "not enough to sleep on, so she doesn't",
          notEnoughShort: "not enough to sleep on",
          nothingLost: "nothing is lost \u2014 that day is still there",
          nothingLostShort: "still there, nothing lost",
          inUse: "and the first thing she kept is in use today",
          inUseShort: "day one's, in use today",
          sleepsAgain: "she sleeps on this one too",
          sleepsAgainShort: "she sleeps on this one too",
          cost: "it costs her less than one ordinary reply",
          costShort: "less than one reply",
          oneMore: "one more night, one more thing she carries",
          oneMoreShort: "one more thing she carries",
          carries: "the longer you work together, the more she carries",
          carriesShort: "the more she carries"
        }
      },
      oneMind: {
        intro: {
          eyebrow: "However many conversations",
          heading: "Always the",
          gradient: "same person"
        },
        conversations: [
          {
            name: "The rewrite",
            short: "The rewrite"
          },
          {
            name: "Monday review",
            short: "Monday"
          },
          {
            name: "Getting set up",
            short: "Setup"
          },
          {
            name: "The outage",
            short: "Outage"
          },
          {
            name: "The pricing page",
            short: "Pricing"
          },
          {
            name: "Invoices",
            short: "Invoices"
          }
        ],
        open: {
          label: "this conversation",
          question: "What else are we working on?",
          from: "from",
          footer: "Nothing else needs you today.",
          footerShort: "Nothing else needs you."
        },
        rows: [
          {
            claim: "The last check passed about an hour ago",
            short: "Last check passed"
          },
          {
            claim: "Two projects are waiting on you, neither urgent",
            short: "2 waiting, none urgent"
          },
          {
            claim: "Your calendar still isn't connected",
            short: "Calendar not connected"
          }
        ],
        status: {
          live: "every conversation you have going",
          liveShort: "all your conversations",
          open: "all of them open at the same time",
          openShort: "all open at once",
          asked: "you asked in one of them",
          askedShort: "you asked here",
          answers: "she answers from everything she knows",
          answersShort: "she answers from all of it",
          sources: "every line, and where it came from",
          sourcesShort: "every line, and its source",
          oneVoice: "one voice \u2014 you never hear two at once",
          oneVoiceShort: "one voice, never two",
          samePerson: "the same person, in all of them",
          samePersonShort: "the same person, in all of them"
        }
      }
    }
  };
