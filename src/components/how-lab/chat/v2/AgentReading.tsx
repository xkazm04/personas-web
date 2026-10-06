"use client";

import { AGENT, CUSTOMER, FG, WARN, mix, type Role, type Segment } from "../shared/scenarios";
import { readAt } from "./timing";

const ROLE_COLOR: Record<Role, string> = { drop: "var(--muted-dark)", fix: WARN, ask: AGENT, info: CUSTOMER, plain: FG };

/** The message as the agent reads it: every word stays, and each part gets
 *  marked for what it means - taken back (struck through), a correction, the
 *  real ask, a detail - with a short label under it. */
export default function AgentReading({ segments, roles, tags, t }: { segments: string[]; roles: Segment[]; tags: string[]; t: number }) {
  return (
    <p className="m-0 leading-[1.7]">
      {segments.map((text, i) => {
        const role = roles[i]?.role ?? "plain";
        const tag = roles[i]?.tag;
        const read = t >= readAt(i, segments.length);
        const color = ROLE_COLOR[role];
        const marked = read && role !== "plain";
        return (
          <span key={i}>
            <span
              className="relative inline-block pb-[1.15rem] md:whitespace-nowrap leading-tight transition-colors duration-500"
              style={{
                color: role === "drop" && read ? "var(--muted)" : read && role === "ask" ? FG : "color-mix(in srgb, var(--foreground) 86%, transparent)",
                fontWeight: role === "ask" && read ? 650 : undefined,
              }}
            >
              {text}
              {/* Struck through (taken back) or underlined (meaning found). */}
              <span
                aria-hidden
                className="absolute left-0 right-0 origin-left rounded-full transition-transform duration-500 ease-out"
                style={{
                  bottom: role === "drop" ? "calc(1.15rem + 0.42em)" : "1.02rem",
                  height: role === "ask" ? 4 : 3,
                  background: role === "drop" ? "var(--muted)" : color,
                  boxShadow: role === "ask" ? `0 0 14px ${mix(AGENT, 70)}` : undefined,
                  transform: `scaleX(${marked ? 1 : 0})`,
                }}
              />
              {tag !== undefined && (
                <span
                  className="absolute bottom-0 left-0 whitespace-nowrap font-mono text-[max(12px,0.36em)] font-medium uppercase leading-none tracking-[0.12em] transition-[opacity,transform] duration-500"
                  style={{ color: role === "drop" ? "var(--muted)" : color, opacity: marked ? 1 : 0, transform: `translateY(${marked ? 0 : -4}px)` }}
                >
                  {tags[tag]}
                </span>
              )}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}
