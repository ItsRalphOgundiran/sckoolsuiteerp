"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserStepProps {
  onComplete: (user: { name: string; email: string; password: string }) => void;
  onBack: () => void;
  isLoading: boolean;
  initialData: { name: string; email: string; password: string } | null;
}

export function UserStep({ onComplete, onBack, isLoading, initialData }: UserStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!email.includes("@")) newErrors.email = "Valid email is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete({ name, email, password });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 4: Create Admin User</h2>
        <p className="text-slate-500">Create the school administrator account. You will use this to login.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-violet-50 border border-violet-100 p-4 mb-4">
          <div className="flex items-center gap-2 text-violet-700">
            <User className="h-5 w-5" />
            <span className="font-medium">Administrator Account</span>
          </div>
          <p className="text-sm text-violet-600 mt-1">
            This will be your main login account for managing the school
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name *</label>
            <Input
              name="name"
              placeholder="e.g., John Smith"
              disabled={isLoading}
              defaultValue={initialData?.name ?? ""}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address *</label>
            <Input
              name="email"
              type="email"
              placeholder="admin@school.edu"
              disabled={isLoading}
              defaultValue={initialData?.email ?? ""}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password *</label>
            <Input
              name="password"
              type="password"
              placeholder="Min 6 characters"
              disabled={isLoading}
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirm Password *</label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Term
          </Button>
          <Button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700"
            disabled={isLoading}
          >
            Continue to Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
