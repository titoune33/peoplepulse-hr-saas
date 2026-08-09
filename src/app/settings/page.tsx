"use client";

import { useState } from "react";
import { HRISStatus } from "@/components/dashboard/hris-status";
import { getHRISConnections } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { Settings2, Link2, Trash2, Plus, CheckCircle2, AlertCircle, RefreshCw, Key, Bell, Shield, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { token } = useAuth();
  const [connections, setConnections] = useState(getHRISConnections());

  return (
    <div className="min-h-full">
      <HRISStatus />
      <div className="p-6 max-w-[900px] mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your HRIS connections and account preferences</p>
        </div>

        {/* HRIS Connections */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">HRIS Connections</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Connect your HR platforms to unify data</p>
            </div>
            <button className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Connection
            </button>
          </div>

          <div className="space-y-3">
            {connections.map((c) => (
              <div key={c.provider} className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.provider}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "flex items-center gap-1 text-xs",
                        c.status === "connected" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
                      )}>
                        {c.status === "connected" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {c.status}
                      </span>
                      <span className="text-xs text-zinc-400">· {c.employees} employees · synced {c.lastSync}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors" aria-label={`Sync ${c.provider}`}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 transition-colors" aria-label={`Remove ${c.provider}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Key className="w-5 h-5 text-zinc-500" />
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">API Keys</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Manage access tokens for external integrations</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Production API Key</p>
                <p className="text-xs text-zinc-500 mt-0.5">Last used 2 hours ago</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-600">pp_live_••••••••••••••••</code>
                <button className="text-xs text-violet-600 hover:text-violet-700 font-medium">Regenerate</button>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Settings2 className="w-5 h-5 text-zinc-500" />
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Preferences</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Notification and data sync preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: Bell, label: "Weekly digest email", desc: "Get a summary of key metrics every Monday", checked: true },
              { icon: AlertCircle, label: "High-risk alerts", desc: "Instant notification when an employee risk score exceeds 70", checked: true },
              { icon: RefreshCw, label: "Auto-sync HRIS data", desc: "Automatically pull data from connected HRIS every 6 hours", checked: true },
              { icon: Globe, label: "GDPR compliance mode", desc: "Enable additional data anonymization for EU employees", checked: false },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between py-2">
                <div className="flex items-start gap-3">
                  <pref.icon className="w-4 h-4 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{pref.label}</p>
                    <p className="text-xs text-zinc-500">{pref.desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={pref.checked}
                  aria-label={`Toggle ${pref.label}`}
                  onClick={() => {
                    // In a real app this would toggle the preference
                  }}
                  className={cn(
                    "w-9 h-5 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/40",
                    pref.checked ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    pref.checked ? "left-[18px]" : "left-0.5"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
