import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { signOut } from "@/auth";
import { APP_POWERED_BY } from "@/lib/constants";
import { navByRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AcademicContextSwitcher } from "@/components/academic-context-switcher";
import { PortalTopbar } from "@/components/portal-topbar";

export function PortalShell({
  role,
  schoolName,
  schoolLogoUrl,
  userName,
  pathname,
  currentSessionName,
  currentTermName,
  sessions,
  terms,
  selectedSessionId,
  selectedTermId,
  primaryColor,
  secondaryColor,
  children,
}: {
  role: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  userName: string;
  pathname: string;
  currentSessionName?: string | null;
  currentTermName?: string | null;
  sessions?: Array<{ id: string; name: string }>;
  terms?: Array<{ id: string; name: string; sessionId: string }>;
  selectedSessionId?: string | null;
  selectedTermId?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  children: React.ReactNode;
}) {
  const nav = navByRole[role] ?? [];
  const activeTermLabel = currentSessionName || currentTermName ? `${currentSessionName ?? "-"} / ${currentTermName ?? "-"}` : "No academic context selected";

  return (
    <div
      className="glass-bg min-h-screen"
      style={
        {
          "--brand-primary": primaryColor ?? "#0B1F4D",
          "--brand-secondary": secondaryColor ?? "#0E9F6E",
        } as Record<string, string>
      }
    >
      <input id="shell-collapse" type="checkbox" className="peer hidden" />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 py-4 transition-all duration-300 lg:[grid-template-columns:250px_1fr] peer-checked:lg:[grid-template-columns:90px_1fr]">
        <aside className="no-print glass-panel rounded-2xl p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="mb-5 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] p-4 text-white">
            <div className="mb-2 flex items-center gap-2">
              {schoolLogoUrl ? (
                <img
                  src={schoolLogoUrl}
                  alt={`${schoolName ?? "School"} logo`}
                  className="h-9 w-9 rounded-md border border-white/40 bg-white object-contain p-1"
                />
              ) : (
                <div className="h-9 w-9 rounded-md border border-white/30 bg-white/15" />
              )}
              <p className="text-sm opacity-90">Sckool Suite</p>
            </div>
            <h2 className="text-base font-semibold leading-tight peer-checked:hidden">{schoolName ?? "Platform Portal"}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide peer-checked:hidden">{role.replaceAll("_", " ")}</p>
          </div>
          <label
            htmlFor="shell-collapse"
            className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 py-2 text-xs text-slate-600 hover:bg-white"
          >
            <PanelLeftClose className="h-4 w-4 peer-checked:hidden" />
            <PanelLeftOpen className="hidden h-4 w-4 peer-checked:block" />
            <span className="nav-label">Collapse Sidebar</span>
          </label>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-slate-900"
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="nav-label peer-checked:hidden">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" />
              <span className="nav-label peer-checked:hidden">Sign out</span>
            </button>
          </form>
        </aside>

        <main className="space-y-4">
          <header className="no-print glass-panel rounded-2xl px-4 py-3">
            <div className="mb-3">
              <PortalTopbar pathname={pathname} userName={userName} />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Welcome back</p>
                <h1 className="text-xl font-semibold text-slate-900">{userName}</h1>
                <p className="text-xs text-slate-500">Current: {activeTermLabel}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {sessions && terms ? (
                  <AcademicContextSwitcher
                    sessions={sessions}
                    terms={terms}
                    initialSessionId={selectedSessionId}
                    initialTermId={selectedTermId}
                  />
                ) : null}
                <p className="text-[11px] text-slate-500">{APP_POWERED_BY}</p>
              </div>
            </div>
          </header>
          {children}

          <footer className="glass-panel rounded-2xl px-4 py-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>{schoolName ?? "Sckool Suite"} • Copyright {new Date().getFullYear()}</p>
              <p>Academic Context: {activeTermLabel}</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
