"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
};

const audienceOptions = [
  { value: "ALL", label: "Everyone (All Users)" },
  { value: "STUDENTS", label: "Students Only" },
  { value: "PARENTS", label: "Parents Only" },
  { value: "TEACHERS", label: "Teachers Only" },
  { value: "STAFF", label: "Staff Only" },
  { value: "STUDENTS,PARENTS", label: "Students & Parents" },
  { value: "TEACHERS,STAFF", label: "Teachers & Staff" },
];

const emptyAnnouncement = {
  title: "",
  body: "",
  audience: "ALL",
};

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyAnnouncement);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements;
    const query = searchQuery.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.body.toLowerCase().includes(query) ||
        a.audience.toLowerCase().includes(query)
    );
  }, [announcements, searchQuery]);

  async function loadData() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/announcements", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload?.error ?? "Unable to load announcements.");
        return;
      }
      setAnnouncements(payload.announcements ?? []);
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

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to create announcement.");
        return;
      }

      setForm(emptyAnnouncement);
      setShowForm(false);
      setStatus("Announcement created successfully.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete announcement "${title}"? This cannot be undone.`)) {
      return;
    }

    setStatus("");
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload?.error ?? "Failed to delete announcement.");
        return;
      }

      setStatus("Announcement deleted.");
      await loadData();
    } catch {
      setStatus("An error occurred.");
    }
  }

  function getAudienceLabel(audience: string) {
    const option = audienceOptions.find((o) => o.value === audience);
    return option?.label ?? audience;
  }

  function getAudienceColor(audience: string) {
    if (audience === "ALL") return "bg-purple-100 text-purple-700";
    if (audience.includes("STUDENTS")) return "bg-blue-100 text-blue-700";
    if (audience.includes("PARENTS")) return "bg-emerald-100 text-emerald-700";
    if (audience.includes("TEACHERS")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading announcements...</div>;
  }

  return (
    <div className="space-y-4">
      {status && (
        <div className={`rounded-lg border px-3 py-2 text-sm ${status.includes("success") || status.includes("created") || status.includes("deleted") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {status}
        </div>
      )}

      {/* Search and Add */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by title, content, or audience..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Announcement"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Create New Announcement</h3>
          <div className="space-y-3">
            <Input
              placeholder="Announcement Title *"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.audience}
              onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
            >
              {audienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Announcement Content *"
              rows={6}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting || !form.title.trim() || !form.body.trim()}>
              {submitting ? "Publishing..." : "Publish Announcement"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Announcements ({filteredAnnouncements.length})
        </h3>
        <div className="space-y-3">
          {filteredAnnouncements.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No announcements yet. Create your first announcement!</p>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{announcement.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${getAudienceColor(announcement.audience)}`}>
                        {getAudienceLabel(announcement.audience)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{announcement.body}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Posted {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(announcement.id, announcement.title)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
