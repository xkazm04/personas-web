import { topSeverity, type FleetAgent, type FleetTeam } from "../fleet-data";
import Ornament from "./Ornament";
import { hueText, SEVERITY_COLOR, stateColor, textTone } from "./palette";
import Persona from "./Persona";
import { stateWord, windowAria, type CityCopy, type OfficeCopy } from "./vocab";
import o from "./office.module.css";

const WALL: Record<string, string> = {
  running: "24%", failed: "26%", input_required: "26%", draft_ready: "24%", queued: "14%", attention: "11%", idle: "6%", off: "0%",
};

interface CutawayProps {
  team: FleetTeam;
  members: FleetAgent[];
  city: CityCopy;
  copy: OfficeCopy;
  still: boolean;
  onOpen: (id: string, el: HTMLElement) => void;
  onAttend: (id: string | null) => void;
}

/**
 * The building opened up: its roof on top, one room per agent, each with the
 * persona at its desk in its current state. Stylised cutaway illustration.
 */
export default function Cutaway({ team, members, city, copy, still, onOpen, onAttend }: CutawayProps) {
  const n = members.length;
  const cols = n <= 2 ? n : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  // Eleven agents make four floors: shorter rooms, a lower roof.
  const dense = rows >= 4;
  const mode = n <= 2 ? o.big : dense ? o.small : "";
  return (
    <div className={`relative flex h-full min-h-0 flex-col ${mode}`}>
      <svg className={`${dense ? "h-[60px]" : "h-[84px]"} w-full flex-none overflow-visible`} viewBox="0 -96 640 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <Ornament teamId={team.id} cx={320} top={0} w={600} hue={team.hue} still={still} />
      </svg>
      <div
        className={`${o.rooms} mx-2 min-h-0 flex-1`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
        onMouseLeave={() => onAttend(null)}
      >
        {members.map((a) => (
          <Room key={a.id} a={a} teamName={team.name} city={city} copy={copy} still={still} onOpen={onOpen} onAttend={onAttend} />
        ))}
        {Array.from({ length: cols * rows - n }, (_, k) => <div key={k} className={o.empty} aria-hidden="true" />)}
      </div>
      <p className="mt-1.5 self-end pr-6 text-[13px] text-muted-dark">{copy.cutawayNote}</p>
    </div>
  );
}

interface RoomProps {
  a: FleetAgent;
  teamName: string;
  city: CityCopy;
  copy: OfficeCopy;
  still: boolean;
  onOpen: (id: string, el: HTMLElement) => void;
  onAttend: (id: string | null) => void;
}

function Room({ a, teamName, city, copy, still, onOpen, onAttend }: RoomProps) {
  const c = stateColor(a);
  const sev = topSeverity(a);
  const key = a.enabled ? a.state : "off";
  return (
    <button
      id={`ns-room-${a.id}`}
      type="button"
      className={`${o.room} ${a.enabled ? "" : o.off}`}
      style={{ ["--c" as string]: c, ["--k" as string]: WALL[key] }}
      aria-label={windowAria(city, a, teamName)}
      onClick={(e) => onOpen(a.id, e.currentTarget)}
      onMouseEnter={() => onAttend(a.id)}
      onFocus={() => onAttend(a.id)}
      onBlur={() => onAttend(null)}
    >
      <Persona a={a} still={still} className={o.art} />
      <span className={o.text}>
        {/* Callsign and flags share one line; the state has its own line and
            never wraps; the name keeps two whole lines at most. */}
        <span className="flex flex-none items-center gap-1.5 text-[13px]">
          <span className="font-mono text-base font-bold" style={{ color: hueText(a.hue) }}>{a.callsign}</span>
          {sev && <span className="rounded-full border px-1.5 leading-tight" style={{ color: textTone(SEVERITY_COLOR[sev]), borderColor: SEVERITY_COLOR[sev] }}>⚑ {a.reviews.length}</span>}
          {a.unreadMessages.length > 0 && <span className="rounded-full border px-1.5 leading-tight" style={{ color: textTone("var(--ns-wire)"), borderColor: "var(--ns-wire)" }}>✉ {a.unreadMessages.length}</span>}
        </span>
        <span className={`${o.line} text-[13px]`} style={{ color: a.enabled ? textTone(c) : "var(--muted-dark)" }}>{stateWord(city, a)}</span>
        <span className={`${o.name} text-base font-semibold leading-tight text-foreground`}>{a.name}</span>
        <span className={`${o.task} ${o.line} text-base text-muted-dark`}>{a.task ?? copy.noRun}</span>
        {a.enabled && a.state === "running" && (
          <span className="mt-0.5 block h-1.5 flex-none overflow-hidden rounded bg-foreground/10">
            <i className="block h-full bg-brand-cyan" style={{ width: `${Math.round((a.progress ?? 0) * 100)}%`, transition: "width .8s" }} />
          </span>
        )}
      </span>
    </button>
  );
}
