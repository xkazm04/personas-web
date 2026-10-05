import type { FleetAgent } from "../fleet-data";
import WindowArt, { type WindowAgent } from "./WindowArt";
import type { CityCopy } from "./vocab";

const mk = (state: FleetAgent["state"], extra: Partial<WindowAgent> = {}): WindowAgent => ({
  state,
  enabled: true,
  progress: 0.6,
  reviews: [],
  unreadMessages: [],
  ...extra,
});

const review = (severity: "warning" | "critical") => ({ id: severity, severity, title: "", ageMin: 0 });
const note = (id: string) => ({ id, text: "", ageMin: 0 });

/** How to read a window: every state drawn the way the city draws it. */
export default function Legend({ copy, still }: { copy: CityCopy; still: boolean }) {
  const L = copy.legend;
  const rows: [WindowAgent, string][] = [
    [mk("running"), L.working],
    [mk("failed"), L.failed],
    [mk("input_required"), L.input],
    [mk("draft_ready"), L.draft],
    [mk("idle", { reviews: [review("warning"), review("critical")] }), L.review],
    [mk("queued"), L.queued],
    [mk("idle"), L.idle],
    [mk("idle", { enabled: false }), L.off],
    [mk("idle", { unreadMessages: [note("a"), note("b")] }), L.unread],
  ];
  return (
    <div
      id="ns-legend"
      role="dialog"
      aria-label={copy.legendTitle}
      className="absolute right-3 top-3 z-30 w-[340px] rounded-2xl border border-glass-hover px-4 py-3.5 shadow-2xl"
      style={{ background: "color-mix(in oklab, var(--background) 96%, transparent)" }}
    >
      <h4 className="mb-2 text-[15px] font-semibold uppercase tracking-widest text-muted-dark">{copy.legendTitle}</h4>
      {rows.map(([a, label]) => (
        <div key={label} className="flex items-center gap-3 py-0.5 text-[17px] text-foreground">
          <svg width={44} height={50} viewBox="-12 -18 50 64" aria-hidden="true" className="flex-none">
            <WindowArt a={a} x={0} y={0} w={28} h={34} hue={200} still={still} />
          </svg>
          <span>{label}</span>
        </div>
      ))}
      <p className="mt-2 text-[15px] leading-snug text-muted-dark">{copy.legendNote}</p>
    </div>
  );
}
