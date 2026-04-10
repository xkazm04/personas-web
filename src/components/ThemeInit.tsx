"use client";

import { useEffect, useRef } from "react";
import { initRandomTheme } from "@/stores/themeStore";

export default function ThemeInit() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    initRandomTheme();
  }, []);
  return null;
}
