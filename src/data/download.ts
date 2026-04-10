/* ── Download page data ─────────────────────────────────────────────── */

export type PlatformId = "windows" | "macos" | "linux";

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  icon: string;
  available: boolean;
  downloadUrl: string | null;
  fileSize: string;
  fileType: string;
  requirements: string[];
  installSteps: string[];
  checksum: string;
}

const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? null;
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.3.0";

export { APP_VERSION };

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "windows",
    name: "Windows",
    icon: "Monitor",
    available: !!DOWNLOAD_URL,
    downloadUrl: DOWNLOAD_URL ? "/api/download" : null,
    fileSize: "~85 MB",
    fileType: ".exe installer",
    requirements: [
      "Windows 10 or later (64-bit)",
      "4 GB RAM minimum, 8 GB recommended",
      "500 MB free disk space",
      "WebView2 runtime (included in Windows 10+)",
      "Claude CLI installed with active subscription",
    ],
    installSteps: [
      "Download the .exe installer",
      "Run the installer — no admin rights needed",
      "Launch Personas from the Start menu",
      "Connect your Claude CLI credentials on first launch",
      "Create your first agent in natural language",
    ],
    checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb924...pending",
  },
  {
    id: "macos",
    name: "macOS",
    icon: "Apple",
    available: false,
    downloadUrl: null,
    fileSize: "~90 MB",
    fileType: ".dmg disk image",
    requirements: [
      "macOS 12 Monterey or later",
      "Apple Silicon (M1+) or Intel 64-bit",
      "4 GB RAM minimum, 8 GB recommended",
      "500 MB free disk space",
      "Claude CLI installed with active subscription",
    ],
    installSteps: [
      "Download the .dmg disk image",
      "Open the disk image and drag Personas to Applications",
      "Launch from Applications or Spotlight",
      "Allow the app in System Settings > Privacy & Security if prompted",
      "Connect your Claude CLI credentials on first launch",
    ],
    checksum: "Coming soon",
  },
  {
    id: "linux",
    name: "Linux",
    icon: "Terminal",
    available: false,
    downloadUrl: null,
    fileSize: "~80 MB",
    fileType: ".AppImage / .deb",
    requirements: [
      "Ubuntu 22.04+, Fedora 38+, or equivalent",
      "64-bit x86_64 architecture",
      "4 GB RAM minimum, 8 GB recommended",
      "500 MB free disk space",
      "webkit2gtk 4.1+ and libappindicator",
      "Claude CLI installed with active subscription",
    ],
    installSteps: [
      "Download the .AppImage or .deb package",
      "For AppImage: chmod +x and run directly",
      "For .deb: sudo dpkg -i personas_*.deb",
      "Launch from your application menu",
      "Connect your Claude CLI credentials on first launch",
    ],
    checksum: "Coming soon",
  },
];

export interface DownloadFAQ {
  question: string;
  answer: string;
}

export const DOWNLOAD_FAQS: DownloadFAQ[] = [
  {
    question: "Do I need a Claude subscription?",
    answer:
      "Yes. Personas uses Claude CLI under the hood. You need an active Claude Pro or Max subscription and the CLI installed. Personas is the orchestration layer — Claude provides the AI.",
  },
  {
    question: "Is Personas really free?",
    answer:
      "The desktop app is free forever with no limits on agents, executions, or features. You pay only for your own Claude subscription. We never touch your Anthropic bill.",
  },
  {
    question: "Can I run it without internet?",
    answer:
      "Yes, if you pair Personas with a local LLM (Ollama, LM Studio). The app itself requires no internet. For cloud AI providers, you need connectivity to reach their APIs.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Everything stays on your machine. Agent configs, execution logs, and credentials are stored in your user directory. Credentials are encrypted with AES-256-GCM using your OS keyring.",
  },
  {
    question: "How do I update?",
    answer:
      "Personas includes an auto-updater that checks for new versions on launch. You can also disable auto-update for air-gapped environments and update manually.",
  },
];
