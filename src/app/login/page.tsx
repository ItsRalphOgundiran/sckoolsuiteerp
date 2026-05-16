import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "@/app/login/login-form";
import { APP_POWERED_BY, roleDefaultRoute } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(roleDefaultRoute[session.user.role] ?? "/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f4f6] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(109,76,255,0.18),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(147,197,253,0.16),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:p-5">
          <div className="grid gap-4 lg:grid-cols-[0.94fr_1fr]">
            <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#4f63e8_0%,#5970ee_48%,#6b7ffd_100%)] p-6 text-white lg:p-7">
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold">Sckool Suite</p>
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-3 py-1.5 text-sm">
                  <Globe className="h-4 w-4" /> English
                </button>
              </div>
              <h1 className="mt-8 max-w-xs text-3xl font-semibold leading-tight sm:text-4xl">Simplify school management.</h1>
              <p className="mt-3 max-w-xs text-sm text-indigo-100">Run academics, fees, and communication in one focused workspace.</p>
              <div className="mt-6 rounded-xl border border-white/30 bg-white/10 p-3 text-sm text-indigo-50">
                Built for teams that want speed and clarity.
              </div>
            </section>

            <Card className="border-slate-100 bg-white shadow-none">
              <CardHeader className="pb-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Secure Login</p>
                <CardTitle className="text-3xl leading-none sm:text-4xl">Welcome back</CardTitle>
                <CardDescription>Sign in to your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
                <div className="mt-4 text-center text-sm">
                  <Link href="/create-account" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Create school account
                  </Link>
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">{APP_POWERED_BY}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
