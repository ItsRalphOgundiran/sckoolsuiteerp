"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ClassItem = {
  id: string;
  name: string;
  classGroupId: string | null;
  classGroupName: string | null;
  teacherId: string | null;
  teacherName: string | null;
  arms: { id: string; name: string; isActive: boolean }[];
  students: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  studentCount: number;
  createdAt: string;
};

type Option = { id: string; name: string };

const emptyClass = {
  name: "",
  classGroupId: "",
};

export function ClassManager() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classGroups, setClassGroups] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyClass);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newArmName, setNewArmName] = useState("");
  const [addingArmForClass, setAddingArmForClass] = useState<string | null>(null);

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const query = searchQuery.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.classGroupName?.toLowerCase().includes(query) ||
        c.teacherName?.toLowerCase().includes(query)
    );
  }, [classes, searchQuery]);

  async function loadData() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/classes", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload?.error ?? "Unable to load classes.");
        return;
      }
      setClasses(payload.classes ?? []);
      setClassGroups(payload.classGroups ?? []);
      setTeachers(payload.teachers ?? []);
      setSubjects(payload.subjects ?? []);
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
      classGroupId: form.classGroupId || null,
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `/api/admin/classes/${editingId}` : "/api/admin/classes";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? `Failed to ${isEditing ? "update" : "create"} class.`);
        return;
      }

      setForm(emptyClass);
      setEditingId(null);
      setStatus(`Class ${isEditing ? "updated" : "created"} successfully.`);
      await loadData();
    } catch {
      setStatus("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddArm(classId: string) {
    if (!newArmName.trim()) return;

    setStatus("");
    setAddingArmForClass(classId);
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ armName: newArmName.trim(), action: "ADD_ARM" }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to add arm.");
        return;
      }

      setNewArmName("");
      setStatus("Arm added successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    } finally {
      setAddingArmForClass(null);
    }
  }

  async function handleRemoveArm(classId: string, armName: string) {
    if (!window.confirm(`Remove arm "${armName}" from this class?`)) return;

    setStatus("");
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ armName, action: "REMOVE_ARM" }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to remove arm.");
        return;
      }

      setStatus("Arm removed successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  async function handleAssignSubject(classId: string, subjectId: string) {
    setStatus("");
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, action: "ADD_SUBJECT" }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to add subject.");
        return;
      }

      setStatus("Subject added to class successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  async function handleRemoveSubject(classId: string, subjectId: string) {
    if (!window.confirm("Remove this subject from the class?")) return;

    setStatus("");
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, action: "REMOVE_SUBJECT" }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to remove subject.");
        return;
      }

      setStatus("Subject removed from class successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  async function handleAssignTeacher(classId: string, teacherId: string) {
    setStatus("");
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to assign teacher.");
        return;
      }

      setStatus("Teacher assigned successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete class "${name}"? This cannot be undone.`)) {
      return;
    }

    setStatus("");
    try {
      const response = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to delete class.");
        return;
      }

      setStatus("Class deleted.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  function startEdit(cls: ClassItem) {
    setEditingId(cls.id);
    setForm({
      name: cls.name,
      classGroupId: cls.classGroupId ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyClass);
    setStatus("");
  }

  // Get unassigned subjects for a class
  const getUnassignedSubjects = (cls: ClassItem) => {
    const assignedIds = new Set(cls.subjects.map((s) => s.id));
    return subjects.filter((s) => !assignedIds.has(s.id));
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading classes...</div>;
  }

  return (
    <div className="space-y-4">
      {status ? (
        <div className={`rounded-lg border px-3 py-2 text-sm ${status.includes("success") || status.includes("created") || status.includes("updated") || status.includes("added") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {status}
        </div>
      ) : null}

      {/* Search and Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name, group, or teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingId(null);
            setForm(emptyClass);
            setStatus("");
          }}
        >
          + New Class
        </Button>
      </div>

      {/* Class Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          {editingId ? "Edit Class" : "Add New Class"}
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Class name * (e.g., JSS 1, SS 2)"
          />
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.classGroupId}
            onChange={(e) => setForm((prev) => ({ ...prev, classGroupId: e.target.value }))}
          >
            <option value="">Select class group (optional)</option>
            {classGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Class" : "Create Class"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Classes Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Classes ({filteredClasses.length} of {classes.length})
        </h3>
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No classes found.</p>
          ) : (
            filteredClasses.map((cls) => (
              <div key={cls.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{cls.name}</h4>
                    <p className="text-xs text-slate-500">
                      {cls.classGroupName ? `Group: ${cls.classGroupName}` : "No group assigned"}
                      {" • "}
                      {cls.teacherName ? `Teacher: ${cls.teacherName}` : "No class teacher"}
                      {" • "}
                      {cls.studentCount} students
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(cls)}>
                      Edit
                    </Button>
                    {cls.studentCount === 0 && (
                      <Button size="sm" variant="outline" onClick={() => handleDelete(cls.id, cls.name)}>
                        Delete
                      </Button>
                    )}
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={cls.teacherId ?? ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          void handleAssignTeacher(cls.id, e.target.value);
                        }
                      }}
                    >
                      <option value="">{cls.teacherId ? "Change teacher..." : "Assign teacher..."}</option>
                      {teachers
                        .filter((t) => t.id !== cls.teacherId)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Arms Section */}
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">Arms:</span>
                    {cls.arms.filter((a) => a.isActive).length === 0 ? (
                      <span className="text-xs text-slate-400">No arms</span>
                    ) : (
                      cls.arms
                        .filter((a) => a.isActive)
                        .map((arm) => (
                          <span
                            key={arm.id}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs"
                          >
                            {arm.name}
                            <button
                              onClick={() => handleRemoveArm(cls.id, arm.name)}
                              className="text-rose-500 hover:text-rose-700"
                              title="Remove arm"
                            >
                              ×
                            </button>
                          </span>
                        ))
                    )}
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        placeholder="New arm (e.g., A, B)"
                        value={addingArmForClass === cls.id ? newArmName : ""}
                        onChange={(e) => {
                          setAddingArmForClass(cls.id);
                          setNewArmName(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleAddArm(cls.id);
                          }
                        }}
                        className="h-7 w-32 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleAddArm(cls.id)}
                        disabled={addingArmForClass === cls.id && !newArmName.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">Subjects:</span>
                    {cls.subjects.length === 0 ? (
                      <span className="text-xs text-slate-400">No subjects</span>
                    ) : (
                      cls.subjects.map((subj) => (
                        <span
                          key={subj.id}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs"
                        >
                          {subj.name}
                          <button
                            onClick={() => handleRemoveSubject(cls.id, subj.id)}
                            className="text-rose-500 hover:text-rose-700"
                            title="Remove subject"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                    {getUnassignedSubjects(cls).length > 0 && (
                      <select
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        onChange={(e) => {
                          if (e.target.value) {
                            void handleAssignSubject(cls.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        value=""
                      >
                        <option value="">+ Add subject...</option>
                        {getUnassignedSubjects(cls).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
