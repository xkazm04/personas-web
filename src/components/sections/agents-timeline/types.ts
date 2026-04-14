export interface TrackStep {
  label: string;
  durationMs: number;
  status: "ok" | "warn" | "error";
}

export interface Scenario {
  id: string;
  name: string;
  trigger: string;
  workflow: {
    steps: TrackStep[];
    totalMs: number;
    result: string;
  };
  agent: {
    steps: TrackStep[];
    totalMs: number;
    result: string;
  };
}
