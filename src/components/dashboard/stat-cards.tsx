"use client";

import { getKeyMetrics } from "@/lib/demo-data";
import { Users, UserMinus, Clock, AlertTriangle, Briefcase, Smile } from "lucide-react";

const metricsConfig = [
  { key: "activeEmployees", label: "Active Employees", icon: Users, format: (v: number) => v.toString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50", tooltip: "Total number of employees currently marked as active across all departments." },
  { key: "turnoverRate", label: "Turnover Rate", icon: UserMinus, format: (v: number) => `${v}%`, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", tooltip: "Percentage of employees who left (voluntarily or involuntarily) in the selected period." },
  { key: "atRiskCount", label: "At-Risk Employees", icon: AlertTriangle, format: (v: number) => v.toString(), color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", tooltip: "Active employees with an attrition risk score above 45. Reviews recommended." },
  { key: "avgTenureMonths", label: "Avg Tenure", icon: Clock, format: (v: number) => `${Math.floor(v / 12)}y ${v % 12}m`, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", tooltip: "Average number of months active employees have been with the company." },
  { key: "openPositions", label: "Open Positions", icon: Briefcase, format: (v: number) => v.toString(), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", tooltip: "Current number of unfilled job requisitions across all departments." },
  { key: "eNPS", label: "eNPS Score", icon: Smile, format: (v: number) => v.toString(), color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/50", tooltip: "Employee Net Promoter Score. Ranges from -100 to +100. Above 30 is considered good." },
];

interface StatCardsProps {
  metrics?: Record<string, number>;
}

export function StatCards({ metrics: externalMetrics }: StatCardsProps) {
  const demoMetrics = getKeyMetrics();
  const metrics = externalMetrics ?? demoMetrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsConfig.map(({ key, label, icon: Icon, format, color, bg, tooltip }) => {
        const value = metrics[key as keyof typeof metrics] as number;
        return (
          <div
            key={key}
            title={tooltip}
            className="relative group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{format(value)}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-10 pointer-events-none shadow-lg">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45 -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
