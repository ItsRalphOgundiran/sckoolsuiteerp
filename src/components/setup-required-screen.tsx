import Link from "next/link";

type SetupRequiredScreenProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export function SetupRequiredScreen({
  title,
  message,
  actionHref = "/login",
  actionLabel = "Go to Login",
}: SetupRequiredScreenProps) {
  return (
    <main className="glass-bg flex min-h-screen items-center justify-center px-4 py-8">
      <section className="glass-panel w-full max-w-xl rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Sckool Suite</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5">
          <Link href={actionHref} className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            {actionLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
