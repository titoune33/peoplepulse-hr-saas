"use client";

import { getAIInsights } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, Info, ThumbsUp, Crown, Lock } from "lucide-react";
import Link from "next/link";
import { Insight } from "@/lib/api";

const severityIcons = {
  high: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-800" },
  medium: { icon: Info, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800" },
  low: { icon: ThumbsUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800" },
};

interface AIInsightsProps {
  apiInsights?: Insight[];
  isPro?: boolean;
}

export function AIInsights({ apiInsights, isPro }: AIInsightsProps) {
  const demoInsights = getAIInsights();
  const insights = apiInsights && apiInsights.length > 0 ? apiInsights : demoInsights;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Insights IA</h3>
        {isPro ? (
          <span className="text-[10px] text-zinc-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full font-medium border border-amber-200 dark:border-amber-800">
            <Crown className="w-2.5 h-2.5 inline mr-0.5 text-amber-500" />
            Pro
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full font-medium">
            Données démo
          </span>
        )}
      </div>

      {!isPro && !apiInsights ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Les insights IA sont une fonctionnalité Pro</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            Passez à Pro pour des insights boostés par l'IA
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight) => {
            const { icon: Icon, color, bg, border } = severityIcons[insight.severity] || severityIcons.medium;
            return (
              <div key={insight.id} className={cn("border rounded-lg p-3", border, bg)}>
                <div className="flex items-start gap-2.5">
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{insight.title}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{insight.description}</p>
                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-2">
                      {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
