import { getDepartmentStats, DepartmentStat } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function DepartmentTable() {
  const data = getDepartmentStats();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Department Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Department</th>
              <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Headcount</th>
              <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Turnover</th>
              <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Tenure</th>
              <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Salary</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dept) => (
              <tr key={dept.name} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{dept.name}</td>
                <td className="py-2.5 text-right text-zinc-600 dark:text-zinc-400">{dept.headcount}</td>
                <td className="py-2.5 text-right">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    dept.turnoverRate > 15 ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                    dept.turnoverRate > 8 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  )}>
                    {dept.turnoverRate}%
                  </span>
                </td>
                <td className="py-2.5 text-right text-zinc-600 dark:text-zinc-400">{Math.floor(dept.avgTenure / 12)}y {dept.avgTenure % 12}m</td>
                <td className="py-2.5 text-right text-zinc-600 dark:text-zinc-400">${(dept.avgSalary / 1000).toFixed(0)}K</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
