"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogIn, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthToast() {
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const clearSessionExpired = useAuthStore((s) => s.clearSessionExpired);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  useEffect(() => {
    if (!sessionExpired) return;
    const timer = setTimeout(clearSessionExpired, 8000);
    return () => clearTimeout(timer);
  }, [sessionExpired, clearSessionExpired]);

  if (!sessionExpired) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl min-w-[300px]">
        <LogIn className="h-4 w-4 text-amber-400 flex-shrink-0" />
        <span className="text-sm text-foreground">
          Session expired, please sign in again
        </span>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              clearSessionExpired();
              void signInWithGoogle();
            }}
            className="flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
          >
            Sign in
          </button>
          <button
            onClick={clearSessionExpired}
            className="rounded-lg p-1.5 text-muted-dark hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
