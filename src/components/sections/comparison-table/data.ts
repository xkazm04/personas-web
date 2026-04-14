import type { ComponentType, SVGProps } from "react";
import { CrewAIMark, LangChainMark, N8nMark, AutoGenMark } from "@/components/icons/brand-icons";

export const COMPETITOR_MARKS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number }>> = {
  crewai: CrewAIMark,
  langchain: LangChainMark,
  n8n: N8nMark,
  autogen: AutoGenMark,
};
