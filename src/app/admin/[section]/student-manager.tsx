"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  classId: string | null;
  className: string | null;
  parentId: string | null;
  parentName: string | null;
  sportHouse: string | null;
  coCurricular: string | null;
  responsibilities: string | null;
  passportUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type ClassOption = { id: string; name: string };
type ParentOption = { id: string; name: string; email: string };
type Gender = "MALE" | "FEMALE" | "OTHER";

type StudentForm = {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  age: string;
  classId: string;
  parentId: string;
  sportHouse: string;
  coCurricular: string;
  responsibilities: string;
};

const emptyStudent: StudentForm = {
  name: "",
  email: "",
  password: "",
  gender: "MALE",
  age: "",
  classId: "",
  parentId: "",
  sportHouse: "",
  coCurricular: "",
  responsibilities: "",
};

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<StudentForm>(emptyStudent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.className?.toLowerCase().includes(query) ||
        s.parentName?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  async function loadData() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/students", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload?.error ?? "Unable to load students.");
        return;
      }
      setStudents(payload.students ?? []);
      setClasses(payload.classes ?? []);
      setParents(payload.parents ?? []);
    } catch {
      setStatus("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit() {
    setStatus("");
    setSubmitting(true);

    const body = {
      ...form,
      age: Number(form.age) || 0,
      classId: form.classId || null,
      parentId: form.parentId || null,
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `/api/admin/students/${editingId}` : "/api/admin/students";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? `Failed to ${isEditing ? "update" : "create"} student.`);
        return;
      }

      setForm(emptyStudent);
      setEditingId(null);
      setStatus(`Student ${isEditing ? "updated" : "created"} successfully.`);
      await loadData();
    } catch {
      setStatus("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!window.confirm("Deactivate this student? They will no longer be able to log in.")) {
      return;
    }

    setStatus("");
    try {
      const response = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to deactivate student.");
        return;
      }

      setStatus("Student deactivated.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      gender: student.gender as "MALE" | "FEMALE" | "OTHER",
      age: String(student.age),
      classId: student.classId ?? "",
      parentId: student.parentId ?? "",
      sportHouse: student.sportHouse ?? "",
      coCurricular: student.coCurricular ?? "",
      responsibilities: student.responsibilities ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyStudent);
    setStatus("");
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      {status ? (
        <div className={`rounded-lg border px-3 py-2 text-sm ${status.includes("success") || status.includes("created") || status.includes("updated") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {status}
        </div>
      ) : null}

      {/* Search and Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name, email, class or parent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingId(null);
            setForm(emptyStudent);
            setStatus("");
          }}
        >
          + New Student
        </Button>
      </div>

      {/* Student Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          {editingId ? "Edit Student" : "Add New Student"}
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Full name *"
          />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email address *"
            disabled={editingId !== null}
          />
          {!editingId && (
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Password (optional, default: email prefix + 123)"
            />
          )}
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.gender}
            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" }))}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <Input
            type="number"
            value={form.age}
            onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
            placeholder="Age *"
            min={3}
            max={30}
          />
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.classId}
            onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.parentId}
            onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
          >
            <option value="">Select parent/guardian</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <Input
            value={form.sportHouse}
            onChange={(e) => setForm((prev) => ({ ...prev, sportHouse: e.target.value }))}
            placeholder="Sport house (optional)"
          />
          <Input
            value={form.coCurricular}
            onChange={(e) => setForm((prev) => ({ ...prev, coCurricular: e.target.value }))}
            placeholder="Co-curricular activity (optional)"
          />
          <Input
            value={form.responsibilities}
            onChange={(e) => setForm((prev) => ({ ...prev, responsibilities: e.target.value }))}
            placeholder="Responsibilities (optional)"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Student" : "Create Student"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Students ({filteredStudents.length} of {students.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Gender</th>
                <th className="px-2 py-2">Age</th>
                <th className="px-2 py-2">Class</th>
                <th className="px-2 py-2">Parent</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-4 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-2 font-medium text-slate-900">{student.name}</td>
                    <td className="px-2 py-2 text-slate-600">{student.email}</td>
                    <td className="px-2 py-2">{student.gender}</td>
                    <td className="px-2 py-2">{student.age}</td>
                    <td className="px-2 py-2">{student.className ?? "-"}</td>
                    <td className="px-2 py-2">{student.parentName ?? "-"}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          student.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(student)}>
                          Edit
                        </Button>
                        {student.isActive && (
                          <Button size="sm" variant="outline" onClick={() => handleDeactivate(student.id)}>
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
