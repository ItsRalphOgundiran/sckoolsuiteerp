"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SetupStep = "profile" | "academic" | "review";

interface SchoolProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  motto: string;
}

interface AcademicContext {
  sessions: Array<{ id: string; name: string; startDate?: string; endDate?: string }>;
  terms: Array<{ id: string; name: string; sessionId: string; startDate?: string; endDate?: string }>;
  currentSessionId?: string;
  currentTermId?: string;
}

export function SimpleSetupClient() {
  const [activeStep, setActiveStep] = useState<SetupStep>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // School Profile State
  const [profile, setProfile] = useState<SchoolProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    motto: "",
  });
  
  // Academic State
  const [academic, setAcademic] = useState<AcademicContext>({
    sessions: [],
    terms: [],
    currentSessionId: "",
    currentTermId: "",
  });
  
  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/setup/load");
        if (res.ok) {
          const data = await res.json();
          
          // Merge school profile - don't override existing
          if (data.school) {
            setProfile(prev => ({
              ...prev,
              name: data.school.name || prev.name,
              email: data.school.email || prev.email,
              phone: data.school.phone || prev.phone,
              address: data.school.address || prev.address,
              website: data.school.website || prev.website,
              motto: data.school.motto || prev.motto,
            }));
          }
          
          // Merge academic data - don't override existing
          if (data.academic) {
            setAcademic(prev => ({
              sessions: data.academic.sessions?.length ? data.academic.sessions : prev.sessions,
              terms: data.academic.terms?.length ? data.academic.terms : prev.terms,
              currentSessionId: data.academic.currentSessionId || prev.currentSessionId,
              currentTermId: data.academic.currentTermId || prev.currentTermId,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load setup data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  
  const steps = [
    { id: "profile" as SetupStep, label: "School Profile", icon: School },
    { id: "academic" as SetupStep, label: "Academic Session", icon: Calendar },
    { id: "review" as SetupStep, label: "Review & Activate", icon: CheckCircle },
  ];
  
  const currentStepIndex = steps.findIndex(s => s.id === activeStep);
  
  function updateProfile(field: keyof SchoolProfile, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }
  
  function addSession() {
    const newSession = {
      id: `session-${Date.now()}`,
      name: `Session ${academic.sessions.length + 1}`,
      startDate: "",
      endDate: "",
    };
    setAcademic(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
  }
  
  function addTerm() {
    const sessionId = academic.currentSessionId || academic.sessions[0]?.id;
    if (!sessionId) {
      setMessage("Please create a session first");
      return;
    }
    const newTerm = {
      id: `term-${Date.now()}`,
      name: `Term ${academic.terms.filter(t => t.sessionId === sessionId).length + 1}`,
      sessionId,
      startDate: "",
      endDate: "",
    };
    setAcademic(prev => ({
      ...prev,
      terms: [...prev.terms, newTerm],
    }));
  }
  
  function updateSession(id: string, field: keyof AcademicContext["sessions"][0], value: string) {
    setAcademic(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  }
  
  function updateTerm(id: string, field: keyof AcademicContext["terms"][0], value: string) {
    setAcademic(prev => ({
      ...prev,
      terms: prev.terms.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  }
  
  async function saveStep() {
    setSaving(true);
    setMessage("");
    try {
      const payload = activeStep === "profile" 
        ? { step: "school-profile", data: { profile } }
        : { step: "academic-setup", data: { academic } };
      
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        setMessage("Saved successfully!");
        if (currentStepIndex < steps.length - 1) {
          setActiveStep(steps[currentStepIndex + 1].id);
        }
      } else {
        setMessage(responseData.error || "Failed to save");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setSaving(false);
    }
  }
  
  async function activateSchool() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/setup/activate", {
        method: "POST",
      });
      
      if (res.ok) {
        setMessage("School activated successfully!");
        window.location.href = "/admin/dashboard";
      } else {
        const error = await res.json();
        setMessage(error.error || "Failed to activate");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setSaving(false);
    }
  }
  
  function validateStep(): boolean {
    if (activeStep === "profile") {
      if (!profile.name.trim()) {
        setMessage("School name is required");
        return false;
      }
      if (!profile.email.trim()) {
        setMessage("School email is required");
        return false;
      }
    }
    if (activeStep === "academic") {
      if (academic.sessions.length === 0) {
        setMessage("Please create at least one academic session. Click the '+ Add Session' button to create a session.");
        return false;
      }
      // Validate session fields
      for (const session of academic.sessions) {
        if (!session.name.trim()) {
          setMessage(`Please enter a name for the session`);
          return false;
        }
        if (!session.startDate) {
          setMessage(`Please select a start date for session "${session.name || 'Untitled'}"`);
          return false;
        }
        if (!session.endDate) {
          setMessage(`Please select an end date for session "${session.name || 'Untitled'}"`);
          return false;
        }
      }
      if (academic.terms.length === 0) {
        setMessage("Please create at least one term. Click the '+ Add Term' button to create a term.");
        return false;
      }
      // Validate term fields
      for (const term of academic.terms) {
        if (!term.name.trim()) {
          setMessage(`Please enter a name for the term`);
          return false;
        }
        if (!term.startDate) {
          setMessage(`Please select a start date for term "${term.name || 'Untitled'}"`);
          return false;
        }
        if (!term.endDate) {
          setMessage(`Please select an end date for term "${term.name || 'Untitled'}"`);
          return false;
        }
      }
      if (!academic.currentSessionId) {
        setMessage("Please select a 'Current Session' from the dropdown below");
        return false;
      }
      if (!academic.currentTermId) {
        setMessage("Please select a 'Current Term' from the dropdown below");
        return false;
      }
    }
    return true;
  }
  
  function handleNext() {
    if (!validateStep()) return;
    void saveStep();
  }
  
  function goToStep(index: number) {
    setActiveStep(steps[index].id);
    setMessage("");
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-xl bg-white p-4 border border-slate-200">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">School Setup</h2>
          <span className="text-xs font-medium text-slate-600">Step {currentStepIndex + 1} of {steps.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div 
            className="h-2 rounded-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} 
          />
        </div>
      </div>
      
      {/* Step Navigation */}
      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="space-y-1">
            {steps.map((step, index) => {
              const isActive = step.id === activeStep;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors flex items-center gap-2",
                    isActive 
                      ? "bg-indigo-600 text-white" 
                      : isCompleted 
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {step.label}
                </button>
              );
            })}
          </div>
        </aside>
        
        {/* Step Content */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {message && (
            <div className={cn(
              "mb-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2",
              message.includes("success") 
                ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}>
              {message.includes("success") ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message}
            </div>
          )}
          
          {/* Step 1: School Profile */}
          {activeStep === "profile" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">School Profile</h3>
              <p className="text-sm text-slate-500">Enter your school&apos;s basic information. This will be used across the system.</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label>
                  <Input 
                    value={profile.name} 
                    onChange={(e) => updateProfile("name", e.target.value)}
                    placeholder="e.g., Springfield High School"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Email *</label>
                  <Input 
                    type="email"
                    value={profile.email} 
                    onChange={(e) => updateProfile("email", e.target.value)}
                    placeholder="e.g., info@school.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <Input 
                    value={profile.phone} 
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    placeholder="e.g., +234 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <Input 
                    value={profile.website} 
                    onChange={(e) => updateProfile("website", e.target.value)}
                    placeholder="e.g., www.school.edu"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <Input 
                    value={profile.address} 
                    onChange={(e) => updateProfile("address", e.target.value)}
                    placeholder="Full school address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Motto</label>
                  <Input 
                    value={profile.motto} 
                    onChange={(e) => updateProfile("motto", e.target.value)}
                    placeholder="e.g., Excellence in Education"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Academic Session */}
          {activeStep === "academic" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Academic Sessions</h3>
                <p className="text-sm text-slate-500">Create academic sessions and terms. Select which ones are currently active.</p>
              </div>
              
              {/* Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Sessions</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addSession}>
                    + Add Session
                  </Button>
                </div>
                {academic.sessions.length === 0 ? (
                  <p className="text-sm text-slate-400">No sessions created yet. Click &quot;Add Session&quot; to create one.</p>
                ) : (
                  <div className="space-y-2">
                    {academic.sessions.map((session) => (
                      <div key={session.id} className="grid gap-2 md:grid-cols-3 items-end p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Session Name *</label>
                          <Input 
                            value={session.name} 
                            onChange={(e) => updateSession(session.id, "name", e.target.value)}
                            placeholder="e.g., 2024/2025"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Start Date *</label>
                          <Input 
                            type="date"
                            value={session.startDate} 
                            onChange={(e) => updateSession(session.id, "startDate", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">End Date *</label>
                          <Input 
                            type="date"
                            value={session.endDate} 
                            onChange={(e) => updateSession(session.id, "endDate", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Terms */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Terms</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addTerm}>
                    + Add Term
                  </Button>
                </div>
                {academic.terms.length === 0 ? (
                  <p className="text-sm text-slate-400">No terms created yet. Click &quot;Add Term&quot; to create one.</p>
                ) : (
                  <div className="space-y-2">
                    {academic.terms.map((term) => (
                      <div key={term.id} className="grid gap-2 md:grid-cols-4 items-end p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Term Name *</label>
                          <Input 
                            value={term.name} 
                            onChange={(e) => updateTerm(term.id, "name", e.target.value)}
                            placeholder="e.g., First Term"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Session</label>
                          <select 
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                            value={term.sessionId}
                            onChange={(e) => updateTerm(term.id, "sessionId", e.target.value)}
                          >
                            {academic.sessions.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Start Date *</label>
                          <Input 
                            type="date"
                            value={term.startDate} 
                            onChange={(e) => updateTerm(term.id, "startDate", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">End Date *</label>
                          <Input 
                            type="date"
                            value={term.endDate} 
                            onChange={(e) => updateTerm(term.id, "endDate", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Current Selection */}
              <div className="grid gap-4 md:grid-cols-2 p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Current Session *</label>
                  <select 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                    value={academic.currentSessionId}
                    onChange={(e) => setAcademic(prev => ({ ...prev, currentSessionId: e.target.value }))}
                  >
                    <option value="">Select current session</option>
                    {academic.sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Current Term *</label>
                  <select 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                    value={academic.currentTermId}
                    onChange={(e) => setAcademic(prev => ({ ...prev, currentTermId: e.target.value }))}
                  >
                    <option value="">Select current term</option>
                    {academic.terms
                      .filter(t => !academic.currentSessionId || t.sessionId === academic.currentSessionId)
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Review & Activate */}
          {activeStep === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Review & Activate</h3>
                <p className="text-sm text-slate-500">Review your school information before activation. All other settings can be configured later in Settings.</p>
              </div>
              
              <div className="space-y-4">
                {/* School Profile Summary */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <School className="h-4 w-4" />
                    School Profile
                  </h4>
                  <dl className="grid gap-1 text-sm">
                    <div className="flex gap-2"><dt className="text-slate-500">Name:</dt><dd className="font-medium">{profile.name || "-"}</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Email:</dt><dd>{profile.email || "-"}</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Phone:</dt><dd>{profile.phone || "-"}</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Address:</dt><dd>{profile.address || "-"}</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Motto:</dt><dd>{profile.motto || "-"}</dd></div>
                  </dl>
                </div>
                
                {/* Academic Summary */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Academic Setup
                  </h4>
                  <dl className="grid gap-1 text-sm">
                    <div className="flex gap-2"><dt className="text-slate-500">Sessions:</dt><dd className="font-medium">{academic.sessions.length} created</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Terms:</dt><dd>{academic.terms.length} created</dd></div>
                    <div className="flex gap-2"><dt className="text-slate-500">Current:</dt><dd className="font-medium text-emerald-600">
                      {academic.sessions.find(s => s.id === academic.currentSessionId)?.name || "-"} • {academic.terms.find(t => t.id === academic.currentTermId)?.name || "-"}
                    </dd></div>
                  </dl>
                </div>
                
                {/* Next Steps Info */}
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <h4 className="font-medium text-amber-900 mb-2">What&apos;s Next?</h4>
                  <p className="text-sm text-amber-800 mb-2">
                    After activation, you can configure additional settings in the Settings menu:
                  </p>
                  <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                    <li>Master Data (Classes, Arms, Subjects)</li>
                    <li>Grading & Assessment Settings</li>
                    <li>Finance & Fee Setup</li>
                    <li>Users & Roles</li>
                    <li>School Branding</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => goToStep(1)} disabled={saving}>
                  Back to Academic Setup
                </Button>
                <Button onClick={activateSchool} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? "Activating..." : "Activate School"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons (for steps 1 & 2) */}
          {activeStep !== "review" && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
              <Button 
                variant="outline" 
                onClick={() => goToStep(currentStepIndex - 1)} 
                disabled={currentStepIndex === 0 || saving}
              >
                Previous
              </Button>
              <Button onClick={handleNext} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
