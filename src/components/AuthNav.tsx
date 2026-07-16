"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfigError } from "@/lib/supabase/config";
import type { User } from "@supabase/supabase-js";

export default function AuthNav() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const configError = useMemo(() => getSupabaseConfigError(), []);

  useEffect(() => {
    if (configError) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configError]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setConfirmOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, confirmOpen]);

  async function signOut() {
    if (configError) return;

    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    setConfirmOpen(false);
    setIsSigningOut(false);
    router.refresh();
  }

  if (isLoading) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />;
  }

  if (user) {
    const label =
      user.user_metadata.full_name ??
      user.user_metadata.name ??
      user.email?.split("@")[0] ??
      "Account";

    return (
      <>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={[
              "flex max-w-[10rem] items-center gap-1.5 truncate rounded-lg px-3 py-2 text-sm font-medium transition",
              menuOpen
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
            ].join(" ")}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="truncate">{label}</span>
            <span className="text-xs text-zinc-400">{menuOpen ? "▴" : "▾"}</span>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>

        {confirmOpen ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="signout-title"
              className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            >
              <h2
                id="signout-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Sign out?
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to sign out of Unit Converter?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isSigningOut}
                  className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  disabled={isSigningOut}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/login"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
      >
        Sign up
      </Link>
    </div>
  );
}
