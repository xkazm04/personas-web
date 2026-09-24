"use client";

import { useHashArrival } from "@/hooks/useHashArrival";

/** Client leaf for the server-rendered home page: lands `/#download` and every
 *  other declared home address on its (lazy) section. Renders nothing. */
export default function LandingHashArrival() {
  useHashArrival();
  return null;
}
