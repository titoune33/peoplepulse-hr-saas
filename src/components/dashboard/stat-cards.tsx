"use client";

import { getKeyMetrics } from "@/lib/demo-data";
import { Users, UserMinus, Clock, AlertTriangle, Briefcase, Smile } from "lucide-react";

const metricsConfig = [
  { key: "activeEmployees", label: "Employés actifs", icon: Users, format: (v: number) => v.toString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50", tooltip: "Nombre total d'employés actuellement marqués comme actifs dans tous les départements." },
  { key: "turnoverRate", label: "Taux de turnover", icon: UserMinus, format: (v: number) => `${v}%`, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", tooltip: "Pourcentage d'employés ayant quitté l'entreprise (volontairement ou non) durant la période sélectionnée." },
  { key: "atRiskCount", label: "Employés à risque", icon: AlertTriangle, format: (v: number) => v.toString(), color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", tooltip: "Employés actifs avec un score de risque d'attrition supérieur à 45. Entretiens recommandés." },
  { key: "avgTenureMonths", label: "Ancienneté moy.", icon: Clock, format: (v: number) => `${Math.floor(v / 12)}y ${v % 12}m`, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", tooltip: "Nombre moyen de mois d'ancienneté des employés actifs." },
  { key: "openPositions", label: "Postes ouverts", icon: Briefcase, format: (v: number) => v.toString(), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", tooltip: "Nombre actuel de postes à pourvoir dans tous les départements." },
  { key: "eNPS", label: "Score eNPS", icon: Smile, format: (v: number) => v.toString(), color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/50", tooltip: "Score Net Promoter Employé. Varie de -100 à +100. Au-dessus de 30 est considéré comme bon." },
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
