"use client";

import { useState, useEffect, useCallback } from "react";
import { getEmployees, Employee } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { apiGetEmployees } from "@/lib/api";
import { HRISStatus } from "@/components/dashboard/hris-status";
import { Search, ArrowUpDown, ExternalLink, AlertCircle, Loader2, Users, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const departments = ["All", "Engineering", "Sales", "Marketing", "Product", "People", "Finance", "Design"];
const statuses = ["All", "active", "on_leave", "terminated"] as const;

export default function EmployeesPage() {
  const { token } = useAuth();
  const allEmployeesDemo = getEmployees();

  const [employees, setEmployees] = useState<Employee[]>(allEmployeesDemo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<keyof Employee | "attritionRisk.score">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchFromApi = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetEmployees({
        department: deptFilter !== "All" ? deptFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        search: search || undefined,
        limit: 200,
      });
      if (res.success) {
        setEmployees(res.data.employees as unknown as Employee[]);
      } else {
        setEmployees(allEmployeesDemo);
        setError("Impossible de charger depuis le backend. Affichage des données de démonstration.");
      }
    } catch {
      setEmployees(allEmployeesDemo);
      setError("Backend indisponible. Affichage des données de démonstration.");
    } finally {
      setIsLoading(false);
    }
  }, [token, deptFilter, statusFilter, search, allEmployeesDemo]);

  useEffect(() => {
    if (token) {
      fetchFromApi();
    }
  }, [token, fetchFromApi]);

  // Reset to demo data if not authenticated
  useEffect(() => {
    if (!token) {
      setEmployees(allEmployeesDemo);
      setError(null);
    }
  }, [token, allEmployeesDemo]);

  // Local filtering (used as fallback or for additional client-side filtering)
  const filtered = employees
    .filter((e) => {
      if (deptFilter !== "All" && e.department !== deptFilter) return false;
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.position.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortKey === "attritionRisk.score") {
        va = a.attritionRisk?.score ?? 0;
        vb = b.attritionRisk?.score ?? 0;
      } else {
        va = String(a[sortKey] ?? "");
        vb = String(b[sortKey] ?? "");
      }
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const allEmployees = employees.length > 0 ? employees : allEmployeesDemo;
  const activeCount = allEmployees.filter((e) => e.status === "active").length;
  const atRiskCount = allEmployees.filter((e) => e.attritionRisk && e.attritionRisk.score > 45).length;

  return (
    <div className="min-h-full">
      <HRISStatus />
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Employés</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {activeCount} actifs · {atRiskCount} à risque · {allEmployees.length} au total
            </p>
          </div>
          <button className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors">
            + Ajouter un employé
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={fetchFromApi} className="ml-auto text-xs font-medium underline hover:no-underline">
              Réessayer
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher des employés..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              aria-label="Rechercher des employés"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label="Filtrer par département"
          >
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label="Filtrer par statut"
          >
            {statuses.map((s) => {
              const statusLabels: Record<string, string> = { active: "Actif", on_leave: "En congé", terminated: "Terminé" };
              return <option key={s} value={s}>{s === "All" ? "Tous les statuts" : statusLabels[s] || s.replace("_", " ")}</option>;
            })}
          </select>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
          <span className="text-xs text-zinc-400">{filtered.length} résultats</span>
        </div>

        {/* Table */}
        {filtered.length === 0 && !isLoading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Aucun employé trouvé</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Essayez d'ajuster votre recherche ou vos filtres</p>
            <button
              onClick={() => { setSearch(""); setDeptFilter("All"); setStatusFilter("All"); }}
              className="mt-3 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Effacer tous les filtres
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    {[
                      { key: "name" as const, label: "Nom" },
                      { key: "department" as const, label: "Département" },
                      { key: "position" as const, label: "Poste" },
                      { key: "status" as const, label: "Statut" },
                      { key: "hireDate" as const, label: "Date d'embauche" },
                      { key: "attritionRisk.score" as const, label: "Risque" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 select-none"
                        aria-label={`Trier par ${label}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-10"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                              {emp.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-xs text-zinc-500">{emp.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{emp.department}</td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-sm">{emp.position}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          emp.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
                          emp.status === "on_leave" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        )}>
                          {emp.status === "on_leave" ? "En congé" : emp.status === "active" ? "Actif" : emp.status === "terminated" ? "Terminé" : emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-sm">{emp.hireDate}</td>
                      <td className="py-3 px-4">
                        {emp.attritionRisk ? (
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            emp.attritionRisk.score >= 70 ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                            emp.attritionRisk.score >= 50 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                            "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                          )}>
                            {emp.attritionRisk.score}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/employees/${emp.id}`} className="text-zinc-300 hover:text-violet-500 transition-colors" aria-label={`Voir ${emp.name}`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
