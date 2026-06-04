"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Setting up...");
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    fetch("/api/setup/auto", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("Setup complete!");
          if (data.credentials) {
            setCredentials(data.credentials);
          }
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setError(data.error || "Setup failed");
        }
      })
      .catch(err => {
        setError(err.message || "Network error");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Auto Setup</h1>
        
        {!error && !credentials && (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600">{status}</p>
            <p className="text-sm text-slate-500">Creating school, session, term, and admin user...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {credentials && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-left">
              <p className="text-emerald-700 font-medium mb-2">✓ Setup Complete!</p>
              <p className="text-sm text-slate-600 mb-3">Your school is ready. Login with:</p>
              <div className="bg-white rounded p-3 text-sm font-mono space-y-1">
                <p><strong>Email:</strong> {credentials.email}</p>
                <p><strong>Password:</strong> {credentials.password}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
