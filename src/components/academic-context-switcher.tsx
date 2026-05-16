"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type SessionDto = { id: string; name: string };
type TermDto = { id: string; name: string; sessionId: string };

export function AcademicContextSwitcher({
  sessions,
  terms,
  initialSessionId,
  initialTermId,
}: {
  sessions: SessionDto[];
  terms: TermDto[];
  initialSessionId?: string | null;
  initialTermId?: string | null;
}) {
  const [sessionId, setSessionId] = useState(initialSessionId ?? "");
  const [termId, setTermId] = useState(initialTermId ?? "");
  const [message, setMessage] = useState("");

  const scopedTerms = useMemo(() => terms.filter((item) => !sessionId || item.sessionId === sessionId), [terms, sessionId]);

  async function save() {
    const response = await fetch("/api/context/session-term", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId || undefined, termId: termId || undefined }),
    });

    if (response.ok) {
      setMessage("Context saved");
      window.location.reload();
      return;
    }

    setMessage("Unable to save context");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        value={sessionId}
        onChange={(event) => {
          setSessionId(event.target.value);
          setTermId("");
        }}
      >
        <option value="">Session</option>
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>{session.name}</option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        value={termId}
        onChange={(event) => setTermId(event.target.value)}
      >
        <option value="">Term</option>
        {scopedTerms.map((term) => (
          <option key={term.id} value={term.id}>{term.name}</option>
        ))}
      </select>

      <Button size="sm" variant="outline" onClick={save}>
        Apply
      </Button>
      {message ? <span className="text-[11px] text-slate-500">{message}</span> : null}
    </div>
  );
}
