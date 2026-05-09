"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, LayoutDashboard, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RouteItem {
  label: string;
  href: string;
}

interface NavbarMobileMenuProps {
  open: boolean;
  routes: RouteItem[];
  pathname: string;
  isAuthenticated: boolean;
  isSigningIn?: boolean;
  signInWithGoogle: () => Promise<void>;
  onClose: () => void;
}

export default function NavbarMobileMenu({
  open,
  routes,
  pathname,
  isAuthenticated,
  isSigningIn,
  signInWithGoogle,
  onClose,
}: NavbarMobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm sm:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col border-l border-glass bg-background/95 backdrop-blur-2xl sm:hidden"
          >
            <div className="flex items-center justify-between border-b border-glass px-5 py-4">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/imgs/logo.png"
                  alt="Personas logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                />
                <span className="text-base font-semibold tracking-tight">Personas</span>
              </Link>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg border border-glass-hover bg-white/2 p-1.5 text-muted transition-colors hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <nav className="space-y-1">
                {routes.map((route) => {
                  const isActive = pathname === route.href;
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={onClose}
                      className={`flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-brand-cyan/8 text-brand-cyan border border-brand-cyan/15"
                          : "text-muted hover:text-foreground hover:bg-white/4 border border-transparent"
                      }`}
                    >
                      {route.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-glass px-5 py-5 space-y-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-3 text-base font-medium text-brand-cyan transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-cyan/12"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      void signInWithGoogle();
                    }}
                    disabled={isSigningIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-glass-hover bg-white/4 px-4 py-3 text-base font-medium text-foreground transition-all duration-200 hover:border-white/20 hover:bg-white/8 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                  <Link
                    href="/#download"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-3 text-base font-medium text-brand-cyan transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-cyan/12"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
