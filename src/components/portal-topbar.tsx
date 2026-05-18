"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Bell, ChevronDown, ChevronRight, Moon, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";

const THEME_EVENT = "sckoolsuite-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("ui-theme") === "dark" ? "dark" : "light";
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_EVENT, handler as EventListener);
  };
}

export function PortalTopbar({
  pathname,
  userName,
}: {
  pathname: string;
  userName: string;
}) {
  const [notifications] = useState(3);
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light");
  const dark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const crumbs = useMemo(() => {
    return pathname
      .split("/")
      .filter(Boolean)
      .map((item, index) => {
        if (index === 0 && item.toLowerCase() === "admin") return "Home";
        return item
          .replaceAll("-", " ")
          .split(" ")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      });
  }, [pathname]);

  const userInitials = useMemo(() => {
    return userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [userName]);

  const displayName = useMemo(() => {
    const parts = userName.split(" ").filter(Boolean);
    return parts[0] ?? userName;
  }, [userName]);

  const systemStrength = 88;
  const systemStatus = systemStrength >= 85 ? "Operational" : systemStrength >= 65 ? "Stable" : "Attention";

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    window.localStorage.setItem("ui-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {crumbs.length ? (
            crumbs.map((crumb, index) => (
              <div key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                <span
                  className={
                    index === crumbs.length - 1
                      ? "rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                      : "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }
                >
                  {crumb}
                </span>
                {index < crumbs.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> : null}
              </div>
            ))
          ) : (
            <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">Dashboard</span>
          )}
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-900/70 dark:bg-emerald-950/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">System {systemStatus}</span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400">{systemStrength}%</span>
        </div>
      </div>

      <div className="glass-soft flex w-full items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input className="h-9 w-44 rounded-lg border-slate-200 bg-white pl-9 text-sm md:w-72 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500" placeholder="Quick search" />
        </div>

        <button
          type="button"
          className="relative rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications ? <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{notifications}</span> : null}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <details className="group relative ml-auto">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 pr-2 text-sm text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-semibold text-white dark:bg-slate-700">
              {userInitials || "U"}
            </span>
            <span className="max-w-32 truncate font-semibold text-slate-700 dark:text-slate-100">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-300">My Profile</p>
            <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-300">Account Settings</p>
            <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-300">Help Center</p>
          </div>
        </details>
      </div>
    </div>
  );
}
