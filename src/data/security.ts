/* ── Security & Privacy page data ───────────────────────────────────── */

export interface SecurityPillar {
  title: string;
  description: string;
  icon: string;
  color: string;
  details: string[];
}

export const SECURITY_PILLARS: SecurityPillar[] = [
  {
    title: "Local-First Architecture",
    description:
      "Your agents and their run history live on your machine, because the whole orchestration engine runs on your desktop, and your credentials never leave it. Your prompts go only to the AI provider you choose, or nowhere at all with a local Ollama model. Cloud sync to your own account is optional and off until you turn it on.",
    icon: "Monitor",
    color: "#06b6d4",
    details: [
      "AI model calls go directly from your machine to Claude (Anthropic), or stay on it with a local Ollama model",
      "No Personas relay servers sit between you and your AI provider",
      "Agent configurations stored as local encrypted files",
      "Execution logs stay on disk unless you turn on optional cloud sync",
      "Works fully offline for local LLM configurations",
    ],
  },
  {
    title: "AES-256-GCM Credential Vault",
    description:
      "Every API key, OAuth token, and secret is encrypted at rest using AES-256-GCM — the same standard used by government agencies and financial institutions.",
    icon: "Shield",
    color: "#34d399",
    details: [
      "256-bit encryption keys derived from your OS-native keyring",
      "Windows: DPAPI-protected Credential Manager",
      "macOS: Keychain Access (Secure Enclave on Apple Silicon)",
      "Linux: libsecret (GNOME Keyring / KDE Wallet)",
      "Credentials never written to disk in plaintext",
    ],
  },
  {
    title: "Minimal, Anonymous Telemetry",
    description:
      "Release builds send error reports and a few anonymous usage signals to Sentry, so we can fix crashes and see which features get used. Your agents, prompts, outputs, and credentials are never part of them.",
    icon: "EyeOff",
    color: "#a855f7",
    details: [
      "Sent: error messages, stack traces, OS, architecture, and app version",
      "Sent: anonymous app sessions, feature visits, and key actions, tied only to a random device or install ID",
      "Stripped before sending: IP address, email, username, request bodies, and headers",
      "Never collected: performance traces, session replays, user identity, persona content, or credentials",
      "Usage signals and interface error reports can be turned off at first launch or in Settings > Account. Crash reports from the app's native core are not covered by that switch yet",
      "Development builds and builds you compile from source send nothing",
    ],
  },
  {
    title: "Air-Gap Capable",
    description:
      "Run Personas in fully isolated networks. When paired with a local LLM, the application requires zero internet connectivity.",
    icon: "Wifi",
    color: "#fbbf24",
    details: [
      "No mandatory network calls on startup",
      "Auto-updater can be disabled for air-gapped environments",
      "Local LLM support (Ollama, LM Studio) for complete isolation",
      "All 40+ connector configurations work with internal endpoints",
      "No license server or activation requirement",
    ],
  },
];

export interface CompliancePoint {
  label: string;
  description: string;
  status: "simplified" | "not-applicable" | "built-in";
  checklist: string[];
}

export const COMPLIANCE_POINTS: CompliancePoint[] = [
  {
    label: "GDPR",
    description: "With cloud sync off (the default), Personas never receives your data, so you need no data processing agreement with Personas. Personal data in a prompt goes only to the AI provider you choose, under your own agreement with them, or nowhere with a local model. If you turn on cloud sync, the synced data is stored in your account with Supabase.",
    status: "simplified",
    checklist: [
      "No Data Processing Agreement (DPA) required with Personas",
      "No cross-border transfers through Personas",
      "No third-party sub-processor inventory to maintain",
      "No consent management for Personas-side processing",
      "Data subject access requests are a local file lookup",
    ],
  },
  {
    label: "HIPAA",
    description: "With cloud sync off (the default), PHI never transits through Personas infrastructure, and your AI provider relationship is direct.",
    status: "simplified",
    checklist: [
      "No Business Associate Agreement (BAA) needed with Personas",
      "No PHI stored on remote Personas servers",
      "No breach notification obligations to Personas",
      "Audit trail lives entirely on your machine",
      "Your existing device encryption satisfies safeguard requirements",
    ],
  },
  {
    label: "SOC 2",
    description: "Not applicable while cloud sync is off (the default): Personas runs entirely on your device, so your existing device security controls apply. Optional cloud sync stores the data you sync with Supabase.",
    status: "not-applicable",
    checklist: [
      "Nothing on the Personas side to audit or certify while cloud sync is off",
      "No shared-tenancy risk to evaluate",
      "No vendor security questionnaire to complete for Personas",
      "Your device-level controls are the only scope",
    ],
  },
  {
    label: "Data Residency",
    description: "With cloud sync off (the default), everything Personas stores resides wherever your machine is. No cross-border transfers through Personas.",
    status: "built-in",
    checklist: [
      "Agents and history stay on your hardware unless you turn on cloud sync; credentials always do",
      "No replication to foreign data centers",
      "Jurisdiction is wherever your machine is located",
      "No multi-region failover moving data silently",
    ],
  },
  {
    label: "Data Portability",
    description: "Export all agent configurations, execution logs, and credentials at any time. Standard JSON format.",
    status: "built-in",
    checklist: [
      "Export agents, prompts, and configs as JSON",
      "Execution logs available as local files",
      "No vendor lock-in on data formats",
      "Migration to another tool requires no API call to Personas",
    ],
  },
  {
    label: "Right to Erasure",
    description: "Delete the application folder. Done. If you turned on cloud sync, also ask us to delete the synced copy.",
    status: "built-in",
    checklist: [
      "Uninstall removes all local data",
      "Turning off Sync notes or Sync chats deletes those synced copies",
      "Other synced data is deleted on request",
      "No waiting period for local data deletion",
    ],
  },
];

export interface ArchitectureLayer {
  name: string;
  description: string;
  color: string;
  /** Expanded detail shown on hover/focus of the layer card. Lives here (not
   *  keyed by display-name in the component) so a rename can't silently drop it. */
  detail: string;
}

export interface SecurityFAQ {
  question: string;
  answer: string;
}

export const SECURITY_FAQS: SecurityFAQ[] = [
  {
    question: "Does Personas send data to the cloud?",
    answer:
      "Only what you choose. By default your agents, outputs, run history, and credentials stay on your desktop. When an agent runs, its prompt goes directly from your device to the AI provider you chose (Claude by Anthropic), or stays on your machine with a local Ollama model; Personas never relays it. Release builds send us anonymous error reports and usage signals (see the telemetry question below). Cloud sync is optional and off until you turn it on: it copies your agents and runs to your own account so you can follow them on the web, notes and Athena chats sync only behind their own switches, and credentials never sync. The Privacy Policy lists exactly what syncs.",
  },
  {
    question: "How are credentials stored?",
    answer:
      "AES-256-GCM encryption with OS-native keyring integration (Windows DPAPI, macOS Keychain, Linux libsecret). Credentials are never written to disk in plaintext.",
  },
  {
    question: "Does Personas collect telemetry?",
    answer:
      "A little, and only anonymously. Release builds send error reports (message, stack trace, OS, app version) and anonymous usage signals (app sessions, which sections you open, key actions) to Sentry. IP addresses, emails, usernames, and request data are stripped first; there are no performance traces, no session replays, and no user identity. Your prompts, persona content, and credentials are never included. You can turn off usage signals and interface error reports at first launch or in Settings > Account; crash reports from the native core are not covered by that switch yet. Development builds send nothing.",
  },
  {
    question: "Can my employer see my agent data?",
    answer:
      "Only if they have access to your machine, or to your Personas account if you turn on cloud sync. There is no admin console and no organization view: synced data can be read only by your own signed-in account.",
  },
  {
    question: "What happens if I uninstall Personas?",
    answer:
      "All local data is removed with the application. If you turned on cloud sync, the synced copy stays in your account until you ask us to delete it (turning off Sync notes or Sync chats deletes those copies yourself). Otherwise only the anonymous error reports and usage signals described above remain with Sentry, and they carry no identity.",
  },
];

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  { name: "Your AI Provider", description: "Direct calls to Claude (Anthropic), or a local Ollama model: your account, your keys", color: "#06b6d4", detail: "Direct, encrypted API calls with no relay or proxy — your keys, your account, your rate limits." },
  { name: "Personas Engine", description: "Local orchestration, scheduling, healing, tracing — runs on your machine", color: "#a855f7", detail: "Multi-agent orchestration, healing, scheduling, and tracing — everything runs as a local process." },
  { name: "Encrypted Vault", description: "AES-256-GCM credentials stored in OS keyring — never in plaintext", color: "#34d399", detail: "AES-256-GCM with OS-native keyring integration — DPAPI on Windows, Keychain on macOS, libsecret on Linux." },
  { name: "Your Machine", description: "Windows, macOS, or Linux — your hardware, your security controls", color: "#fbbf24", detail: "Full control over hardware, network policies, and OS security — air-gap capable with local LLMs." },
];
