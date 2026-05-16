import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";
import type { LucideIcon } from "lucide-react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};

export const GithubIcon = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
);
GithubIcon.displayName = "GithubIcon";

export const TwitterIcon = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
);
TwitterIcon.displayName = "TwitterIcon";

export const DiscordIcon = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.075.075 0 0 0-.079.038c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.25.078.078 0 0 0-.079-.038A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.42 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.335-.956 2.42-2.157 2.42Zm7.974 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.335-.946 2.42-2.157 2.42Z" />
    </svg>
  ),
);
DiscordIcon.displayName = "DiscordIcon";

export const FigmaIcon = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491M12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117z" />
      <path d="M8.148 24c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v4.49c0 2.476-2.013 4.49-4.588 4.49m0-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.355 3.019 3.019 3.019 1.665 0 3.117-1.354 3.117-3.019v-3.019z" />
      <path d="M8.148 15.961H3.559c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.981zM3.559 8.451c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.451z" />
      <path d="M8.148 8.981H3.559C1.083 8.981-.931 6.966-.931 4.49S1.083 0 3.559 0h4.588v8.981zM3.559 1.471c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V1.471z" />
      <path d="M15.852 15.961h-4.588V6.98h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491m-3.117-7.51v6.039h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117z" />
    </svg>
  ),
);
FigmaIcon.displayName = "FigmaIcon";

/* ── Competitor brand marks (simplified monograms) ── */

export const CrewAIMark = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.2" fill="currentColor" />
      <path d="M6.5 17.5c1.2-2.5 3.3-4 5.5-4s4.3 1.5 5.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
);
CrewAIMark.displayName = "CrewAIMark";

export const LangChainMark = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="2" y="9" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="12" y="9" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
);
LangChainMark.displayName = "LangChainMark";

export const N8nMark = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <path d="M5 12h7M12 6v12M12 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  ),
);
N8nMark.displayName = "N8nMark";

export const AutoGenMark = forwardRef(
  ({ size = 24, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 2 L22 8 V16 L12 22 L2 16 V8 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 14 L12 7 L16 14 M9.5 11.5 H14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
);
AutoGenMark.displayName = "AutoGenMark";

/* Re-export with LucideIcon-compatible type for use in typed data structures */
export const Github = GithubIcon as unknown as LucideIcon;
export const Twitter = TwitterIcon as unknown as LucideIcon;
export const Discord = DiscordIcon as unknown as LucideIcon;
export const Figma = FigmaIcon as unknown as LucideIcon;
export const CrewAI = CrewAIMark as unknown as LucideIcon;
export const LangChain = LangChainMark as unknown as LucideIcon;
export const N8n = N8nMark as unknown as LucideIcon;
export const AutoGen = AutoGenMark as unknown as LucideIcon;
