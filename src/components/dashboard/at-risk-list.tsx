import { getAtRiskEmployees } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight } from "lucide-react";

const riskColor = (score: number) => {
  if (score >= 70) return { bar: "bg-red-500", text: "text-red-700 dark:text-red-400", badge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400" };
  if (score >= 50) return { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" };
  return { bar: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400", badge: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400" };
};

export function AtRiskList() {
  const employees = getAtRiskEmployees();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Employés à risque</h3>
        <button className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium">
          Voir tout
        </button>
      </div>
      <div className="space-y-3">
        {employees.map((emp) => {
          const risk = emp.attritionRisk!;
          const colors = riskColor(risk.score);
          return (
            <div key={emp.id} className="flex items-center gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{emp.name}</p>
                <p className="text-xs text-zinc-500 truncate">{emp.position} · {emp.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", colors.bar)} style={{ width: `${risk.score}%` }} />
                </div>
                <span className={cn("text-xs font-bold min-w-[2rem] text-right", colors.text)}>{risk.score}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
