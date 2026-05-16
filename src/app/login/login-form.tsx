"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/login/actions";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (!result.ok) {
        setError("root", { message: result.message });
      }
    });
  };

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <Input type="email" placeholder="you@school.com" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <Input type="password" placeholder="Enter your password" {...register("password")} />
        {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
      </div>
      <div className="flex items-center justify-end text-xs sm:text-sm">
        <button type="button" className="font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</button>
      </div>
      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
      <Button type="submit" className="h-11 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold" disabled={pending}>
        {pending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="relative py-1 text-center text-[11px] text-slate-500">
        <span className="bg-white px-2">or continue with</span>
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">Facebook</button>
        <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">Google</button>
      </div>
    </form>
  );
}
