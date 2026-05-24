import { Apple, Monitor, Terminal } from "lucide-react";

export type PlatformKey = "windows" | "macos" | "linux";

export type Platform = {
  key: PlatformKey;
  icon: typeof Monitor | typeof Apple | typeof Terminal;
  label: string;
  available: boolean;
};
