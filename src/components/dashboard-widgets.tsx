import Link from "next/link";
import { ArrowUpRight, BellDot, Sparkles } from "lucide-react";

export type StatCardItem = {
  label: string;
  value: string;
  hint: string;
  trend?: string;
};

export type QuickActionItem = {
  label: string;
  href: string;
};

export type SeriesItem = {
  label: string;
  value: number;
};

export type FeedItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export function DashboardHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace Overview</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="metric-chip inline-flex items-center gap-1 text-xs text-slate-600">
          <Sparkles className="h-3.5 w-3.5" />
          Enterprise Intelligence
        </div>
      </div>
    </section>
  );
}

export function DashboardStatCards({ items }: { items: StatCardItem[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="glass-panel rounded-2xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
          {item.trend ? <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white"><ArrowUpRight className="h-3 w-3" />{item.trend}</p> : null}
        </article>
      ))}
    </section>
  );
}

export function DashboardQuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Quick Actions</h3>
      {items.length ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <Link key={item.label + item.href} href={item.href} className="glass-soft rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">
              {item.label}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message="No quick actions configured for this role." />
      )}
    </section>
  );
}

export function DashboardSeries({ title, subtitle, data }: { title: string; subtitle: string; data: SeriesItem[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <section className="glass-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {data.length ? (
        <div className="space-y-2">
          {data.map((item) => {
            const width = (item.value / max) * 100;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="No analytics data available for this period." />
      )}
    </section>
  );
}

export function ActivityFeed({ title, items }: { title: string; items: FeedItem[] }) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="glass-soft rounded-xl p-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
              <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState message="No recent activity yet." />
      )}
    </section>
  );
}

export function AnnouncementWidget({ items }: { items: FeedItem[] }) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><BellDot className="h-4 w-4" />Announcements & Events</h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white/70 p-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.detail}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState message="No announcements available." />
      )}
    </section>
  );
}

export function TaskWidget({ items }: { items: FeedItem[] }) {
  return (
    <section className="glass-panel rounded-2xl p-4">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Pending Tasks</h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white/70 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-[11px] text-amber-800">{item.time}</span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState message="No pending tasks right now." />
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">{message}</div>;
}
