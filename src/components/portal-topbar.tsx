"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PortalTopbar({ pathname, userName }: { pathname: string; userName: string }) {
  const [dark, setDark] = useState(false);
  const [notifications] = useState(3);

  useEffect(() => {
    const initial = window.localStorage.getItem("ui-theme") === "dark";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const crumbs = useMemo(() => {
    return pathname
      .split("/")
      .filter(Boolean)
      .map((item) => item.replaceAll("-", " "));
  }, [pathname]);

  function toggleTheme() {
    setDark((value) => {
      const next = !value;
      window.localStorage.setItem("ui-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Breadcrumbs</p>
        <p className="text-sm text-slate-700">{crumbs.length ? crumbs.join(" / ") : "dashboard"}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input className="h-8 w-40 pl-7 md:w-56" placeholder="Quick search" />
        </div>

        <button
          type="button"
          className="relative rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications ? <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{notifications}</span> : null}
        </button>

        <button type="button" onClick={toggleTheme} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-700" aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700">
            {userName}
            <ChevronDown className="h-3.5 w-3.5" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-xs text-slate-500">My Profile</p>
            <p className="px-2 py-1 text-xs text-slate-500">Account Settings</p>
            <p className="px-2 py-1 text-xs text-slate-500">Help Center</p>
          </div>
        </details>
      </div>
    </div>
  );
}
