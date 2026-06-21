"use client";

import { motion } from "framer-motion";
import { Plus, LogIn, LogOut, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Category = "all" | "sea" | "streets" | "architecture";

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sea", label: "Sea" },
  { key: "streets", label: "Streets" },
  { key: "architecture", label: "Architecture" },
];

interface HeaderProps {
  active: Category;
  onChange: (c: Category) => void;
  visible: boolean;
  showAddPhoto?: boolean;
  onAddPhoto?: () => void;
  user?: User | null;
  onSignIn?: () => void;
}

export default function Header({
  active,
  onChange,
  visible,
  showAddPhoto,
  onAddPhoto,
  user,
  onSignIn,
}: HeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-40 w-full"
      initial={{ y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border-b border-surface-line/8 bg-ink/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 gap-2 sm:gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 select-none shrink-0 group cursor-pointer">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink transition-all duration-300">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" strokeWidth={2} />
            </div>
            <span className="font-display text-[15px] sm:text-lg tracking-widest text-bone">
              SARA<span className="text-gold">.</span>
            </span>
          </div>

          {/* Navigation Filters */}
          <div className="flex-1 min-w-0 flex justify-center mx-1 sm:mx-0">
            <nav className="relative flex items-center gap-1 rounded-full border border-surface-line/10 bg-surface/70 p-1 shadow-[0_1px_4px_rgba(54,44,40,0.04)] overflow-x-auto [&::-webkit-scrollbar]:hidden max-w-full">
              {FILTERS.map((f) => {
                const isActive = active === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => onChange(f.key)}
                    className={`relative px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-[13px] font-body rounded-full transition-colors duration-300 whitespace-nowrap shrink-0 ${
                      isActive ? "text-ink" : "text-bone-dim hover:text-bone"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="pill-bg"
                        className="absolute inset-0 rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{f.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {showAddPhoto && (
              <button
                onClick={onAddPhoto}
                className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto gap-1.5 rounded-full bg-gold hover:bg-gold-soft text-ink sm:px-4 sm:py-2 text-[12px] sm:text-[13px] font-medium transition-colors"
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Add Photo</span>
              </button>
            )}

            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                title={user.email ?? undefined}
                className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-2 gap-1.5 rounded-full border border-surface-line/15 text-bone-dim hover:text-bone hover:border-surface-line/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="hidden sm:inline text-[12px]">Sign out</span>
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-2 gap-1.5 rounded-full border border-surface-line/15 text-bone-dim hover:text-bone hover:border-surface-line/30 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="hidden sm:inline text-[12px]">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}