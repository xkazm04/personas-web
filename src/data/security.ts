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
      "Your agents, prompts, and outputs never leave your machine. The entire orchestration engine runs on your desktop — no cloud servers process your data.",
    icon: "Monitor",
    color: "#06b6d4",
    details: [
      "All AI model calls go directly from your machine to the provider (Anthropic, OpenAI, Google)",
      "No Personas relay servers sit between you and your AI provider",
      "Agent configurations stored as local encrypted files",
      "Execution logs stay on disk — never uploaded or synced",
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
    title: "Zero Telemetry",
    description:
      "Personas collects no usage analytics, no crash reports, no feature flags, no A/B test data. There is no phone-home behavior whatsoever.",
    icon: "EyeOff",
    color: "#a855f7",
    details: [
      "No Google Analytics, Mixpanel, Segment, or similar tracking",
      "No anonymous usage statistics",
      "No crash reporting (Sentry, Bugsnag, etc.)",
      "No feature flag services checking remote state",
      "Open-source — you can verify this yourself",
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
    description: "No personal data leaves your device. Data processing agreements with Personas are not needed — your data stays local.",
    status: "simplified",
    checklist: [
      "No Data Processing Agreement (DPA) required with Personas",
      "No cross-border data transfer concerns",
      "No third-party sub-processor inventory to maintain",
      "No consent management for Personas-side processing",
      "Data subject access requests are a local file lookup",
    ],
  },
  {
    label: "HIPAA",
    description: "PHI never transits through Personas infrastructure. Your AI provider relationship is direct.",
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
    description: "Not applicable — Personas has no cloud infrastructure to audit. Your existing device security controls apply.",
    status: "not-applicable",
    checklist: [
      "No cloud infrastructure to audit or certify",
      "No shared-tenancy risk to evaluate",
      "No vendor security questionnaire to complete for Personas",
      "Your device-level controls are the only scope",
    ],
  },
  {
    label: "Data Residency",
    description: "Your data resides wherever your machine is. No cross-border transfers through Personas.",
    status: "built-in",
    checklist: [
      "Data physically stays on your hardware",
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
    description: "Delete the application folder. Done. No cloud accounts, no remote data, no deactivation requests.",
    status: "built-in",
    checklist: [
      "Uninstall removes all data — no cloud residue",
      "No account deactivation request needed",
      "No waiting period for data deletion",
      "No hidden backups on remote servers",
    ],
  },
];

export interface ArchitectureLayer {
  name: string;
  description: string;
  color: string;
}

export interface SecurityFAQ {
  question: string;
  answer: string;
}

export const SECURITY_FAQS: SecurityFAQ[] = [
  {
    question: "Does Personas send data to the cloud?",
    answer:
      "No. Personas runs entirely on your desktop. Your data never leaves your machine. AI model calls go directly from your device to your chosen provider — Personas never relays or stores them.",
  },
  {
    question: "How are credentials stored?",
    answer:
      "AES-256-GCM encryption with OS-native keyring integration (Windows DPAPI, macOS Keychain, Linux libsecret). Credentials are never written to disk in plaintext.",
  },
  {
    question: "Does Personas collect telemetry?",
    answer:
      "No. Zero analytics, crash reports, or phone-home behavior. There are no tracking scripts, no anonymous usage statistics, and no feature flag services checking remote state.",
  },
  {
    question: "Can my employer see my agent data?",
    answer:
      "Only if they have access to your machine. Personas stores everything locally — there is no admin console, no centralized server, and no way for anyone to remotely view your agents, prompts, or outputs.",
  },
  {
    question: "What happens if I uninstall Personas?",
    answer:
      "All data is removed with the application. There are no cloud accounts, no remote backups, and no residual data on external servers. Deleting the application folder is a complete erasure.",
  },
];

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  { name: "Your AI Provider", description: "Direct API calls to Anthropic, OpenAI, Google — your keys, your account", color: "#06b6d4" },
  { name: "Personas Engine", description: "Local orchestration, scheduling, healing, tracing — runs on your machine", color: "#a855f7" },
  { name: "Encrypted Vault", description: "AES-256-GCM credentials stored in OS keyring — never in plaintext", color: "#34d399" },
  { name: "Your Machine", description: "Windows, macOS, or Linux — your hardware, your security controls", color: "#fbbf24" },
];
