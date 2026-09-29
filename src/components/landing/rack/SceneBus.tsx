"use client";

import { useTranslation } from "@/i18n/useTranslation";
import LnIcon from "../shared/LnIcon";
import LnLed from "../shared/LnLed";
import { CONNECTOR_ORDER, type ConnectorId } from "./data";

/** The connector rail: every connector, lit when the open persona uses it. */
export default function SceneBus({ active }: { active: readonly ConnectorId[] }) {
  const { t } = useTranslation();
  const r = t.landingNext.rack;
  return (
    <div className="ln-sc-bus">
      <ul className="ln-bus-rail" aria-label={r.busLabel}>
        {CONNECTOR_ORDER.map((k) => {
          const on = active.includes(k);
          return (
            <li key={k} className={`ln-mod${on ? " ln-on" : ""}`} aria-label={`${r.connectors[k]}: ${on ? r.connected : r.available}`}>
              <LnLed state={on ? "on" : "off"} />
              <LnIcon id={`g-${k}`} />
              <span>{r.connectors[k]}</span>
            </li>
          );
        })}
      </ul>
      <p className="ln-bus-note">
        <b>{r.busCount}</b>
        {r.busNote}
      </p>
    </div>
  );
}
