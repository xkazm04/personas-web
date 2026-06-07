"use client";

import { useState } from "react";
import RoleSelector, { type ViewerRole } from "@/components/RoleSelector";
import WhyAgents from "./index";

/**
 * Client wrapper for the homepage funnel: lets visitors pick their role
 * ("I am a ___") and swaps the WhyAgents tagline / subtitle / highlights via the
 * existing roleCopy map. Defaults to developer. Pure client state over static
 * data — no backend. Mirrors the RoleSelector bar pattern used on the /how page.
 */
export default function WhyAgentsSection() {
  const [role, setRole] = useState<ViewerRole>("developer");

  return (
    <>
      <div className="relative z-10 flex flex-col items-center gap-3 pt-4 pb-2">
        <RoleSelector active={role} onChange={setRole} />
      </div>
      <WhyAgents role={role} />
    </>
  );
}
