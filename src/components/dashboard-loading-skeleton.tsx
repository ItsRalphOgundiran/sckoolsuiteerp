export function DashboardLoadingSkeleton() {
  return (
    <div className="glass-bg min-h-screen p-4">
      <div className="mx-auto max-w-[1440px] space-y-4">
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-72 animate-pulse rounded-2xl bg-white/70" />
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-white/70 xl:col-span-1" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    </div>
  );
}
