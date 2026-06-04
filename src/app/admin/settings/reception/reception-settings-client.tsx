"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Save, RotateCcw, AlertCircle, CheckCircle2, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";

type ConfigSection = {
  id: string;
  label: string;
  prefix: string;
  digit: number;
  suffix: string;
};

type ListItem = {
  id: string;
  name: string;
  description?: string;
};

type ReceptionConfig = {
  enquiry: ConfigSection;
  visitorLog: ConfigSection;
  gatePass: ConfigSection;
  complaint: ConfigSection;
  callLog: ConfigSection;
  correspondence: ConfigSection;
  query: ConfigSection;
  enquiryStages: ListItem[];
  enquiryTypes: ListItem[];
  enquirySources: ListItem[];
  callingPurposes: ListItem[];
  visitingPurposes: ListItem[];
  complaintTypes: ListItem[];
  gatePassPurposes: ListItem[];
};

const defaultConfig: ReceptionConfig = {
  enquiry: { id: "enquiry", label: "Enquiry", prefix: "RESM", digit: 3, suffix: "" },
  visitorLog: { id: "visitorLog", label: "Visitor Log", prefix: "RVLSM", digit: 3, suffix: "" },
  gatePass: { id: "gatePass", label: "Gate Pass", prefix: "RGPSM", digit: 3, suffix: "" },
  complaint: { id: "complaint", label: "Complaint", prefix: "RCSM", digit: 3, suffix: "" },
  callLog: { id: "callLog", label: "Call Log", prefix: "RCLSM", digit: 3, suffix: "" },
  correspondence: { id: "correspondence", label: "Correspondence", prefix: "RCRSM", digit: 3, suffix: "" },
  query: { id: "query", label: "Query", prefix: "RQSM", digit: 3, suffix: "" },
  enquiryStages: [{ id: "1", name: "New" }, { id: "2", name: "In Progress" }, { id: "3", name: "Resolved" }],
  enquiryTypes: [{ id: "1", name: "General" }, { id: "2", name: "Admission" }, { id: "3", name: "Fee" }],
  enquirySources: [{ id: "1", name: "Walk-in" }, { id: "2", name: "Phone" }, { id: "3", name: "Email" }],
  callingPurposes: [{ id: "1", name: "Enquiry" }, { id: "2", name: "Complaint" }, { id: "3", name: "Follow-up" }],
  visitingPurposes: [{ id: "1", name: "Meeting" }, { id: "2", name: "Interview" }, { id: "3", name: "Delivery" }],
  complaintTypes: [{ id: "1", name: "Academic" }, { id: "2", name: "Administrative" }, { id: "3", name: "Facility" }],
  gatePassPurposes: [{ id: "1", name: "Early Exit" }, { id: "2", name: "Late Entry" }, { id: "3", name: "Visitor" }],
};

export function ReceptionSettingsClient({ schoolId }: { schoolId: string }) {
  const [config, setConfig] = useState<ReceptionConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["numbering"]);

  // List management state
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/settings/reception?schoolId=${schoolId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config });
        }
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, [schoolId]);


  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/settings/reception", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, config }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStatus("Configuration saved successfully.");
    } catch {
      setStatus("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  function updateSection(section: keyof ReceptionConfig, field: keyof ConfigSection, value: string | number) {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as ConfigSection),
        [field]: value
      }
    }));
  }

  function addListItem(listKey: keyof ReceptionConfig) {
    const name = newItems[listKey]?.trim();
    if (!name) return;
    
    setConfig(prev => ({
      ...prev,
      [listKey]: [
        ...(prev[listKey] as ListItem[]),
        { id: Date.now().toString(), name }
      ]
    }));
    setNewItems(prev => ({ ...prev, [listKey]: "" }));
  }

  function removeListItem(listKey: keyof ReceptionConfig, id: string) {
    setConfig(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as ListItem[]).filter(item => item.id !== id)
    }));
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  // Load on first render
  if (loading) {
    loadConfig();
    return <div className="text-slate-500">Loading configuration...</div>;
  }

  const numberingSections: (keyof ReceptionConfig)[] = ["enquiry", "visitorLog", "gatePass", "complaint", "callLog", "correspondence", "query"];

  const listSections = [
    { key: "enquiryStages", label: "Enquiry Stage" },
    { key: "enquiryTypes", label: "Enquiry Type" },
    { key: "enquirySources", label: "Enquiry Source" },
    { key: "callingPurposes", label: "Calling Purpose" },
    { key: "visitingPurposes", label: "Visiting Purpose" },
    { key: "complaintTypes", label: "Complaint Type" },
    { key: "gatePassPurposes", label: "Gate Pass Purpose" },
  ] as { key: keyof ReceptionConfig; label: string }[];

  return (
    <div className="space-y-6">
      {status && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm flex items-center gap-2",
          status.includes("successfully") 
            ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
            : "border-rose-200 bg-rose-50 text-rose-700"
        )}>
          {status.includes("successfully") ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status}
        </div>
      )}

      {/* Numbering Config */}
      <div className="rounded-lg border border-slate-200">
        <button 
          onClick={() => toggleExpanded("numbering")}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border-b border-slate-200"
        >
          <span className="font-medium text-slate-900">Numbering Configuration</span>
          {expanded.includes("numbering") ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        {expanded.includes("numbering") && (
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              {numberingSections.map((section) => {
                const data = config[section] as ConfigSection;
                return (
                  <div key={section} className="space-y-3">
                    <span className="text-sm font-medium text-slate-700">{data.label} Number</span>
                    <div className="space-y-2">
                      <Input 
                        value={data.prefix}
                        onChange={(e) => updateSection(section, "prefix", e.target.value)}
                        placeholder="Prefix"
                        className="text-sm"
                      />
                      <Input 
                        type="number"
                        value={data.digit}
                        onChange={(e) => updateSection(section, "digit", parseInt(e.target.value) || 3)}
                        placeholder="Digits"
                        className="text-sm"
                      />
                      <Input 
                        value={data.suffix}
                        onChange={(e) => updateSection(section, "suffix", e.target.value)}
                        placeholder="Suffix (optional)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* List Configurations */}
      <div className="grid gap-4 md:grid-cols-2">
        {listSections.map(({ key, label }) => {
          const items = config[key] as ListItem[];
          return (
            <div key={key} className="rounded-lg border border-slate-200">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="font-medium text-slate-900">{label}</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Input 
                    value={newItems[key] || ""}
                    onChange={(e) => setNewItems(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Add ${label.toLowerCase()}...`}
                    className="text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addListItem(key)}
                  />
                  <Button size="sm" onClick={() => addListItem(key)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded text-sm">
                      <span>{item.name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                        onClick={() => removeListItem(key, item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          You can use %DAY%, %DAY_SHORT%, %MONTH%, %MONTH_NUMBER%, %MONTH_NUMBER_SHORT%, %MONTH_SHORT%, %YEAR%, %YEAR_SHORT% placeholders in prefixes and suffixes.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Configuration</>}
        </Button>
        <Button variant="outline" onClick={() => { setConfig(defaultConfig); setStatus(""); }}>
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
