/**
 * Where `/demo` hands the visitor: always the Board (`/dashboard/personas`,
 * the dashboard's main view), carrying the query along. `?tour=1` (the
 * /features bridge) starts the guided tour there: its first step is the Board,
 * and the dashboard layout's `TourAutostart` picks the flag up on any view.
 */
export const DEMO_LANDING = "/dashboard/personas";

export function demoEntryTarget(search: string): string {
  return `${DEMO_LANDING}${search}`;
}
