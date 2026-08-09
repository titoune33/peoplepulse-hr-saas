"use client";

import { useState, useEffect, useCallback } from "react";
import { HRISStatus } from "@/components/dashboard/hris-status";
import { getAIInsights } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { apiGetInsights, Insight } from "@/lib/api";
import { Zap, AlertTriangle, Info, ThumbsUp, TrendingUp, Shield, Users, DollarSign, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig = {
  high: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-800", label: "Priorité élevée" },
  medium: { icon: Info, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800", label: "Priorité moyenne" },
  low: { icon: ThumbsUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800", label: "Priorité basse" },
};

const categories = [
  { key: "All", label: "Toutes les analyses", icon: Zap },
  { key: "high", label: "Priorité élevée", icon: AlertTriangle },
  { key: "medium", label: "Moyenne", icon: Info },
  { key: "low", label: "Signaux positifs", icon: ThumbsUp },
];

export default function InsightsPage() {
  const { token } = useAuth();
  const demoInsights = getAIInsights();
  const [insights, setInsights] = useState<Insight[]>(demoInsights);
  const [filter, setFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetInsights();
      if (res.success && res.data.insights.length > 0) {
        setInsights(res.data.insights);
      }
    } catch {
      setError("Backend indisponible. Affichage des analyses de démonstration.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (!token) {
      setInsights(demoInsights);
      setError(null);
    }
  }, [token, demoInsights]);

  const filtered = filter === "All" ? insights : insights.filter((i) => i.severity === filter);

  const highCount = insights.filter((i) => i.severity === "high").length;
  const mediumCount = insights.filter((i) => i.severity === "medium").length;

  return (
    <div className="min-h-full">
      <HRISStatus />
      <div className="p-6 max-w-[1000px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Analyses IA</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {highCount} élevées · {mediumCount} moyennes · {insights.length} au total
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin inline ml-2 text-zinc-400" />}
            </p>
          </div>
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Lancer l'analyse
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                filter === key
                  ? "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/50 dark:border-violet-800 dark:text-violet-300"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {key !== "All" && (
                <span className="text-[10px] opacity-60">({insights.filter((i) => i.severity === key).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Insights List */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Aucune analyse pour cette catégorie</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Essayez de sélectionner un autre filtre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((insight) => {
              const { icon: Icon, color, bg, border, label } = severityConfig[insight.severity] || severityConfig.medium;
              return (
                <div key={insight.id} className={cn("bg-white dark:bg-zinc-900 rounded-xl border p-5", border)}>
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{insight.title}</h3>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", bg, color)}>{label}</span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{insight.description}</p>
                      <div className="mt-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
                        <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                          Action recommandée : {insight.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Modèle</span>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {token ? "Hugging Face AI" : "Claude Opus 5"}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Mis à jour toutes les 24 heures</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sources de données</span>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">147 employés</p>
            <p className="text-xs text-zinc-500 mt-0.5">Via BambooHR, Paylocity, Workday</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Dernière analyse</span>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{token ? "À l'instant" : "Il y a 2 heures"}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{insights.length} analyses générées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
