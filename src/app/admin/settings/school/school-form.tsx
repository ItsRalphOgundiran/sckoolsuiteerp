"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building2, Mail, Phone, MapPin, Globe, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "School name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  address: z.string().min(10, "Address is required"),
  website: z.string().optional(),
  motto: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SchoolFormProps {
  school: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string | null;
    motto: string | null;
  } | null;
  isSuperAdmin: boolean;
}

export function SchoolForm({ school, isSuperAdmin }: SchoolFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: school?.name ?? "",
      email: school?.email ?? "",
      phone: school?.phone ?? "",
      address: school?.address ?? "",
      website: school?.website ?? "",
      motto: school?.motto ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value) formData.set(key, value);
        });

        const res = await fetch("/api/admin/school", {
          method: school ? "PUT" : "POST",
          body: formData,
        });

        const result = await res.json();

        if (!res.ok) {
          setError("root", { message: result.error || "Failed to save school" });
          return;
        }

        // If Super Admin creating first school, continue to setup wizard for academic session
        if (!school && isSuperAdmin) {
          router.push("/setup");
        } else {
          router.refresh();
        }
      } catch {
        setError("root", { message: "Something went wrong. Please try again." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">School Name *</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="name"
              placeholder="e.g., Excellence Academy"
              className="pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">School Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="info@school.edu"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="phone">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="phone"
              placeholder="+234 801 234 5678"
              className="pl-10"
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="website">Website (optional)</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="website"
              placeholder="www.school.edu"
              className="pl-10"
              {...register("website")}
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="address">Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="address"
              placeholder="123 School Street, City, State"
              className="pl-10"
              {...register("address")}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="motto">School Motto (optional)</label>
          <div className="relative">
            <Quote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="motto"
              placeholder="Excellence, Discipline, Integrity"
              className="pl-10"
              {...register("motto")}
            />
          </div>
        </div>
      </div>

      {errors.root && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={pending}
        >
          {pending 
            ? (school ? "Saving..." : "Creating School...") 
            : (school ? "Save Changes" : "Create School")}
        </Button>
        
        {school && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/settings")}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
