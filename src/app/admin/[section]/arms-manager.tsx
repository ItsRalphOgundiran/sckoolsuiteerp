"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  UsersRound, 
  GraduationCap, 
  Plus,
  Search,
  X,
  School
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ClassArm = {
  id: string;
  name: string;
  classId: string;
  className: string;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
};

type ClassOption = {
  id: string;
  name: string;
};

export function ArmsManager() {
  const [arms, setArms] = useState<ClassArm[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ classId: "", name: "" });

  // Analytics
  const stats = useMemo(() => {
    const total = arms.length;
    const active = arms.filter(a => a.isActive).length;
    const withStudents = arms.filter(a => a.studentCount > 0).length;
    const totalStudents = arms.reduce((acc, a) => acc + a.studentCount, 0);
    return { total, active, withStudents, totalStudents };
  }, [arms]);

  const filteredArms = useMemo(() => {
    if (!searchQuery.trim()) return arms;
    const query = searchQuery.toLowerCase();
    return arms.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.className.toLowerCase().includes(query)
    );
  }, [arms, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const doLoad = async () => {
      setLoading(true);
      setStatus("");
      try {
        const [armsRes, classesRes] = await Promise.all([
          fetch("/api/admin/class-arms", { cache: "no-store" }),
          fetch("/api/admin/classes", { cache: "no-store" }),
        ]);
        
        const armsData = await armsRes.json().catch(() => []);
        const classesData = await classesRes.json().catch(() => []);
        
        if (!cancelled) {
          setArms(armsData.arms ?? []);
          setClasses(classesData.classes ?? []);
        }
      } catch {
        if (!cancelled) setStatus("Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doLoad();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit() {
    if (!form.classId || !form.name.trim()) {
      setStatus("Please select a class and enter arm name.");
      return;
    }
    
    setStatus("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/class-arms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus(data.error || "Failed to create arm.");
        return;
      }

      setForm({ classId: "", name: "" });
      setShowForm(false);
      setStatus("Arm created successfully.");
      
      // Reload data
      const armsRes = await fetch("/api/admin/class-arms", { cache: "no-store" });
      const armsData = await armsRes.json().catch(() => []);
      setArms(armsData.arms ?? []);
    } catch {
      setStatus("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!window.confirm("Deactivate this arm?")) return;
    setStatus("");
    try {
      const response = await fetch(`/api/admin/class-arms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!response.ok) throw new Error("Failed");
      setStatus("Arm deactivated.");
      const armsRes = await fetch("/api/admin/class-arms", { cache: "no-store" });
      const armsData = await armsRes.json().catch(() => []);
      setArms(armsData.arms ?? []);
    } catch {
      setStatus("Failed to deactivate.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading arms data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          status.includes("success") || status.includes("created")
            ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
            : "border-rose-200 bg-rose-50 text-rose-700"
        )}>
          {status}
        </div>
      )}

      {/* Module Scope */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Arms Management Scope</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Create Arms</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Arm A, B, C</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Class Binding</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Capacity Setting</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Manage Arms</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">View Students</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Arm Status</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Reassignment</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Arm Analytics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Student Count</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Distribution</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Arms</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3">
              <UsersRound className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Arms</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.total - stats.active} inactive</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <School className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">With Students</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.withStudents}</p>
              <p className="text-xs text-slate-500 mt-1">arms populated</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
              <p className="text-xs text-slate-500 mt-1">across all arms</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <UsersRound className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search arms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancel" : "Create New Arm"}
        </Button>
      </div>

      {/* Create Arm Form */}
      {showForm && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Arm</h3>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                value={form.classId}
                onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arm Name</label>
              <Input
                placeholder="e.g., A, B, C, Gold, Silver"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !form.classId || !form.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? "Creating..." : "Create Arm"}
            </Button>
          </div>
        </div>
      )}

      {/* Arms Table */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Class Arms</h2>
          <span className="text-sm text-slate-500">{filteredArms.length} of {arms.length} arms</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3 font-medium">Arm</th>
                <th className="px-6 py-3 font-medium">Class</th>
                <th className="px-6 py-3 font-medium">Students</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-slate-100 p-3">
                        <UsersRound className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>No arms found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArms.map((arm) => (
                  <tr key={arm.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {arm.name}
                        </div>
                        <span className="font-medium text-slate-900">Arm {arm.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{arm.className}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        arm.studentCount > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {arm.studentCount} students
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        arm.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {arm.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {arm.isActive && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeactivate(arm.id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
