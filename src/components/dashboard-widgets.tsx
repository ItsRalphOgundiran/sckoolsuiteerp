import Link from "next/link";
import { ArrowUpRight, BellDot, Sparkles, Zap } from "lucide-react";

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

// Vibrant gradient palette — cycles across cards
const CARD_GRADIENTS = [
  { bg: "from-orange-500 to-amber-400",   icon: "bg-orange-600/30",  accent: "text-orange-100" },
  { bg: "from-emerald-500 to-teal-400",   icon: "bg-emerald-600/30", accent: "text-emerald-100" },
  { bg: "from-blue-600 to-indigo-500",    icon: "bg-blue-700/30",    accent: "text-blue-100" },
  { bg: "from-violet-600 to-purple-500",  icon: "bg-violet-700/30",  accent: "text-violet-100" },
  { bg: "from-rose-500 to-pink-400",      icon: "bg-rose-600/30",    accent: "text-rose-100" },
  { bg: "from-cyan-500 to-sky-400",       icon: "bg-cyan-600/30",    accent: "text-cyan-100" },
  { bg: "from-amber-500 to-yellow-400",   icon: "bg-amber-600/30",   accent: "text-amber-100" },
  { bg: "from-green-600 to-lime-500",     icon: "bg-green-700/30",   accent: "text-green-100" },
];

const QA_COLORS = [
  "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
  "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600",
  "bg-gradient-to-br from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700",
  "bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600",
  "bg-gradient-to-br from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600",
  "bg-gradient-to-br from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600",
];

const FEED_ACCENTS = [
  "border-l-blue-500 bg-blue-50 dark:bg-blue-950/40",
  "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
  "border-l-violet-500 bg-violet-50 dark:bg-violet-950/40",
  "border-l-amber-500 bg-amber-50 dark:bg-amber-950/40",
  "border-l-rose-500 bg-rose-50 dark:bg-rose-950/40",
  "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-950/40",
];

export function DashboardHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] via-[#1a3a6e] to-[var(--brand-secondary)] p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Workspace Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/80">{subtitle}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          Enterprise Intelligence
        </button>
      </div>
    </section>
  );
}

export function DashboardStatCards({ items }: { items: StatCardItem[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const g = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
        return (
          <article key={item.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.bg} p-5 text-white shadow-md`}>
            {/* decorative circle */}
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${g.icon}`} />
            <p className={`text-[11px] font-semibold uppercase tracking-widest ${g.accent}`}>{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold leading-none text-white">{item.value}</p>
            <p className={`mt-1.5 text-xs ${g.accent}`}>{item.hint}</p>
            {item.trend && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[11px] font-semibold text-white">
                <ArrowUpRight className="h-3 w-3" />{item.trend}
              </span>
            )}
          </article>
        );
      })}
    </section>
  );
}

export function DashboardQuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
        <Zap className="h-4 w-4 text-amber-500" />
        Quick Actions
      </h3>
      {items.length ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={`rounded-xl px-3 py-3 text-center text-sm font-semibold shadow-sm transition-all ${QA_COLORS[i % QA_COLORS.length]}`}
            >
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
  const barColors = ["from-blue-500 to-indigo-400", "from-emerald-500 to-teal-400", "from-rose-500 to-pink-400", "from-amber-500 to-yellow-400", "from-violet-500 to-purple-400", "from-cyan-500 to-sky-400"];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {data.length ? (
        <div className="space-y-3">
          {data.map((item, i) => {
            const width = (item.value / max) * 100;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${barColors[i % barColors.length]}`}
                    style={{ width: `${width}%` }}
                  />
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <article key={item.id} className={`rounded-xl border-l-4 p-3 ${FEED_ACCENTS[i % FEED_ACCENTS.length]}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{item.time}</p>
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
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-amber-900 dark:text-amber-200">
        <BellDot className="h-4 w-4 text-amber-500" />
        Announcements &amp; Events
      </h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-amber-200 bg-white px-4 py-3 dark:border-amber-800/40 dark:bg-slate-800/70">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{item.detail}</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{item.time}</p>
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
  const urgencyStyle: Record<string, string> = {
    Now:       "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    Today:     "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    Tomorrow:  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    Soon:      "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  };
  const defaultBadge = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Pending Tasks</h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700/40">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
              <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${urgencyStyle[item.time] ?? defaultBadge}`}>{item.time}</span>
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
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">{message}</div>;
}

