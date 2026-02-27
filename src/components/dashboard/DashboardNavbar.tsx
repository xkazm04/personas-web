"use client";

import { motion } from "framer-motion";
import { LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GradientText from "@/components/GradientText";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardNavbar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "User";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/20 backdrop-blur-3xl"
    >
      <nav className="mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/imgs/logo.png"
              alt="Personas"
              width={28}
              height={28}
              className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Personas
            </span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-dark" />
          <GradientText className="text-sm font-medium">
            Dashboard
          </GradientText>
        </div>

        {/* Right: User + sign-out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full border border-white/[0.1]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-brand-cyan/10 text-xs font-medium text-brand-cyan">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm text-muted sm:inline">
              {displayName}
            </span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-foreground"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
