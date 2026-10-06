import GradientText from "@/components/GradientText";
import { TOOLS, TOOL_WASH } from "./data";
import { LensArt } from "./Lens";
import { fill, type ClockCopy } from "./copy";
import type { Opener } from "./DialFace";
import s from "./clock.module.css";

interface ToolsProps {
  c: ClockCopy;
  tool: number;
  job: number;
  onPersona: Opener;
  onJob: (k: number, ...a: Parameters<Opener>) => void;
}

/** Chapter 2, 09:30-17:00: one persona picks up three jobs in each tool, shift by shift. */
export function ToolsChapter({ c, tool, job, onPersona, onJob }: ToolsProps) {
  const T = TOOLS[tool];
  const item = c.tools.items[T.id];
  return (
    <section className={s.ch} data-k="ch1" inert aria-label={c.tools.label}>
      <div className={s.t}>
        <h2 className={s.hl}>
          <span className={s.ln}>{c.tools.lines[0]}</span>
          <span className={s.ln}>
            <GradientText>{c.tools.lines[1]}</GradientText>
          </span>
        </h2>
      </div>
      <div className={`${s.h} ${s.h1}`}>
        <svg className={`${s.lens} ${s.swap}`} key={`l${tool}`} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <LensArt tool={T.id} />
        </svg>
        <div className={`${s.tname} ${s.swap}`} key={`n${tool}`}>
          {item.name}
        </div>
        <div className={s.tshift}>{fill(c.tools.shift, { time: T.time })}</div>
      </div>
      <div className={s.b}>
        <button type="button" className={s.persona} aria-label={c.tools.personaAria} onClick={(e) => onPersona(e, e.currentTarget)}>
          <svg viewBox="0 0 64 64" width={32} height={32} aria-hidden="true">
            <use href="#m2-emblem" />
          </svg>
          <span>
            <b>{fill(c.tools.personaTitle, { tool: item.name })}</b>
            <small>{c.tools.personaSub}</small>
          </span>
        </button>
        <div className={s.jobs} role="group" aria-label={c.tools.jobsAria} style={{ ["--tw" as string]: TOOL_WASH[T.id] }}>
          {item.jobs.map((j, k) => (
            <button
              key={`${T.id}${k}`}
              type="button"
              className={s.job}
              data-on={k === job ? "" : undefined}
              aria-label={j.title}
              onClick={(e) => onJob(k, e, e.currentTarget)}
            >
              {j.chip ?? j.title}
            </button>
          ))}
        </div>
        <p className={s.desc} aria-live="polite">
          <span className={s.swap} key={`d${tool}-${job}`}>
            {item.jobs[job].body}
          </span>
        </p>
      </div>
    </section>
  );
}
