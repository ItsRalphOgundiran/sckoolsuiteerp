"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TermStepProps {
  schoolId: string;
  sessionId: string;
  onComplete: (term: { id: string; name: string }) => void;
  onBack: () => void;
  isLoading: boolean;
  initialData: { id: string; name: string } | null;
}

export function TermStep({ schoolId, sessionId, onComplete, onBack, isLoading, initialData }: TermStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("termName") || "").trim();
    const startDate = String(formData.get("termStart") || "");
    const endDate = String(formData.get("termEnd") || "");

    const newErrors: Record<string, string> = {};
    if (!name) newErrors.termName = "Term name is required";
    if (!startDate) newErrors.termStart = "Start date is required";
    if (!endDate) newErrors.termEnd = "End date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("/api/setup/term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          sessionId,
          name,
          startDate,
          endDate,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrors({ submit: result.error || `Error: ${res.status}` });
        return;
      }
      if (result.id) {
        onComplete({ id: result.id, name: result.name || name });
      } else {
        setErrors({ submit: "Invalid response from server" });
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Failed to create term" });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Step 3: Academic Term</h2>
        <p className="text-slate-500">Create your first term within the academic session. This will be saved immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 mb-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Academic Term</span>
          </div>
          <p className="text-sm text-emerald-600 mt-1">
            Create the first term (e.g., First Term, Second Term, Third Term)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Term Name *</label>
            <Input
              name="termName"
              placeholder="e.g., First Term"
              disabled={isLoading}
              defaultValue={initialData?.name ?? ""}
            />
            {errors.termName && <p className="text-xs text-red-600">{errors.termName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Start Date *</label>
            <Input
              name="termStart"
              type="date"
              disabled={isLoading}
            />
            {errors.termStart && <p className="text-xs text-red-600">{errors.termStart}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">End Date *</label>
            <Input
              name="termEnd"
              type="date"
              disabled={isLoading}
            />
            {errors.termEnd && <p className="text-xs text-red-600">{errors.termEnd}</p>}
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
            Back to Session
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            Save Term & Continue to Admin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
