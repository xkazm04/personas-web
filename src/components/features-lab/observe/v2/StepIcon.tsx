import { Brain, Clock3, RotateCw, Sparkles, UserCheck } from "lucide-react";
import { ToolMark } from "../shared/Stage";
import type { Step } from "./runs";

/** A step's mark: the real catalog logo for a tool, a drawn glyph otherwise. */
export default function StepIcon({ st, className }: { st: Step; className: string }) {
  if (st.tool) return <ToolMark icon={st.tool} className={className} />;
  switch (st.kind) {
    case "model":
      return <Sparkles className={className} aria-hidden />;
    case "review":
      return <UserCheck className={className} aria-hidden />;
    case "memory":
      return <Brain className={className} aria-hidden />;
    case "retry":
      return <RotateCw className={className} aria-hidden />;
    default:
      return <Clock3 className={className} aria-hidden />;
  }
}
