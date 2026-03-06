"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const pathname = usePathname();
  const shouldInitializeAuth = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!shouldInitializeAuth) return;
    const cleanup = initialize();
    return cleanup;
  }, [initialize, shouldInitializeAuth]);

  return <>{children}</>;
}
